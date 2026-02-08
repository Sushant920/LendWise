import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const lenders = [
    {
      name: 'QuickCapital',
      slug: 'quick-capital',
      minMonthlyRevenue: 200000,
      minBusinessVintageMonths: 12,
      minEligibilityScore: 60,
      loanMinAmount: 200000,
      loanMaxAmount: 5000000,
      interestRateMin: 14,
      interestRateMax: 22,
      allowedIndustries: null,
      isActive: true,
    },
    {
      name: 'BizFund Pro',
      slug: 'bizfund-pro',
      minMonthlyRevenue: 500000,
      minBusinessVintageMonths: 24,
      minEligibilityScore: 70,
      loanMinAmount: 500000,
      loanMaxAmount: 10000000,
      interestRateMin: 12,
      interestRateMax: 18,
      allowedIndustries: ['Retail', 'Manufacturing', 'Services'],
      isActive: true,
    },
    {
      name: 'GrowthLend',
      slug: 'growth-lend',
      minMonthlyRevenue: 100000,
      minBusinessVintageMonths: 6,
      minEligibilityScore: 55,
      loanMinAmount: 200000,
      loanMaxAmount: 3000000,
      interestRateMin: 16,
      interestRateMax: 24,
      allowedIndustries: null,
      isActive: true,
    },
    {
      name: 'Enterprise Credit',
      slug: 'enterprise-credit',
      minMonthlyRevenue: 1000000,
      minBusinessVintageMonths: 36,
      minEligibilityScore: 75,
      loanMinAmount: 2000000,
      loanMaxAmount: 50000000,
      interestRateMin: 10,
      interestRateMax: 15,
      allowedIndustries: null,
      isActive: true,
    },
  ];

  for (const l of lenders) {
    const { allowedIndustries, ...rest } = l;
    await prisma.lender.upsert({
      where: { slug: l.slug },
      create: {
        ...rest,
        ...(allowedIndustries != null && { allowedIndustries }),
      },
      update: {},
    });
  }
  console.log('Seeded 4 lenders');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
