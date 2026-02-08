import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EligibilityBand } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const WEIGHTS = {
  revenueStrength: 0.3,
  revenueConsistency: 0.2,
  businessVintage: 0.15,
  cashFlowHealth: 0.2,
  loanVsRevenue: 0.1,
  riskFlags: 0.05,
};

@Injectable()
export class ScoringService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateScore(applicationId: string, merchantId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        merchant: true,
        extractedFinancials: true,
        eligibilityScores: true,
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.merchantId !== merchantId) {
      throw new ForbiddenException('Not allowed to calculate score for this application');
    }
    const financials = application.extractedFinancials?.[0];
    if (!financials) {
      throw new BadRequestException('Run extraction first (POST /extract-financials)');
    }

    const merchant = application.merchant;
    const revenueStrength = this.scoreRevenueStrength(Number(financials.avgMonthlyRevenue));
    const revenueConsistency = this.scoreConsistency(financials.revenueConsistency);
    const businessVintage = this.scoreVintage(merchant.businessAgeMonths ?? 0);
    const cashFlowHealth = this.scoreCashFlow(
      Number(financials.avgBalance),
      financials.negativeBalanceDays ?? 0,
      financials.cashFlowVolatility,
    );
    const requestedAmount = application.requestedAmount
      ? Number(application.requestedAmount)
      : Number(financials.avgMonthlyRevenue) * 3;
    const monthlyRevenue = Number(financials.avgMonthlyRevenue);
    const loanVsRevenue = this.scoreLoanVsRevenue(requestedAmount, monthlyRevenue);
    const riskFlags = this.scoreRiskFlags(
      financials.negativeBalanceDays ?? 0,
      financials.revenueConsistency,
    );

    const rawScore =
      revenueStrength * WEIGHTS.revenueStrength +
      revenueConsistency * WEIGHTS.revenueConsistency +
      businessVintage * WEIGHTS.businessVintage +
      cashFlowHealth * WEIGHTS.cashFlowHealth +
      loanVsRevenue * WEIGHTS.loanVsRevenue +
      riskFlags * WEIGHTS.riskFlags;
    const score = Math.round(Math.min(100, Math.max(0, rawScore * 100)));
    const band = this.getBand(score);
    const reasoning = this.buildReasoning(score, band, {
      revenueStrength,
      revenueConsistency,
      businessVintage,
      cashFlowHealth,
      loanVsRevenue,
      riskFlags,
    });
    const factorBreakdown = {
      revenueStrength,
      revenueConsistency,
      businessVintage,
      cashFlowHealth,
      loanVsRevenue,
      riskFlags,
    };

    await this.prisma.eligibilityScore.upsert({
      where: { applicationId },
      create: {
        applicationId,
        score,
        band,
        reasoning,
        factorBreakdown: factorBreakdown as object,
      },
      update: { score, band, reasoning, factorBreakdown: factorBreakdown as object },
    });
    await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: 'decision_generated' },
    });

    return {
      score,
      band,
      reasoning,
      factorBreakdown,
    };
  }

  private scoreRevenueStrength(avgMonthlyRevenue: number): number {
    if (avgMonthlyRevenue >= 1000000) return 1;
    if (avgMonthlyRevenue >= 500000) return 0.85;
    if (avgMonthlyRevenue >= 200000) return 0.7;
    if (avgMonthlyRevenue >= 100000) return 0.5;
    return Math.min(1, avgMonthlyRevenue / 100000);
  }

  private scoreConsistency(consistency: string): number {
    if (consistency === 'High') return 1;
    if (consistency === 'Medium') return 0.65;
    return 0.35;
  }

  private scoreVintage(months: number): number {
    if (months >= 36) return 1;
    if (months >= 24) return 0.85;
    if (months >= 12) return 0.65;
    if (months >= 6) return 0.45;
    return Math.min(1, months / 6);
  }

  private scoreCashFlow(avgBalance: number, negativeDays: number, volatility: string): number {
    let s = 0.5;
    if (avgBalance > 200000) s += 0.25;
    else if (avgBalance > 50000) s += 0.15;
    if (negativeDays === 0) s += 0.2;
    else if (negativeDays <= 2) s += 0.05;
    if (volatility === 'Low') s += 0.05;
    else if (volatility === 'High') s -= 0.2;
    return Math.min(1, Math.max(0, s));
  }

  private scoreLoanVsRevenue(requested: number, monthlyRevenue: number): number {
    if (monthlyRevenue <= 0) return 0.5;
    const ratio = requested / monthlyRevenue;
    if (ratio <= 3) return 1;
    if (ratio <= 6) return 0.8;
    if (ratio <= 12) return 0.5;
    return 0.3;
  }

  private scoreRiskFlags(negativeDays: number, consistency: string): number {
    if (negativeDays > 5) return 0.2;
    if (negativeDays > 0 || consistency === 'Low') return 0.6;
    return 1;
  }

  private getBand(score: number): EligibilityBand {
    if (score >= 75) return 'pre_approved';
    if (score >= 55) return 'conditional';
    return 'rejected';
  }

  private buildReasoning(
    score: number,
    band: EligibilityBand,
    factors: Record<string, number>,
  ): string {
    const parts: string[] = [];
    if (factors.revenueStrength >= 0.7) parts.push('Strong revenue level');
    else if (factors.revenueStrength < 0.5) parts.push('Revenue below typical thresholds');
    if (factors.revenueConsistency >= 0.8) parts.push('Stable revenue pattern');
    else if (factors.revenueConsistency < 0.5) parts.push('Inconsistent revenue');
    if (factors.cashFlowHealth >= 0.7) parts.push('Healthy cash flow');
    else if (factors.cashFlowHealth < 0.5) parts.push('Cash flow needs improvement');
    if (band === 'rejected') {
      parts.push('Overall eligibility below minimum. Consider improving revenue consistency and cash reserves.');
    } else if (band === 'conditional') {
      parts.push('Eligible for conditional offers. Strengthening revenue consistency may improve terms.');
    } else {
      parts.push('Meets criteria for pre-approval.');
    }
    return parts.join('. ');
  }
}
