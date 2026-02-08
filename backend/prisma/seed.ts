import * as bcrypt from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@lendwise.com';
const ADMIN_PASSWORD = 'Admin@123'; // Change in production

async function main() {
  // Admin user for /admin dashboard (role: admin)
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.merchant.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
      name: 'LendWise Admin',
      role: Role.admin,
    },
    update: { passwordHash: adminHash, role: Role.admin },
  });
  console.log('Seeded admin user:', ADMIN_EMAIL);

  const lenders = [
    {
      name: 'Credable',
      slug: 'credable',
      minMonthlyRevenue: 50000,
      minBusinessVintageMonths: 3,
      minEligibilityScore: 50,
      loanMinAmount: 100000,
      loanMaxAmount: 10000000,
      interestRateMin: 12,
      interestRateMax: 20,
      allowedIndustries: null,
      isActive: true,
    },
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
  console.log('Seeded 5 lenders (Credable first)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
