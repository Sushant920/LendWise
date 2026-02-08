# LendWise smoke test

## Automated (API) test

With backend running (`cd backend && npm run start:dev`):

```bash
./scripts/smoke-test.sh
```

Uses `API_URL=http://localhost:3001/api` by default. Override if needed:

```bash
API_URL=http://localhost:3001/api ./scripts/smoke-test.sh
```

---

## Manual (browser) steps

**Prereqs:** Backend on port 3001, frontend on port 3000 (`cd frontend && npm run dev`).

### Merchant flow

1. **Sign up**  
   Open http://localhost:3000 → "Create Account". Register (e.g. `you@example.com` / `Test@123`).

2. **Dashboard**  
   You should land on `/dashboard`. Click **"Start New Application"**.

3. **New application (wizard)**  
   - **Step 1:** Choose loan type (e.g. Working capital), Next.  
   - **Step 2:** Business details (name, industry, city, age, revenue, requested amount), Next.  
   - **Step 3:** Upload at least one **bank statement** (PDF/image). Optional: GST return.  
   - Submit the application.

4. **Result**  
   You’re redirected to `applications/[id]/result`. Check:  
   - Eligibility score and band (e.g. pre_approved).  
   - Reasoning and improvement tips.  
   - Offers table (or “no offers” if criteria not met).

### Admin flow

5. **Log out** (header), then **Sign in** with admin:  
   - Email: `admin@lendwise.com`  
   - Password: `Admin@123`

6. **Admin dashboard**  
   You should land on `/admin`. Check stats (applications, etc.).

7. **Merchants**  
   Sidebar → **Merchants**. You should see the merchant you created; optional: use search.

8. **Applications**  
   Sidebar → **Applications**. Filter by status/loan type. Open an application to see:  
   - Merchant, score, documents, decisions, risk breakdown.

---

**Quick API smoke test (no frontend):**  
`./scripts/smoke-test.sh` (see above).
