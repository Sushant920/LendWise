import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DecisionOutcome } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LendersService {
  constructor(private readonly prisma: PrismaService) {}

  async evaluateLenders(applicationId: string, merchantId: string) {
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
      throw new ForbiddenException('Not allowed');
    }
    const scoreRecord = application.eligibilityScores?.[0];
    if (!scoreRecord) {
      throw new BadRequestException('Calculate score first (POST /calculate-score)');
    }
    const financials = application.extractedFinancials?.[0];
    if (!financials) throw new BadRequestException('Extraction required first');

    const revenue = Number(financials.avgMonthlyRevenue);
    const vintage = application.merchant?.businessAgeMonths ?? 0;
    const score = scoreRecord.score;
    const industry = application.merchant?.industry ?? null;
    const lenders = await this.prisma.lender.findMany({ where: { isActive: true } });

    await this.prisma.decision.deleteMany({ where: { applicationId } });
    const decisions: { lenderId: string; outcome: DecisionOutcome; reason: string }[] = [];

    for (const lender of lenders) {
      const minRev = Number(lender.minMonthlyRevenue);
      const minVintage = lender.minBusinessVintageMonths;
      const minScore = lender.minEligibilityScore;
      const allowedIndustries = lender.allowedIndustries as string[] | null;
      if (revenue < minRev) {
        decisions.push({
          lenderId: lender.id,
          outcome: 'rejected',
          reason: `Monthly revenue (₹${(revenue / 1e5).toFixed(1)}L) is below minimum required (₹${(minRev / 1e5).toFixed(1)}L).`,
        });
        continue;
      }
      if (vintage < minVintage) {
        decisions.push({
          lenderId: lender.id,
          outcome: 'rejected',
          reason: `Business vintage (${vintage} months) is below minimum (${minVintage} months).`,
        });
        continue;
      }
      if (score < minScore) {
        decisions.push({
          lenderId: lender.id,
          outcome: 'rejected',
          reason: `Eligibility score (${score}) is below lender minimum (${minScore}).`,
        });
        continue;
      }
      if (allowedIndustries && allowedIndustries.length > 0 && industry && !allowedIndustries.includes(industry)) {
        decisions.push({
          lenderId: lender.id,
          outcome: 'rejected',
          reason: `Industry "${industry}" is not in lender's allowed list.`,
        });
        continue;
      }
      const outcome: DecisionOutcome = score >= 75 ? 'approved' : 'conditional';
      decisions.push({
        lenderId: lender.id,
        outcome,
        reason: outcome === 'approved'
          ? 'Meets all criteria for approval.'
          : 'Meets criteria with conditions; terms may vary.',
      });
    }

    for (const d of decisions) {
      await this.prisma.decision.create({
        data: {
          applicationId,
          lenderId: d.lenderId,
          outcome: d.outcome,
          reason: d.reason,
        },
      });
    }

    await this.generateOffers(applicationId);
    const result = await this.prisma.decision.findMany({
      where: { applicationId },
      include: { lender: { select: { id: true, name: true, slug: true } } },
    });
    return result.map((r) => ({
      lenderId: r.lenderId,
      lenderName: r.lender.name,
      outcome: r.outcome,
      reason: r.reason,
    }));
  }

  private async generateOffers(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        decisions: { where: { outcome: { in: ['approved', 'conditional'] } } },
        extractedFinancials: true,
      },
    });
    if (!application) return;
    const financials = application.extractedFinancials?.[0];
    const revenue = financials ? Number(financials.avgMonthlyRevenue) : 0;
    const approvedAmount = Math.min(revenue * 6, 50_000_000);
    await this.prisma.offer.deleteMany({ where: { applicationId } });
    const decisions = await this.prisma.decision.findMany({
      where: { applicationId, outcome: { in: ['approved', 'conditional'] } },
      include: { lender: true },
    });
    const offers: { lenderId: string; approvedAmount: number; interestRateMin: number; interestRateMax: number; tenureMonths: number; emiMin: number; emiMax: number; badges: string[] }[] = [];
    for (const d of decisions) {
      const l = d.lender;
      const minAmt = Number(l.loanMinAmount);
      const maxAmt = Number(l.loanMaxAmount);
      const amount = Math.min(maxAmt, Math.max(minAmt, Math.min(approvedAmount, maxAmt)));
      const rateMin = Number(l.interestRateMin);
      const rateMax = Number(l.interestRateMax);
      const tenure = 36;
      const emiMin = this.emi(amount, rateMax / 100 / 12, tenure);
      const emiMax = this.emi(amount, rateMin / 100 / 12, tenure);
      const badges: string[] = [];
      if (rateMin <= 12) badges.push('Best Rate');
      if (amount >= maxAmt * 0.9) badges.push('Highest Amount');
      if (badges.length === 0) badges.push('Fast Approval');
      offers.push({
        lenderId: l.id,
        approvedAmount: amount,
        interestRateMin: rateMin,
        interestRateMax: rateMax,
        tenureMonths: tenure,
        emiMin,
        emiMax,
        badges,
      });
    }
    const sortedByRate = [...offers].sort((a, b) => a.interestRateMin - b.interestRateMin);
    for (let i = 0; i < sortedByRate.length; i++) {
      const o = sortedByRate[i];
      if (i === 0 && !o.badges.includes('Best Rate')) o.badges.unshift('Best Rate');
    }
    for (const o of offers) {
      await this.prisma.offer.create({
        data: {
          applicationId,
          lenderId: o.lenderId,
          approvedAmount: new Decimal(o.approvedAmount),
          interestRateMin: new Decimal(o.interestRateMin),
          interestRateMax: new Decimal(o.interestRateMax),
          tenureMonths: o.tenureMonths,
          emiMin: new Decimal(o.emiMin),
          emiMax: new Decimal(o.emiMax),
          approvalProbability: o.badges.includes('Best Rate') ? 'High' : 'Medium',
          badges: o.badges as object,
        },
      });
    }
  }

  private emi(p: number, r: number, n: number): number {
    if (r <= 0) return p / n;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  async getOffers(applicationId: string, merchantId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.merchantId !== merchantId) throw new ForbiddenException('Not allowed');
    const offers = await this.prisma.offer.findMany({
      where: { applicationId },
      include: { lender: { select: { id: true, name: true, slug: true } } },
      orderBy: { interestRateMin: 'asc' },
    });
    const mapped = offers.map((o) => ({
      id: o.id,
      lenderName: o.lender.name,
      lenderSlug: o.lender.slug,
      approvedAmount: Number(o.approvedAmount),
      interestRateMin: Number(o.interestRateMin),
      interestRateMax: Number(o.interestRateMax),
      tenureMonths: o.tenureMonths,
      emiMin: o.emiMin ? Number(o.emiMin) : null,
      emiMax: o.emiMax ? Number(o.emiMax) : null,
      approvalProbability: o.approvalProbability,
      badges: (o.badges as string[]) ?? [],
    }));
    // Always show Credable first when present
    return mapped.sort((a, b) =>
      a.lenderName === 'Credable' ? -1 : b.lenderName === 'Credable' ? 1 : 0,
    );
  }

  async getDecisionExplanation(applicationId: string, merchantId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        eligibilityScores: true,
        decisions: { include: { lender: { select: { name: true, slug: true } } } },
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.merchantId !== merchantId) throw new ForbiddenException('Not allowed');
    const scoreRecord = application.eligibilityScores?.[0];
    const globalReasoning = scoreRecord?.reasoning ?? 'Score not yet calculated.';
    const improvementTips = this.getImprovementTips(scoreRecord?.score ?? 0, scoreRecord?.band);
    const perLender = application.decisions.map((d) => ({
      lenderName: d.lender.name,
      outcome: d.outcome,
      reason: d.reason,
    }));
    return {
      globalReasoning,
      improvementTips,
      perLender,
    };
  }

  private getImprovementTips(score: number, band?: string): string[] {
    const tips: string[] = [];
    if (score < 55) {
      tips.push('Increase monthly revenue consistency to improve eligibility.');
      tips.push('Build cash reserves to reduce negative balance days.');
      tips.push('Consider applying again after 6–12 months of stronger financials.');
    } else if (score < 75) {
      tips.push('Improving revenue consistency may unlock better rates.');
      tips.push('Maintain a stable average bank balance above 20% of monthly revenue.');
    } else {
      tips.push('You qualify for competitive offers. Compare lenders for the best terms.');
    }
    return tips;
  }
}
