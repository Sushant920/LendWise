# Product Requirements Document (PRD)

## LendWise — AI-Powered Loan Origination System (LOS) MVP

**Product Type:** Web-based Loan Origination System for merchant lending  
**Version:** 2.0 (Development-Ready)  
**Last Updated:** February 2025

---

## Document Purpose

This PRD is structured for **development reference**. Each section includes functional scope, acceptance criteria, and implementation hooks (APIs, data models, flows) so engineers can build and verify features against it.

---

## 1. Product Overview

### 1.1 Summary

LendWise is an end-to-end LOS MVP that:

- **Ingests** merchant financial data (forms + documents)
- **Uses OCR/AI** to extract financial metrics from bank statements and GST returns
- **Calculates** a single eligibility score (0–100)
- **Matches** merchants to multiple lenders via rule-based engine
- **Generates** dynamic credit offers with amount, rate, tenure, EMI
- **Explains** every decision (why approved, why rejected, what to improve)

### 1.2 Core Objective

Build a realistic credit infrastructure platform with:

| Capability | Description |
|------------|-------------|
| AI document processing | OCR + structured extraction (revenue, balance, volatility, etc.) |
| Eligibility scoring | Weighted model → Pre-approved / Conditional / Rejected |
| Multi-lender matching | 4+ lender profiles with rules; Approved / Conditional / Rejected per lender |
| Offer discovery | Ranked offers (amount, rate, tenure, EMI, badges) |
| Explainability | Per-lender and global decision reasons + improvement tips |

### 1.3 Design Philosophy

- **Modern fintech SaaS** — clean, trustworthy, enterprise + startup hybrid
- **Simple, professional** dashboards
- **Transparent** — every decision explained in plain language
- **Low friction** — minimal form steps, clear progress, obvious CTAs

---

## 2. Goals, Success Metrics & Definition of Done

### 2.1 Primary Goals

- Simplify loan applications for merchants (wizard, one CTA)
- Faster underwriting via automation (extraction + scoring)
- Transparent eligibility and decision feedback
- Multi-lender offer comparison in one place
- Admin/ops visibility into risk and portfolio

### 2.2 Success Metrics

- Application completion rate
- Time to decision (target: under async processing window)
- Merchant dashboard engagement
- Reduction in manual underwriting effort
- Accuracy of financial extraction and score (validated vs manual checks)

### 2.3 Definition of Done (MVP Release)

- [ ] Merchant signup/login and session management work
- [ ] Loan application wizard (5 steps including AI analysis) works end-to-end
- [ ] Documents (bank statement, optional GST) upload and are processed (OCR/extraction)
- [ ] Eligibility score (0–100) calculated and stored with reasoning
- [ ] At least 4 lender profiles with rules; each returns Approved/Conditional/Rejected
- [ ] Dynamic offers generated and displayed in comparison UI
- [ ] Decision explanations (why approved/rejected + improvement tips) shown to merchant and in admin
- [ ] Merchant results screen shows score, status, offers table, and explanations
- [ ] Admin dashboard: all merchants, all applications, risk breakdown, decision status, document preview
- [ ] UI meets modern fintech usability (load &lt; 3s, clear status, mobile-friendly)

---

## 3. User Personas & Roles

### 3.1 Merchant User

- **Who:** SMB owner seeking working capital or term loans
- **Needs:** Simple flow, clear requirements, transparent decisions, guidance to improve eligibility
- **Permissions:** Signup/login, create/submit applications, upload documents, view application history, status, results, and offers

### 3.2 Admin / Ops User

- **Who:** Internal lending/ops team
- **Needs:** Review applications, monitor risk, track merchant performance, portfolio health
- **Permissions:** View all merchants, all applications, risk score breakdown, decision status, uploaded documents preview (no edit of merchant data required for MVP)

---

## 4. User Flows (Development Reference)

### 4.1 Merchant: Application Flow (Wizard)

