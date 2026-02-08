import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrisma = {
    merchant: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should throw ConflictException if email exists', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue({ id: '1', email: 'a@b.com' });
      await expect(
        service.signup({ email: 'a@b.com', password: 'password123', name: 'Test' }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrisma.merchant.create).not.toHaveBeenCalled();
    });

    it('should create merchant and return accessToken', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.merchant.create.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
        name: 'Test',
        role: 'merchant' as Role,
        createdAt: new Date(),
      });
      const result = await service.signup({
        email: 'a@b.com',
        password: 'password123',
        name: 'Test',
      });
      expect(result.merchant.email).toBe('a@b.com');
      expect(result.accessToken).toBe('mock-token');
      expect(mockPrisma.merchant.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
        passwordHash: 'hashed',
        name: 'Test',
        role: 'merchant',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return merchant and accessToken when credentials valid', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
        passwordHash: 'hashed',
        name: 'Test',
        role: 'merchant',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.login({
        email: 'a@b.com',
        password: 'password123',
      });
      expect(result.merchant.email).toBe('a@b.com');
      expect(result.accessToken).toBe('mock-token');
    });
  });
});
