# LendWise deployment guide

Deploy in this order: **Database → Backend → Frontend**. Use the URLs from each step in the next.

### Steps at a glance

1. **Database** – Create PostgreSQL (Neon / Supabase / Render / Railway). Copy `DATABASE_URL`.
2. **Backend** – Deploy `backend/` to Render or Railway. Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`. Run migrations (and seed once). Note backend URL.
3. **Frontend** – Deploy `frontend/` to Vercel. Set `NEXT_PUBLIC_API_URL` = backend URL + `/api`.
4. Set backend `FRONTEND_URL` to your Vercel URL and redeploy backend (for CORS).

---

## 1. Database (PostgreSQL)

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