| Step | Name | Description | Dev Notes |
|------|------|-------------|-----------|
| 1 | Loan type | Select **Working Capital** or **Term Loan** | Single choice; store in Application |
| 2 | Business details | Monthly revenue, business age (months), industry, city | Validate numeric/mandatory; map to Merchant + Application |
| 3 | Document upload | Bank statement (PDF/image), GST return (PDF/image, optional) | Drag-and-drop, type/size validation, progress indicator |
| 4 | AI analysis | “Analyzing financials…” loader; wait for extraction + score | Call extract then score; show spinner until ready |
| 5 | Results & offers | Score, status, loan range, rate range, tenure, reason, tips, **offers comparison table** | Fetch offers + decision explanation APIs |

**Progress:** Show a progress bar across steps 1–5.

### 4.2 Application Status Flow

```
Draft → Submitted → Processing → Decision Generated → (Pre-approved | Approved | Conditional | Rejected)
```

- **Draft:** Application saved but not submitted
- **Submitted:** Merchant clicked submit; documents and form data saved
- **Processing:** Extraction and/or scoring in progress
- **Decision Generated:** Score and all lender decisions + offers computed
- **Pre-approved / Approved / Conditional / Rejected:** Final merchant-facing outcome (derived from score and lender results)

---

## 5. Functional Requirements (Feature-by-Feature)

### 5.1 Authentication & Account Management

| Requirement | Detail |
|-------------|--------|
| Merchant signup | Email + password; create Merchant + profile |
| Login / Logout | Email-based auth; secure session |
| Password reset | Forgot password flow (email link or token) |
| RBAC | Roles: `merchant`, `admin`; enforce on all APIs and routes |

**Acceptance criteria:**

- [ ] Merchant can register and log in
- [ ] Session persists and is validated on protected routes
- [ ] Admin cannot log in as merchant and vice versa (role-based redirect)

---

### 5.2 Merchant Dashboard

- **Start new loan application** — primary CTA
- **View application history & status** — list of applications with status (Draft, Submitted, Processing, Decision Generated, Pre-approved, etc.)

**UX:** Dashboard loads in &lt; 3 seconds; status clearly visible; minimal clutter.

**Acceptance criteria:**

- [ ] One-click navigation to “Start new application”
- [ ] List shows all applications for logged-in merchant with status and link to detail/result

---

### 5.3 Loan Application Journey (Steps 1–5)

- **Step 1:** Loan type — Working Capital | Term Loan
- **Step 2:** Business details — monthly revenue, business age (months), industry, city (and business name if needed)
- **Step 3:** Document upload — bank statement (required), GST return (optional); drag-and-drop, file type validation, upload progress
- **Step 4:** AI analysis — full-screen or inline “Analyzing financials…” until extraction + score are ready
- **Step 5:** Results & offers — see Section 5.7

**Validation:** Numeric validation for revenue and age; mandatory fields enforced; file type/size limits.

**Acceptance criteria:**

- [ ] Wizard can be completed in order; progress bar reflects current step
- [ ] Form data and document references saved at latest on submit
- [ ] After submit, user sees Step 4 then Step 5 when backend is done

---

### 5.4 AI Document Upload & OCR / Extraction Engine

**Purpose:** Ingest bank statements (and optionally GST), run OCR/AI extraction, store structured financials.

**Documents:**

- Bank statement: PDF or image (required)
- GST return: PDF or image (optional; mock extraction acceptable)

**Extract and store (at least):**

- Monthly revenue (avg, min, max or similar)
- Average balance
- Inflow / outflow (or equivalent)
- Revenue consistency (e.g. Low / Medium / High or score)
- Cash flow volatility
- Number of transactions
- (Optional) Days with negative balance, financial health summary

**Implementation options:** Real OCR (e.g. Tesseract + parser or cloud OCR) + rules, or **mock AI** that returns realistic structured JSON. Structure must match `ExtractedFinancials` (see Section 9).

**Acceptance criteria:**

- [ ] Upload endpoint accepts files; stores in Document table and file storage
- [ ] Extraction runs (sync or async); results stored in ExtractedFinancials (or equivalent)
- [ ] Frontend can show “Analyzing…” and then financial summary when extraction is done

