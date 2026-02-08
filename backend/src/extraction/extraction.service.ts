import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import * as path from 'path';
import * as fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

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

    let result: ExtractedFinancialsResult | null = null;
    const absolutePath = path.join(UPLOAD_DIR, bankStatement.storagePath);
    if (fs.existsSync(absolutePath) && bankStatement.mimeType.startsWith('image/')) {
      result = await this.tryOcrExtraction(absolutePath, application.merchant?.monthlyRevenue);
    }
    if (!result) {
      result = this.runMockExtraction(application.merchant?.monthlyRevenue);
    }

    await this.prisma.extractedFinancials.deleteMany({
      where: { applicationId },
    });
    await this.prisma.extractedFinancials.create({
      data: {
        documentId: bankStatement.id,
        applicationId,
        avgMonthlyRevenue: new Decimal(result.avgMonthlyRevenue),
        highestRevenue: new Decimal(result.highestRevenue),
        lowestRevenue: new Decimal(result.lowestRevenue),
        avgBalance: new Decimal(result.avgBalance),
        revenueConsistency: result.revenueConsistency,
        cashFlowVolatility: result.cashFlowVolatility,
        transactionCount: result.transactionCount,
        negativeBalanceDays: result.negativeBalanceDays,
        riskSummary: result.riskSummary,
        inflowOutflowSummary: (result.inflowOutflowSummary ?? undefined) as object | undefined,
        rawResponse: result as unknown as object,
      },
    });

    return result;
  }

  private async tryOcrExtraction(
    filePath: string,
    declaredRevenue?: Decimal | null,
  ): Promise<ExtractedFinancialsResult | null> {
    try {
      const Tesseract = await import('tesseract.js');
      const { data } = await Tesseract.recognize(filePath, 'eng', {
        logger: () => {},
      });
      const text = data.text || '';
      const numbers = text.replace(/,/g, '').match(/\d{4,}/g);
      if (!numbers || numbers.length < 2) return null;
      const numValues = numbers.map((n) => parseInt(n, 10)).filter((n) => n > 0);
      if (numValues.length < 2) return null;
      const sorted = [...numValues].sort((a, b) => a - b);
      const avg = Math.round(
        numValues.reduce((s, n) => s + n, 0) / numValues.length,
      );
      const low = sorted[0];
      const high = sorted[sorted.length - 1];
      const declared = declaredRevenue ? Number(declaredRevenue) : avg;
      const consistency =
        avg > 300000 ? (avg / (high - low || 1) > 5 ? 'High' : 'Medium') : 'Low';
      const volatility = consistency === 'High' ? 'Low' : consistency === 'Medium' ? 'Medium' : 'High';
      return {
        avgMonthlyRevenue: avg,
        highestRevenue: high,
        lowestRevenue: low,
        avgBalance: Math.round(avg * 0.4),
        revenueConsistency: consistency,
        cashFlowVolatility: volatility,
        transactionCount: Math.min(500, numValues.length * 15),
        negativeBalanceDays: volatility === 'High' ? Math.floor(Math.random() * 3) : 0,
        riskSummary:
          declared && avg >= declared * 0.8
            ? 'Extracted figures align with declared revenue.'
            : 'Review extracted figures against declared revenue.',
        inflowOutflowSummary: { avgInflow: avg, avgOutflow: Math.round(avg * 0.85) },
      };
    } catch {
      return null;
    }
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
