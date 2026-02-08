import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.merchant.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const merchant = await this.prisma.merchant.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        phone: dto.phone.replace(/\s/g, ''),
        role: 'merchant',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    const token = this.jwt.sign({
      sub: merchant.id,
      email: merchant.email,
      role: merchant.role,
    } as JwtPayload);
    return { merchant, accessToken: token };
  }

  async login(dto: LoginDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (
      !merchant ||
      !(await bcrypt.compare(dto.password, merchant.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const token = this.jwt.sign({
      sub: merchant.id,
      email: merchant.email,
      role: merchant.role,
    } as JwtPayload);
    return {
      merchant: {
        id: merchant.id,
        email: merchant.email,
        name: merchant.name,
        role: merchant.role,
      },
      accessToken: token,
    };
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.merchant.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    return user ?? null;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase();
    const merchant = await this.prisma.merchant.findUnique({
      where: { email },
    });
    if (!merchant) {
      return {
        message:
          'If this email is registered, you will receive a password reset link.',
      };
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
        merchantId: merchant.id,
      },
    });
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'LendWise <onboarding@resend.dev>',
            to: [email],
            subject: 'Reset your LendWise password',
            html: `<p>You requested a password reset. Click the link below (valid 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you didn't request this, ignore this email.</p>`,
          }),
        });
        if (!res.ok) {
          console.warn('Resend API error:', await res.text());
        }
      } catch (e) {
        console.warn('Failed to send reset email:', e);
      }
    } else {
      console.log('[Dev] Password reset link:', resetLink);
    }
    return {
      message:
        'If this email is registered, you will receive a password reset link.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
      include: { merchant: true },
    });
    if (!record || !record.merchant) {
      throw new BadRequestException('Invalid or expired reset link');
    }
    if (record.expiresAt < new Date()) {
      await this.prisma.passwordResetToken.delete({ where: { id: record.id } }).catch(() => {});
      throw new BadRequestException('Reset link has expired');
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.merchant.update({
      where: { id: record.merchant.id },
      data: { passwordHash },
    });
    await this.prisma.passwordResetToken.delete({ where: { id: record.id } });
    return { message: 'Password updated. You can sign in with your new password.' };
  }
}
