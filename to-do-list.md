# LendWise – Development To-Do List

**Reference:** PRD.md | Design.md | techstack.md  
**Stack:** Next.js + TypeScript + Tailwind | NestJS + PostgreSQL + Prisma | S3 | BullMQ + Redis | JWT

Use this list in order; check off items as you complete them. Each section maps to PRD sections and Design/techstack where relevant.

---

## Phase 0: Project setup & infrastructure

- [x] **0.1** Initialize monorepo or separate repos: frontend (Next.js), backend (NestJS), shared types if needed
- [x] **0.2** Configure TypeScript, ESLint, Prettier for both frontend and backend (techstack §23)
- [x] **0.3** Set up environment files: `.env.example` with `DATABASE_URL`, `JWT_SECRET`, `STORAGE_*`, `REDIS_URL` (techstack §15)
- [ ] **0.4** Set up PostgreSQL (local or managed) and run initial connection test
- [ ] **0.5** Set up Redis for BullMQ (techstack §8, §23)
- [ ] **0.6** Set up file storage: S3 or R2 bucket; implement signed upload URL generation (techstack §6, §17)
- [x] **0.7** Add Docker Compose for local dev (DB + Redis + optional backend) (techstack §13)
- [x] **0.8** Configure CI: GitHub Actions – lint, test, build (techstack §14)

---

## Phase 1: Database & authentication

- [x] **1.1** Install Prisma (or TypeORM); init and connect to PostgreSQL (techstack §5)
- [x] **1.2** Create Prisma schema: **Merchants** (id, email, password_hash, name, business_name?, industry, city, business_age_months, monthly_revenue, created_at, updated_at) – PRD §7.1
- [x] **1.3** Add **Applications** (id, merchant_id, loan_type enum, status enum, requested_amount?, created_at, updated_at) – PRD §7.2
- [x] **1.4** Add **Documents** (id, application_id, type enum, storage_path, file_name, mime_type, created_at) – PRD §7.3
- [x] **1.5** Add **ExtractedFinancials** (id, document_id, application_id, avg_monthly_revenue, highest_revenue, lowest_revenue, avg_balance, inflow_outflow_summary?, revenue_consistency, cash_flow_volatility, transaction_count, negative_balance_days?, risk_summary?, raw_response?, created_at) – PRD §7.4
- [x] **1.6** Add **EligibilityScores** (id, application_id, score, band enum, reasoning, factor_breakdown?, created_at) – PRD §7.5
- [x] **1.7** Add **Lenders** (id, name, slug, min_monthly_revenue, min_business_vintage_months, min_eligibility_score, loan_min_amount, loan_max_amount, interest_rate_min, interest_rate_max, allowed_industries?, is_active) – PRD §7.6
- [x] **1.8** Add **Offers** (id, application_id, lender_id, approved_amount, interest_rate_min/max, tenure_months, emi_min/max?, approval_probability?, badges?, created_at) – PRD §7.8
- [x] **1.9** Add **Decisions** (id, application_id, lender_id, outcome enum, reason, created_at) – PRD §7.9
- [x] **1.10** Add `role` to Merchants (e.g. `merchant` | `admin`) or separate Admin table per your RBAC design – PRD §5.1
- [x] **1.11** Run migrations; seed at least 4 **Lenders** with different rules (revenue, vintage, score, loan range, industry) – PRD §5.6
- [x] **1.12** Implement auth: signup (email + password, hash with bcrypt), login (JWT issue), logout (token invalidation or client discard) – PRD §5.1, techstack §7
- [x] **1.13** Implement password reset flow (token + email or placeholder) – PRD §5.1
- [x] **1.14** Add RBAC middleware: protect routes by role (`merchant` vs `admin`); return 403 when role mismatch – PRD §5.1
- [x] **1.15** Expose auth API: `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/forgot-password` (and reset)

---

## Phase 2: Core backend – merchants, applications, documents

- [x] **2.1** Merchant service: get profile, update profile (business details); ensure merchant can only access own data
- [x] **2.2** Application service: create application (draft), get application by ID, list applications by merchant_id, update application (step 1–2 data)
- [x] **2.3** Implement `POST /applications` (create draft), `GET /applications`, `GET /applications/:id`, `PATCH /applications/:id` with status transitions – PRD §4.2
- [x] **2.4** Document service: upload file to S3, save **Documents** row (application_id, type, storage_path, file_name, mime_type)
- [x] **2.5** Implement `POST /upload-documents` (multipart); associate to application; return document IDs – PRD §6
- [x] **2.6** Add file type validation (PDF, image) and size limits; return clear error on failure – PRD §10
- [x] **2.7** On application submit: set status to `submitted` then `processing`; trigger extraction job (or sync extraction in MVP)

