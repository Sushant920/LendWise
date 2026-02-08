import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus, LoanType } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getMerchants(search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const merchants = await this.prisma.merchant.findMany({
      where: { ...where, role: 'merchant' },
      select: {
        id: true,
        name: true,
        email: true,
        industry: true,
        city: true,
        businessAgeMonths: true,
        monthlyRevenue: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return merchants.map(({ _count, monthlyRevenue, ...m }) => ({
      ...m,
      monthlyRevenue: monthlyRevenue ? Number(monthlyRevenue) : null,
      applicationCount: _count.applications,
    }));
  }

  async getApplications(filters?: { status?: string; loanType?: string }) {
    const where: { status?: ApplicationStatus; loanType?: LoanType } = {};
    if (filters?.status) where.status = filters.status as ApplicationStatus;
    if (filters?.loanType) where.loanType = filters.loanType as LoanType;
    const applications = await this.prisma.application.findMany({
      where,
      include: {
        merchant: { select: { id: true, name: true, email: true } },
        eligibilityScores: true,
        documents: true,
        decisions: { include: { lender: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return applications.map((a) => ({
      id: a.id,
      loanType: a.loanType,
      status: a.status,
      requestedAmount: a.requestedAmount ? Number(a.requestedAmount) : null,
      createdAt: a.createdAt,
      merchant: a.merchant,
      score: a.eligibilityScores?.[0] ? { score: a.eligibilityScores[0].score, band: a.eligibilityScores[0].band } : null,
      documentCount: a.documents.length,
      decisions: a.decisions.map((d: { outcome: string; lender: { name: string } }) => ({ outcome: d.outcome, lenderName: d.lender.name })),
    }));
  }

  async getApplicationDetail(id: string) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        merchant: true,
        documents: true,
        extractedFinancials: true,
        eligibilityScores: true,
        decisions: { include: { lender: true } },
        offers: { include: { lender: true } },
      },
    });
    if (!app) return null;
    return {
      ...app,
      merchant: {
        ...app.merchant,
        monthlyRevenue: app.merchant.monthlyRevenue ? Number(app.merchant.monthlyRevenue) : null,
      },
      eligibilityScores: app.eligibilityScores?.[0]
        ? {
            score: app.eligibilityScores[0].score,
            band: app.eligibilityScores[0].band,
            reasoning: app.eligibilityScores[0].reasoning,
            factorBreakdown: app.eligibilityScores[0].factorBreakdown,
          }
        : null,
    };
  }
}
