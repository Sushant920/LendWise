import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus, LoanType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(merchantId: string, dto: CreateApplicationDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const application = await this.prisma.application.create({
      data: {
        merchantId,
        loanType: dto.loanType as LoanType,
        status: 'draft',
        requestedAmount: dto.requestedAmount != null ? new Decimal(dto.requestedAmount) : undefined,
      },
      include: { merchant: { select: { id: true, email: true, name: true } } },
    });
    return this.serializeApplication(application);
  }

  async findAllByMerchant(merchantId: string) {
    const list = await this.prisma.application.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
      include: { merchant: { select: { id: true, name: true } } },
    });
    return list.map((a) => this.serializeApplication(a));
  }

  async findOne(id: string, merchantId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        documents: true,
        eligibilityScores: true,
        extractedFinancials: { orderBy: { createdAt: 'desc' }, take: 1 },
        merchant: { select: { id: true, email: true, name: true, businessName: true, industry: true, city: true, businessAgeMonths: true, monthlyRevenue: true } },
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.merchantId !== merchantId) {
      throw new ForbiddenException('Not allowed to access this application');
    }
    return this.serializeApplication(application);
  }

  async update(id: string, merchantId: string, dto: UpdateApplicationDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.merchantId !== merchantId) {
      throw new ForbiddenException('Not allowed to update this application');
    }
    if (application.status !== 'draft') {
      throw new BadRequestException('Can only update draft applications');
    }

    const merchantData: {
      businessName?: string;
      industry?: string;
      city?: string;
      businessAgeMonths?: number;
      monthlyRevenue?: Decimal;
    } = {};
    if (dto.businessName !== undefined) merchantData.businessName = dto.businessName;
    if (dto.industry !== undefined) merchantData.industry = dto.industry;
    if (dto.city !== undefined) merchantData.city = dto.city;
    if (dto.businessAgeMonths !== undefined) merchantData.businessAgeMonths = dto.businessAgeMonths;
    if (dto.monthlyRevenue !== undefined) merchantData.monthlyRevenue = new Decimal(dto.monthlyRevenue);

    if (Object.keys(merchantData).length > 0) {
      await this.prisma.merchant.update({
        where: { id: merchantId },
        data: merchantData,
      });
    }

    const appData: { loanType?: LoanType; requestedAmount?: Decimal; foundersCibilScore?: number } = {};
    if (dto.loanType !== undefined) appData.loanType = dto.loanType;
    if (dto.requestedAmount !== undefined) appData.requestedAmount = new Decimal(dto.requestedAmount);
    if (dto.foundersCibilScore !== undefined) appData.foundersCibilScore = dto.foundersCibilScore;

    const updated = await this.prisma.application.update({
      where: { id },
      data: appData,
      include: { merchant: { select: { id: true, name: true } } },
    });
    return this.serializeApplication(updated);
  }

  async submit(id: string, merchantId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { documents: true },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.merchantId !== merchantId) {
      throw new ForbiddenException('Not allowed to submit this application');
    }
    if (application.status !== 'draft') {
      throw new BadRequestException('Application already submitted');
    }
    const hasBankStatement = application.documents.some((d) => d.type === 'bank_statement');
    if (!hasBankStatement) {
      throw new BadRequestException('Bank statement is required before submit');
    }

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status: 'submitted' },
      include: { merchant: { select: { id: true, name: true } } },
    });
    return this.serializeApplication(updated);
  }

  private serializeApplication(a: {
    requestedAmount?: Decimal | null;
    merchant?: { monthlyRevenue?: Decimal | null; [k: string]: unknown };
    extractedFinancials?: { avgMonthlyRevenue?: Decimal }[];
    [key: string]: unknown;
  }): Record<string, unknown> {
    const out: Record<string, unknown> = { ...a };
    if (a.requestedAmount != null) out.requestedAmount = Number(a.requestedAmount);
    if (a.merchant && (a.merchant as { monthlyRevenue?: Decimal }).monthlyRevenue != null) {
      const m = { ...a.merchant };
      (m as Record<string, unknown>).monthlyRevenue = Number(
        (a.merchant as { monthlyRevenue: Decimal }).monthlyRevenue,
      );
      out.merchant = m;
    }
    const financials = a.extractedFinancials as { avgMonthlyRevenue?: Decimal }[] | undefined;
    if (financials?.[0]?.avgMonthlyRevenue != null) {
      out.avgMonthlyRevenue = Number(financials[0].avgMonthlyRevenue);
    }
    return out;
  }
}