---

## Phase 3: AI document extraction & eligibility scoring

- [ ] **3.1** Document processing service: interface that accepts document ID/path and returns structured financials (PRD §5.4)
- [ ] **3.2** Implement extraction logic: mock AI that returns JSON with avg_monthly_revenue, highest_revenue, lowest_revenue, avg_balance, revenue_consistency, cash_flow_volatility, transaction_count, negative_balance_days?, risk_summary – PRD §5.4, §7.4
- [ ] **3.3** (Optional) Integrate real OCR (e.g. Tesseract or cloud) and parse into same structure; store in **ExtractedFinancials**
- [ ] **3.4** Implement `POST /extract-financials` (input: application_id or document_ids); run extraction; persist ExtractedFinancials; return structured result – PRD §6
- [ ] **3.5** (Optional) Use BullMQ job for async extraction; frontend polls or uses webhook/SSE for “Analyzing…” – techstack §8
- [ ] **3.6** Eligibility scoring module: input = merchant + application + ExtractedFinancials; weighted model – PRD §5.5
  - Revenue strength 30%, Revenue consistency 20%, Business vintage 15%, Cash flow health 20%, Loan vs revenue 10%, Risk flags 5%
- [ ] **3.7** Output: score (0–100), band (pre_approved | conditional | rejected): ≥75 pre_approved, 55–74 conditional, <55 rejected
- [ ] **3.8** Store result in **EligibilityScores** (score, band, reasoning, factor_breakdown?)
- [ ] **3.9** Implement `POST /calculate-score` (input: application_id); return score, band, reasoning – PRD §6

---

## Phase 4: Multi-lender engine, offers & explainability

- [ ] **4.1** Lender rule engine: for a given application (with score + financials + business details), evaluate each active **Lender** – PRD §5.6
  - Compare: min_monthly_revenue, min_business_vintage_months, min_eligibility_score, allowed_industries
  - Output per lender: Approved | Conditional | Rejected + reason
- [ ] **4.2** Persist per-lender result in **Decisions** (application_id, lender_id, outcome, reason)
- [ ] **4.3** Implement `POST /evaluate-lenders` (input: application_id); run engine; return list of decisions – PRD §6
- [ ] **4.4** Offer generator: for each Approved/Conditional lender, create **Offers** row (approved_amount, interest range, tenure, EMI, badges) – PRD §5.7
- [ ] **4.5** Assign badges (e.g. “Best Rate”, “Fast Approval”, “Highest Amount”) from offer attributes; rank offers (e.g. by rate, then amount)
- [ ] **4.6** Implement `GET /offers?applicationId=` – return ranked offers with badges – PRD §6
- [ ] **4.7** Explainability: aggregate global reasoning (from EligibilityScores) + per-lender reasons (from Decisions) + improvement tips (from score engine or static copy)
- [ ] **4.8** Implement `GET /decision-explanation?applicationId=` – return full explanation (global + per-lender + tips) – PRD §5.8, §6

---

## Phase 5: Merchant frontend (Next.js + Tailwind)

- [ ] **5.1** Apply design system: colors (neutral + primary accent, status green/amber/red), typography, cards, buttons – Design §2, §3
- [ ] **5.2** Set up routing: `/login`, `/signup`, `/dashboard`, `/applications`, `/applications/new`, `/applications/:id`, `/applications/:id/result`
- [ ] **5.3** Login & signup pages: centered card, email + password, primary CTA, minimal layout – Design §4.1
- [ ] **5.4** Wire auth: call signup/login APIs; store JWT (httpOnly cookie or secure storage); redirect by role (merchant → dashboard, admin → admin dashboard)
- [ ] **5.5** Merchant dashboard: top bar (logo, profile, logout); summary cards (Active Applications, Last Decision, Avg Risk Score if available); applications table (ID, Loan Type, Status, Date, Action); primary CTA “Start New Application” – Design §4.2, PRD §5.2
- [ ] **5.6** Ensure dashboard loads in < 3s; list shows status and link to detail/result – PRD §5.2
- [ ] **5.7** New application wizard – progress bar “Step X of 5” – Design §4.3, PRD §5.3
  - **Step 1:** Loan type selection (Working Capital | Term Loan); Back / Continue
  - **Step 2:** Business details form (monthly revenue, business age months, industry, city; optional business name); 2-column where appropriate; inline validation (Zod + React Hook Form) – Design §4.3
  - **Step 3:** Document upload – large upload zone, drag-and-drop, bank statement (required), GST (optional); file type/size validation; upload progress; “Your documents are securely processed” – Design §4.3, PRD §5.3
  - **Step 4:** “Analyzing financials…” full-screen or inline loader; call extract then score; show until ready
  - **Step 5:** Results & offers (see 5.9)
