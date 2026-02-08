import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
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
        role: 'merchant',
      },
      select: {
        id: true,
        email: true,
        name: true,
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

  async forgotPassword(_dto: ForgotPasswordDto) {
    return {
      message:
        'If this email is registered, you will receive a password reset link.',
    };
  }
}