---

### 5.5 Eligibility Scoring Model (Core Logic)

**Purpose:** Single credit eligibility score 0–100 driving global approval band and feeding lender rules.

**Weighted model (example — implement as configurable):**

| Factor | Weight | Notes |
|--------|--------|-------|
| Revenue strength | 30% | Level of monthly revenue vs benchmarks |
| Revenue consistency | 20% | Stability over months |
| Business vintage | 15% | Age of business (months) |
| Cash flow health | 20% | Balance, negative days, volatility |
| Loan amount vs revenue ratio | 10% | Requested vs affordable |
| Risk flags | 5% | E.g. negative balance, industry, etc. |

**Output bands:**

- **Score ≥ 75** → Pre-approved
- **Score 55–74** → Conditional offer
- **Score &lt; 55** → Rejected

**Outputs to store:**

- Score (0–100)
- Band (Pre-approved / Conditional / Rejected)
- Short reasoning (for explainability)
- Optional: per-factor contribution (for admin breakdown)

**Acceptance criteria:**

- [ ] Score calculated from merchant + application + extracted financials
- [ ] Score and band stored per application
- [ ] Reasoning (and optionally factor breakdown) available for API and UI

---

### 5.6 Multi-Lender Rule Engine

**Purpose:** Evaluate each merchant application against multiple lender profiles and return Approved / Conditional / Rejected per lender.

**Minimum:** 4 distinct lender profiles.

**Per-lender profile (configurable):**

- Revenue thresholds (min monthly revenue)
- Vintage requirements (min business age in months)
- Score cutoff (min eligibility score)
- Loan range (e.g. ₹2L – ₹5Cr)
- Industry flags (allowed/restricted industries, if any)

**Logic:** For each lender, evaluate: eligibility score + raw metrics (revenue, vintage, industry) against that lender’s rules. Return:

- **Approved** / **Conditional** / **Rejected**
- Reason (for explainability)

**Acceptance criteria:**

- [ ] At least 4 lenders with different rules
- [ ] Each application evaluated against all lenders
- [ ] Per-lender decision and reason stored and exposable via API

---

### 5.7 Dynamic Offer Discovery & Comparison

**Purpose:** For eligible (Approved/Conditional) lenders, generate a concrete offer and rank for the merchant.

**Per offer (per lender):**

- Approved amount (or range)
- Interest rate range
- Tenure (e.g. months)
- EMI (or range)
- Approval probability (or badge: “High” / “Medium” etc.)

**Ranking:** By best affordability and approval chance (e.g. rate then amount, or custom formula).

**Badges (examples):** “Best Rate”, “Fast Approval”, “Highest Amount” — assign by rules from offer attributes.

**Acceptance criteria:**

- [ ] Offers generated only for lenders that returned Approved or Conditional
- [ ] Offers include amount, rate, tenure, EMI; stored in Offers table
- [ ] Frontend displays comparison table with lender name, loan type, amount, rate, tenure, badges

---

### 5.8 Explainability Layer

**Purpose:** For every decision (global + per lender), show why and what to improve.

**Show:**

- Why approved (e.g. “Strong revenue and consistent cash flow”)
- Why rejected (e.g. “Rejected due to low revenue consistency”)
- What to improve (e.g. “Increase monthly inflows by ₹X to qualify”)

**Scope:** Global (eligibility) + per-lender decision explanation.

**Acceptance criteria:**

- [ ] Each lender decision has a short reason (stored or generated)
- [ ] Global improvement tips (e.g. from score engine) available
- [ ] Merchant results screen and admin both show reasons and tips in plain language

---

### 5.9 Results Screen (Merchant) — Step 5

**Display:**