- [ ] **5.8** (Optional) Step “Review & Submit” before Step 4: summary of loan type, business info, uploaded docs; edit links; Submit button – can merge with Step 3 or 4 depending on flow
- [ ] **5.9** Results screen – Design §4.5, PRD §5.9
  - Top: Decision status (Pre-approved / Approved / Conditional / Rejected)
  - Cards: Risk score (0–100), Eligible loan range, Interest range, Suggested tenure
  - Decision reason (plain language)
  - Improvement tips
  - **Offers comparison table:** Lender name, Loan type, Amount, Interest rate, Tenure, Badges (Best Rate, Fast Approval, Highest Amount)
- [ ] **5.10** Risk score visualization: circular or horizontal bar; color range green / amber / red – Design §7
- [ ] **5.11** Financial summary card (from ExtractedFinancials): avg revenue, highest/lowest, avg balance, negative days, volatility, summary – Design §6
- [ ] **5.12** Error states: upload failed, extraction failed, timeout – clear message + retry – Design §12, PRD §10
- [ ] **5.13** Empty states: “No applications yet”, “Upload your first document” with next action – Design §11
- [ ] **5.14** Responsive: desktop first; tablet and mobile stacked cards, simplified tables – Design §10

---

## Phase 6: Admin frontend

- [ ] **6.1** Admin layout: sidebar (Dashboard, Merchants, Applications); top bar; collapsible sidebar – Design §8
- [ ] **6.2** Admin dashboard: top metrics (Total Applications, Approved, Rejected, Pending); applications table with filters (status, date range, loan type, risk score) – Design §5.1, PRD §5.10
- [ ] **6.3** Merchant list: table (Merchant Name, Business Type, Applications, Avg Risk Score, Status); search bar – Design §5.2, PRD §5.10
- [ ] **6.4** Application detail view: Merchant info, Financial metrics, Extracted document data, Risk score breakdown, Decision summary; two-column layout – Design §5.3, PRD §5.10
- [ ] **6.5** Risk breakdown: score, factor breakdown, financial metrics, extraction summary – PRD §5.10
- [ ] **6.6** Decision status: show Approved/Rejected/Conditional per application (and per lender if needed)
- [ ] **6.7** Document preview: list or link to view/download uploaded documents – PRD §5.10
- [ ] **6.8** Restrict all admin routes to `admin` role; redirect merchants away from admin paths

---

## Phase 7: Integration, errors & deploy

- [ ] **7.1** End-to-end flow: signup → login → new application → steps 1–3 → submit → Step 4 (analyze) → Step 5 (results + offers); verify data in DB at each stage
- [ ] **7.2** Handle extraction timeout: show “Processing delayed” or retry; preserve application state – PRD §10
- [ ] **7.3** Handle partial extraction: store what’s available; show message; allow re-upload/retry – PRD §10
- [ ] **7.4** Audit logging: log admin actions (view merchant, view application) – PRD §8, techstack §17
- [ ] **7.5** Logging: application submissions, document uploads, extraction, scoring, lender evaluation, offer generation (Winston/Pino) – techstack §16
- [ ] **7.6** (Optional) Error tracking: Sentry for API and frontend – techstack §16
- [ ] **7.7** API: ensure all 6 endpoints (upload-documents, extract-financials, calculate-score, evaluate-lenders, offers, decision-explanation) are protected and return consistent JSON – PRD §6
- [ ] **7.8** Database indexes: merchant_id, application_id, status – techstack §18
- [ ] **7.9** Deploy backend (e.g. Render/Railway or Docker on cloud); deploy frontend (e.g. Vercel); configure env and secrets – techstack §12
- [ ] **7.10** Smoke test in staging: full merchant flow + admin view; confirm Definition of Done checklist in PRD §2.3

---

## Quick reference – PRD Definition of Done

Before release, confirm:

- [ ] Merchant signup/login and session work
- [ ] Loan application wizard (5 steps including AI analysis) works end-to-end
- [ ] Documents upload and are processed (extraction stored)
- [ ] Eligibility score (0–100) calculated and stored with reasoning
- [ ] At least 4 lender profiles; each returns Approved/Conditional/Rejected
- [ ] Dynamic offers generated and shown in comparison UI
- [ ] Decision explanations (reasons + tips) shown to merchant and in admin
- [ ] Merchant results screen shows score, status, offers table, explanations
- [ ] Admin dashboard: merchants, applications, risk breakdown, decision status, document preview
- [ ] UI: modern fintech, load < 3s, mobile-friendly

---

*Update this file as you progress. Remove or split items if the team size or sprint structure requires it.*
