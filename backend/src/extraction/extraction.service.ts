import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface ExtractedFinancialsResult {
  avgMonthlyRevenue: number;
  highestRevenue: number;
  lowestRevenue: number;
  avgBalance: number;
  revenueConsistency: string;
  cashFlowVolatility: string;
  transactionCount: number;
  negativeBalanceDays?: number;
  riskSummary?: string;
  inflowOutflowSummary?: Record<string, unknown>;
}

@Injectable()
export class ExtractionService {
  constructor(private readonly prisma: PrismaService) {}

  async extractForApplication(applicationId: string, merchantId: string): Promise<ExtractedFinancialsResult> {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { documents: true, merchant: true },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.merchantId !== merchantId) {
      throw new ForbiddenException('Not allowed to extract for this application');
    }
    const bankStatement = application.documents.find((d) => d.type === DocumentType.bank_statement);
    if (!bankStatement) {
      throw new BadRequestException('Bank statement document required for extraction');
    }

    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'processing' },
    });

    const mockResult = this.runMockExtraction(application.merchant?.monthlyRevenue);

    await this.prisma.extractedFinancials.deleteMany({
      where: { applicationId },
    });
    await this.prisma.extractedFinancials.create({
      data: {
        documentId: bankStatement.id,
        applicationId,
        avgMonthlyRevenue: new Decimal(mockResult.avgMonthlyRevenue),
        highestRevenue: new Decimal(mockResult.highestRevenue),
        lowestRevenue: new Decimal(mockResult.lowestRevenue),
        avgBalance: new Decimal(mockResult.avgBalance),
        revenueConsistency: mockResult.revenueConsistency,
        cashFlowVolatility: mockResult.cashFlowVolatility,
        transactionCount: mockResult.transactionCount,
        negativeBalanceDays: mockResult.negativeBalanceDays,
        riskSummary: mockResult.riskSummary,
        inflowOutflowSummary: (mockResult.inflowOutflowSummary ?? undefined) as object | undefined,
        rawResponse: mockResult as unknown as object,
      },
    });

    return mockResult;
  }

  private runMockExtraction(declaredMonthlyRevenue?: Decimal | null): ExtractedFinancialsResult {
    const declared = declaredMonthlyRevenue ? Number(declaredMonthlyRevenue) : 500000;
    const variance = 0.15;
    const avg = Math.round(declared * (0.9 + Math.random() * 0.2));
    const high = Math.round(avg * (1 + variance));
    const low = Math.round(avg * (1 - variance));
    const consistency = avg > 300000 ? (Math.random() > 0.3 ? 'High' : 'Medium') : 'Low';
    const volatility = consistency === 'High' ? 'Low' : consistency === 'Medium' ? 'Medium' : 'High';
    const negDays = volatility === 'High' ? Math.floor(Math.random() * 5) : 0;
    const riskSummary =
      negDays > 0
        ? 'Some negative balance days detected. Consider improving cash flow.'
        : 'Stable cash flow with consistent revenue.';

    return {
      avgMonthlyRevenue: avg,
      highestRevenue: high,
      lowestRevenue: low,
      avgBalance: Math.round(avg * 0.4),
      revenueConsistency: consistency,
      cashFlowVolatility: volatility,
      transactionCount: 80 + Math.floor(Math.random() * 120),
      negativeBalanceDays: negDays,
      riskSummary,
      inflowOutflowSummary: { avgInflow: avg, avgOutflow: Math.round(avg * 0.85) },
    };
  }
}