- Credit score (0–100)
- Approval status: Pre-approved / Approved / Conditional / Rejected
- Eligible loan amount range (e.g. ₹2L – ₹5Cr)
- Interest rate range
- Suggested tenure
- AI-generated reason for decision
- AI-generated improvement tips
- **Available offers** from multiple lenders in a **comparison table**:
  - Lender name, loan type, amount, interest rate, tenure
  - Badges: “Best Rate”, “Fast Approval”, “Highest Amount”

**UX:** Easy-to-read cards, clear copy, non-technical language.

**Acceptance criteria:**

- [ ] All items above present and correct for the current application
- [ ] Table sorts/ranks by configured criteria; badges visible

---

### 5.10 Admin / Ops Dashboard

**Features:**

| Area | Features |
|------|----------|
| Merchant management | View all merchants, search, view merchant profile |
| Application management | View all applications; filter by status, risk score range, loan type, date |
| Risk breakdown | Score, factor breakdown, financial metrics, document extraction summary |
| Decision status | Approved / Rejected / Conditional / Pending per application (and per lender if needed) |
| Documents | Preview/list uploaded documents (link or thumbnail) |

**Acceptance criteria:**

- [ ] Admin can see list of merchants and applications
- [ ] Filters work for applications
- [ ] Risk breakdown and decision status visible per application
- [ ] Uploaded documents accessible (preview or download)

---

## 6. API Contract (Backend)

