-- CreateEnum
CREATE TYPE "Role" AS ENUM ('merchant', 'admin');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('working_capital', 'term_loan');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('draft', 'submitted', 'processing', 'decision_generated', 'pre_approved', 'approved', 'conditional', 'rejected');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('bank_statement', 'gst_return');

-- CreateEnum
CREATE TYPE "EligibilityBand" AS ENUM ('pre_approved', 'conditional', 'rejected');

-- CreateEnum
CREATE TYPE "DecisionOutcome" AS ENUM ('approved', 'conditional', 'rejected');

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'merchant',
    "business_name" TEXT,
    "industry" TEXT,
    "city" TEXT,
    "business_age_months" INTEGER,
    "monthly_revenue" DECIMAL(18,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "loan_type" "LoanType" NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'draft',
    "requested_amount" DECIMAL(18,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "storage_path" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtractedFinancials" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "avg_monthly_revenue" DECIMAL(18,2) NOT NULL,
    "highest_revenue" DECIMAL(18,2) NOT NULL,
    "lowest_revenue" DECIMAL(18,2) NOT NULL,
    "avg_balance" DECIMAL(18,2) NOT NULL,
    "inflow_outflow_summary" JSONB,
    "revenue_consistency" TEXT NOT NULL,
    "cash_flow_volatility" TEXT NOT NULL,
    "transaction_count" INTEGER NOT NULL,
    "negative_balance_days" INTEGER,
    "risk_summary" TEXT,
    "raw_response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtractedFinancials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EligibilityScore" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "band" "EligibilityBand" NOT NULL,
    "reasoning" TEXT NOT NULL,
    "factor_breakdown" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EligibilityScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lender" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "min_monthly_revenue" DECIMAL(18,2) NOT NULL,
    "min_business_vintage_months" INTEGER NOT NULL,
    "min_eligibility_score" INTEGER NOT NULL,
    "loan_min_amount" DECIMAL(18,2) NOT NULL,
    "loan_max_amount" DECIMAL(18,2) NOT NULL,
    "interest_rate_min" DECIMAL(5,2) NOT NULL,
    "interest_rate_max" DECIMAL(5,2) NOT NULL,
    "allowed_industries" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Lender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "lender_id" TEXT NOT NULL,
    "approved_amount" DECIMAL(18,2) NOT NULL,
    "interest_rate_min" DECIMAL(5,2) NOT NULL,
    "interest_rate_max" DECIMAL(5,2) NOT NULL,
    "tenure_months" INTEGER NOT NULL,
    "emi_min" DECIMAL(18,2),
    "emi_max" DECIMAL(18,2),
    "approval_probability" TEXT,
    "badges" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "lender_id" TEXT NOT NULL,
    "outcome" "DecisionOutcome" NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_email_key" ON "Merchant"("email");

-- CreateIndex
CREATE INDEX "Application_merchant_id_idx" ON "Application"("merchant_id");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EligibilityScore_application_id_key" ON "EligibilityScore"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "Lender_slug_key" ON "Lender"("slug");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedFinancials" ADD CONSTRAINT "ExtractedFinancials_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtractedFinancials" ADD CONSTRAINT "ExtractedFinancials_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EligibilityScore" ADD CONSTRAINT "EligibilityScore_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "Lender"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_lender_id_fkey" FOREIGN KEY ("lender_id") REFERENCES "Lender"("id") ON DELETE CASCADE ON UPDATE CASCADE;
