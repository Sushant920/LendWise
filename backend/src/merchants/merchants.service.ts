import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        industry: true,
        city: true,
        businessAgeMonths: true,
        monthlyRevenue: true,
        role: true,
        createdAt: true,
      },
    });
    if (!merchant) throw new NotFoundException('Merchant not found');
    return this.serializeMerchant(merchant);
  }

  async updateProfile(merchantId: string, dto: UpdateMerchantDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const data: {
      businessName?: string;
      industry?: string;
      city?: string;
      businessAgeMonths?: number;
      monthlyRevenue?: Decimal;
    } = {};
    if (dto.businessName !== undefined) data.businessName = dto.businessName;
    if (dto.industry !== undefined) data.industry = dto.industry;
    if (dto.city !== undefined) data.city = dto.city;
    if (dto.businessAgeMonths !== undefined) data.businessAgeMonths = dto.businessAgeMonths;
    if (dto.monthlyRevenue !== undefined) data.monthlyRevenue = new Decimal(dto.monthlyRevenue);

    const updated = await this.prisma.merchant.update({
      where: { id: merchantId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        industry: true,
        city: true,
        businessAgeMonths: true,
        monthlyRevenue: true,
        role: true,
        createdAt: true,
      },
    });
    return this.serializeMerchant(updated);
  }

  private serializeMerchant(m: {
    monthlyRevenue?: Decimal | null;
    [key: string]: unknown;
  }): Record<string, unknown> {
    const out: Record<string, unknown> = { ...m };
    if (m.monthlyRevenue != null) out.monthlyRevenue = Number(m.monthlyRevenue);
    return out;
  }
}