Implement the following in an API-style backend (REST or equivalent). Request/response formats should be consistent (e.g. JSON).

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/upload-documents` | Upload bank statement / GST; associate to application; return document IDs |
| POST | `/extract-financials` | Trigger or return extraction for given document(s); return structured financials |
| POST | `/calculate-score` | Input: application ID (or merchant + application context). Output: score, band, reasoning |
| POST | `/evaluate-lenders` | Run multi-lender rule engine for application; return per-lender decision + reason |
| GET | `/offers` | Get generated offers for an application (with ranking and badges) |
| GET | `/decision-explanation` | Get full explanation (global + per-lender reasons and improvement tips) |

**Notes:**

- Auth: All endpoints require valid session/JWT and role check where applicable.
- Idempotency: Where relevant (e.g. score calculation), design so repeated calls don’t duplicate side effects or use idempotency keys.

---

## 7. Data Models (Database)

Use these entities for schema design and API payloads. Field types (string/number/date/JSON) should match your stack.

### 7.1 Merchants

| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| email | string | Unique, for login |
| password_hash | string | |
| name | string | |
| business_name | string | Optional |
| industry | string | |
| city | string | |
| business_age_months | number | |
| monthly_revenue | number | Declared in form |
| created_at | datetime | |
| updated_at | datetime | |

### 7.2 Applications

| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| merchant_id | FK | |
| loan_type | enum | working_capital \| term_loan |
| status | enum | draft \| submitted \| processing \| decision_generated \| pre_approved \| approved \| conditional \| rejected |
| requested_amount | number | Optional |
| created_at | datetime | |
| updated_at | datetime | |

### 7.3 Documents

| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| application_id | FK | |
| type | enum | bank_statement \| gst_return |
| storage_path | string | S3 or local path |
| file_name | string | Original name |
| mime_type | string | |
| created_at | datetime | |

### 7.4 ExtractedFinancials

| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| document_id | FK | Or application_id if one summary per app |
| application_id | FK | For easy lookup |
| avg_monthly_revenue | number | |
| highest_revenue | number | |
| lowest_revenue | number | |
| avg_balance | number | |
| inflow_outflow_summary | JSON or separate columns | |
| revenue_consistency | string/enum | e.g. Low/Medium/High |
| cash_flow_volatility | string/number | |
| transaction_count | number | |
| negative_balance_days | number | Optional |
| risk_summary | string | Optional short text |
| raw_response | JSON | Optional; full extraction payload |
| created_at | datetime | |

### 7.5 EligibilityScores

| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| application_id | FK | Unique per application |
| score | number | 0–100 |
| band | enum | pre_approved \| conditional \| rejected |
| reasoning | string | |
| factor_breakdown | JSON | Optional; per-factor contribution |
| created_at | datetime | |

### 7.6 Lenders

| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| name | string | |
| slug | string | Unique |
| min_monthly_revenue | number | |
| min_business_vintage_months | number | |
| min_eligibility_score | number | |
| loan_min_amount | number | INR |
| loan_max_amount | number | INR |
| interest_rate_min | number | |
| interest_rate_max | number | |
| allowed_industries | JSON array | Optional |
| is_active | boolean | |

### 7.7 EligibilityRules (Optional)

If rules are stored separately (e.g. for versioning):

| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| lender_id | FK | |
| rule_type | string | e.g. revenue, vintage, score |
| rule_config | JSON | Thresholds, etc. |

### 7.8 Offers

| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| application_id | FK | |
| lender_id | FK | |
| approved_amount | number | |
| interest_rate_min | number | |
| interest_rate_max | number | |
| tenure_months | number | |
| emi_min | number | Optional |
| emi_max | number | Optional |
| approval_probability | string/number | Optional |
| badges | JSON array | e.g. ["Best Rate", "Fast Approval"] |
| created_at | datetime | |

### 7.9 Decisions (Per-Lender)

| Field | Type | Notes |
|-------|------|-------|
| id | PK | |
| application_id | FK | |
| lender_id | FK | |
| outcome | enum | approved \| conditional \| rejected |
| reason | string | For explainability |
| created_at | datetime | |

---

## 8. Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| Performance | Dashboard load &lt; 3 s; document processing async with clear loading state |
| Security | Secure auth, encrypted file storage, RBAC, audit log for admin actions |
| Reliability | Graceful handling of extraction/scoring timeouts; retry where appropriate |
| Scalability | Modular services (upload, extract, score, lenders, offers); independent modules for future scaling |

---

## 9. UX & Design

- **Style:** Modern fintech SaaS; clean typography; simple layouts; trust-building visuals
- **Principles:** Reduce cognitive load; minimal form friction; clear progress (wizard + progress bar); transparent outcomes
- **Accessibility:** Mobile-friendly responsive design; clear contrast and readable fonts

---

## 10. Error Handling & Edge Cases

- Document upload failure → Clear message + retry
- Partial or failed financial extraction → Store what’s available; show message; allow re-upload or retry
- Scoring engine timeout → Retry or show “Processing delayed”; preserve application state
- Duplicate applications → Allow (e.g. re-apply) but distinguish by application_id
- Incomplete profile → Block submit until required fields (and required docs) provided

**Rule:** Always show clear user-facing message and preserve application state where possible.

---

## 11. Logging & Monitoring

- Log: application submissions, document uploads, extraction runs, score calculations, lender evaluations, offer generation, admin actions
- Monitor: success/failure rates, latency for score and extraction, offer count per application

---

## 12. Out of Scope (MVP)

- Bank account aggregation APIs
- Automated GST verification (external)
- Credit bureau integration
- Loan disbursement module
- Multi-currency or multi-product beyond Working Capital + Term Loan

---

## 13. Quick Reference: Implementation Checklist

- [ ] Auth: signup, login, logout, password reset, RBAC
- [ ] Merchant dashboard: CTA + application list with status
- [ ] Wizard: Steps 1–5 with progress bar; validation; submit
- [ ] Upload: POST `/upload-documents`; store files and Document records
- [ ] Extraction: POST `/extract-financials`; store ExtractedFinancials; mock OK if structured
- [ ] Scoring: POST `/calculate-score`; weighted model; store EligibilityScores
- [ ] Lenders: 4+ lender profiles; POST `/evaluate-lenders`; store Decisions
- [ ] Offers: Generate from approved/conditional lenders; GET `/offers`; rank and badges
- [ ] Explainability: Reasons and tips; GET `/decision-explanation`
- [ ] Results screen: Score, status, range, reason, tips, offers table
- [ ] Admin: Merchants list, applications list + filters, risk breakdown, decision status, document preview
- [ ] DB: All tables from Section 7 created and used by APIs

---

End of PRD — Use this document as the single source of truth during development and QA.
