# LendWise deployment guide

---

# Render + Vercel (detailed steps)

Use this section if you are deploying **backend on Render** and **frontend on Vercel**. Order: **Database (Render Postgres) → Backend (Render Web Service) → Frontend (Vercel) → CORS fix**.

---

## Part 1: Database on Render (PostgreSQL)

1. Go to **[render.com](https://render.com)** and sign in (or create an account).
2. In the dashboard, click **New +** → **PostgreSQL**.
3. Configure:
   - **Name:** e.g. `lendwise-db`
   - **Region:** Choose closest to you (e.g. Oregon).
   - **Plan:** Free (or paid if you need more).
4. Click **Create Database**.
5. Wait until the DB is **Available**. Then open it and go to **Info** or **Connection**.
6. Copy the **Internal Database URL** (use this for Render backend; it looks like `postgresql://user:pass@host/dbname`).  
   - If your backend will be on Render in the same region, **Internal Database URL** is best.  
   - If you need to connect from outside Render, use **External Database URL** and ensure `?sslmode=require` is at the end if required.
7. Save this URL somewhere — you’ll paste it as `DATABASE_URL` in the backend.

---

## Part 2: Backend on Render (Web Service)

**If you already deployed and see:** `Error: Cannot find module '/opt/render/project/src/backend/dist/main'`  
→ Use the **no Root Directory** setup below so the start command runs from inside `backend` and finds `dist/main`.

1. In Render dashboard, click **New +** → **Web Service**.
2. **Connect repository:**
   - If not connected: **Connect account** (GitHub) and select your **LendWise** repo.
   - Select the repo (e.g. `Sushant920/LendWise`) and click **Connect**.
3. **Configure the service (use one of these):**

   **Recommended (avoids "Cannot find module .../dist/main"):**
   - **Name:** e.g. `lendwise-api`
   - **Region:** Same as your database (e.g. Oregon).
   - **Branch:** `main`
   - **Root Directory:** leave **blank** (so we use the full repo and `cd backend` in commands).
   - **Runtime:** `Node`
   - **Build Command:**  
     `cd backend && npm install && npx prisma generate && npm run build`
   - **Start Command:**  
     `cd backend && npx prisma migrate deploy && node dist/main`

   **Alternative (Root Directory = backend):**  
   - **Root Directory:** `backend`  
   - **Build Command:** `npm install && npx prisma generate && npm run build`  
   - **Start Command:** `npx prisma migrate deploy && node dist/main`  
   If you get "Cannot find module .../dist/main", switch to the recommended setup above (no Root Directory, use `cd backend` in both commands).
4. **Environment variables** — click **Add Environment Variable** and add:

   | Key             | Value |
   |-----------------|--------|
   | `DATABASE_URL`  | Paste the Postgres URL from Part 1 (Internal or External). |
   | `JWT_SECRET`    | A long random string. Generate one: run `openssl rand -base64 32` in a terminal and paste the output. |
   | `FRONTEND_URL`  | Leave blank for now. You’ll set it after deploying the frontend (e.g. `https://lendwise-xxx.vercel.app`). |

   - **Do not** set `PORT` — Render sets it automatically.
5. Click **Create Web Service**. Render will build and deploy.
6. Wait until the deploy shows **Live** (green). If it fails, check **Logs** (often missing `DATABASE_URL` or Prisma errors).
7. Copy your backend URL from the top of the page, e.g. `https://lendwise-api.onrender.com`.  
   - **API base URL for the frontend:** `https://lendwise-api.onrender.com/api` (must include `/api`).
8. **Run database seed once (admin user + lenders):**
   - Open your Web Service → **Shell** tab.
   - Run: `npm run prisma:seed`
   - Exit the shell when it finishes.

---

## Part 3: Frontend on Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in (or create an account). Connect GitHub if asked.
2. Click **Add New…** → **Project**.
3. **Import** your GitHub repository **LendWise** (e.g. `Sushant920/LendWise`). Click **Import**.
4. **Configure Project:**
   - **Project Name:** e.g. `lendwise` (or leave default).
   - **Root Directory:** click **Edit** and set to `frontend` (so only the Next.js app is built). Confirm.
   - **Framework Preset:** should detect Next.js automatically.
   - **Build and Output Settings:** leave default (`next build` / `next start`).
5. **Environment variable:**
   - Under **Environment Variables**, add:
     - **Name:** `NEXT_PUBLIC_API_URL`
     - **Value:** your backend API base URL from Part 2, e.g. `https://lendwise-api.onrender.com/api`  
       (same URL you copied, including `/api`).
   - Leave **Environment** as Production (and add for Preview if you want).
6. Click **Deploy**. Wait until the build finishes.
7. When done, Vercel shows the live URL, e.g. `https://lendwise-xxx.vercel.app`. Copy this **exact** URL (no trailing slash).

---

## Part 4: Fix CORS (backend must allow frontend)

1. Go back to **Render** → your backend **Web Service** → **Environment**.
2. Add or edit:
   - **Key:** `FRONTEND_URL`
   - **Value:** the Vercel URL from Part 3, e.g. `https://lendwise-xxx.vercel.app` (no trailing slash).
3. Save. Render will **redeploy** automatically. Wait until it’s **Live** again.

After this, the browser will be allowed to call your backend from the Vercel site.

---

## Part 5: Test the deployment

1. Open your **Vercel URL** (e.g. `https://lendwise-xxx.vercel.app`).
2. Click **Create Account** / **Get Started** and sign up (name, email, phone, password).
3. You should land on the dashboard. Try **Start New Application** and the flow.
4. **Admin:** Sign out, then sign in with:
   - Email: `admin@lendwise.com`
   - Password: `Admin@123`  
   Change this password in production.

---

## Render + Vercel quick reference

| What        | Where   | Value example |
|------------|---------|----------------|
| Database   | Render PostgreSQL | Create DB → copy **Internal** or **External** URL |
| Backend URL | Render Web Service | `https://lendwise-api.onrender.com` |
| API base (for frontend) | — | `https://lendwise-api.onrender.com/api` |
| Frontend URL | Vercel | `https://lendwise-xxx.vercel.app` |
| Backend `DATABASE_URL` | Render → Environment | Postgres URL from Part 1 |
| Backend `JWT_SECRET` | Render → Environment | `openssl rand -base64 32` |
| Backend `FRONTEND_URL` | Render → Environment | Your Vercel URL (no trailing slash) |
| Frontend `NEXT_PUBLIC_API_URL` | Vercel → Settings → Env | `https://lendwise-api.onrender.com/api` |

---

# Other options (summary)

## 1. Database (PostgreSQL) – any provider

Use a managed Postgres provider. Examples:

- **[Neon](https://neon.tech)** – free tier, quick setup  
- **[Supabase](https://supabase.com)** – free tier, includes dashboard  
- **[Render](https://render.com)** – free Postgres  
- **[Railway](https://railway.app)** – pay-as-you-go  

**Steps:**

1. Create a new PostgreSQL database.
2. Copy the **connection string** (e.g. `postgresql://user:pass@host:5432/dbname?sslmode=require`).
3. Save it as `DATABASE_URL` for the backend (Step 2).

---

## 2. Backend (NestJS)

Deploy the backend to a Node-friendly host. Options: **Render**, **Railway**, **Fly.io**.

### Option A: Render (recommended)

1. Push your code to GitHub (e.g. `Sushant920/LendWise`).
2. Go to [render.com](https://render.com) → **New** → **Web Service**.
3. Connect the repo; set:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build && npx prisma generate`
   - **Start Command:** `npx prisma migrate deploy && node dist/main`  
   (Run seed once after first deploy: in Render **Shell** run `npm run prisma:seed`, or add `&& npm run prisma:seed` before `node dist/main` for the first deploy only.)
4. **Environment variables** (add in Render dashboard):

   | Variable          | Value |
   |-------------------|--------|
   | `DATABASE_URL`    | Your Postgres connection string from Step 1 |
   | `JWT_SECRET`      | Long random string (e.g. from `openssl rand -base64 32`) |
   | `PORT`            | `3001` (or leave default; Render sets `PORT`) |
   | `FRONTEND_URL`    | Your frontend URL from Step 3 (e.g. `https://lendwise.vercel.app`) |

5. Deploy. Note the backend URL (e.g. `https://lendwise-api.onrender.com`).  
   **API base URL for frontend:** `https://lendwise-api.onrender.com/api` (include `/api`).

### Option B: Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**.
2. Select repo; set **Root Directory** to `backend`.
3. Add **PostgreSQL** plugin (or use your own `DATABASE_URL`).
4. In **Variables**, set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`.
5. **Settings** → **Deploy**:
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `npx prisma migrate deploy && npm run prisma:seed && node dist/main`
6. Deploy and copy the public URL; frontend will use `https://<your-app>.up.railway.app/api`.

### Option C: Fly.io

1. Install [flyctl](https://fly.io/docs/hands-on/install-flyctl/).
2. From repo root: `cd backend && fly launch` (follow prompts; don’t add Postgres if you use Neon/Supabase).
3. Set secrets:
   ```bash
   fly secrets set DATABASE_URL="postgresql://..." JWT_SECRET="..." FRONTEND_URL="https://..."
   ```
4. Add a **release** step to run migrations. In `backend/fly.toml` (or Dockerfile) ensure start runs:
   `npx prisma migrate deploy && node dist/main` (run seed once manually if needed).
5. Deploy: `fly deploy`.

---

## 3. Frontend (Next.js) – Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import your GitHub repo (`LendWise`).
3. **Root Directory:** `frontend`.
4. **Environment variable:**

   | Name                    | Value |
   |-------------------------|--------|
   | `NEXT_PUBLIC_API_URL`   | Backend API base, e.g. `https://lendwise-api.onrender.com/api` |

5. Deploy. Vercel will build and give you a URL (e.g. `https://lendwise.vercel.app`).

6. **Important:** Put this frontend URL into the backend’s `FRONTEND_URL` (Step 2) and redeploy the backend so CORS allows it.

---

## 4. Post-deploy checklist

- [ ] **Database:** Backend runs without DB errors; migrations applied (`prisma migrate deploy`).
- [ ] **Seed:** Admin user exists (run `npm run prisma:seed` once on backend if you didn’t in start command).
- [ ] **CORS:** Backend has `FRONTEND_URL` set to the exact frontend origin (no trailing slash).
- [ ] **Frontend:** `NEXT_PUBLIC_API_URL` points to backend with `/api` (e.g. `https://xxx.onrender.com/api`).
- [ ] **Auth:** Sign up, log in, and open dashboard from the deployed frontend.
- [ ] **Admin:** Log in as `admin@lendwise.com` / `Admin@123` and change the password in production.

---

## 5. Optional: file uploads in production

The app currently stores uploaded documents on the server filesystem. For production:

- Use **S3-compatible storage** (AWS S3, Cloudflare R2, etc.).
- Set `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` in the backend.
- Implement S3 upload in the documents service (or keep local storage for MVP).

---

## Quick reference: env vars

**Backend**

- `DATABASE_URL` – Postgres connection string (required)
- `JWT_SECRET` – Secret for signing tokens (required)
- `PORT` – Server port (optional; host often sets this)
- `FRONTEND_URL` – Frontend origin for CORS (e.g. `https://lendwise.vercel.app`)

**Frontend**

- `NEXT_PUBLIC_API_URL` – Backend API base (e.g. `https://your-api.onrender.com/api`)
