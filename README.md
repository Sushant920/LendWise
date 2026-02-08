# LendWise

AI-powered Loan Origination System (LOS) MVP for merchant lending.

## Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** NestJS, TypeScript, Prisma, PostgreSQL
- **Auth:** JWT, bcrypt
- **Infra:** Docker (PostgreSQL, Redis), GitHub Actions CI

## Quick start

### 1. Start database and Redis (Docker)

```bash
docker compose up -d
```

Then set `DATABASE_URL` in `backend/.env` to point at the local Postgres (port **5432**):

```
DATABASE_URL=postgresql://lendwise:lendwise@localhost:5432/lendwise
```

If you see `Can't reach database server at localhost:51214` (or similar), your `.env` is still using another URL (e.g. Prisma Accelerate). Use the URL above for local Docker, or start the DB that your current URL points to.

### 2. Backend

```bash
cd backend
cp .env.example .env   # edit with your DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev   # use --name add_application_indexes if you only need to add indexes
npm run prisma:seed
npm run start:dev
```

API runs at http://localhost:3001

**Admin user:** Seed creates an admin for the `/admin` dashboard. Log in with:
- Email: `admin@lendwise.com`
- Password: `Admin@123`  
Change this in production (e.g. set a strong password and/or use env vars in `backend/prisma/seed.ts`).

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:3000

**If you see "Failed to fetch" or "Could not reach the server":** the frontend cannot reach the backend. Start the backend first (`cd backend && npm run start:dev`). The API must be running at http://localhost:3001 (or set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to your backend URL).

## Auth API (Phase 1)

- `POST /auth/signup` — body: `{ "email", "password", "name" }`
- `POST /auth/login` — body: `{ "email", "password" }`
- `POST /auth/logout` — Header: `Authorization: Bearer <token>`
- `POST /auth/forgot-password` — body: `{ "email" }` (placeholder)

## Docs

- [PRD](PRD.md) — product requirements
- [Design](Design.md) — UI/UX spec
- [Tech stack](techstack.md) — architecture and tools
- [To-do list](to-do-list.md) — development checklist

## Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for step-by-step instructions (Database → Backend → Frontend) using Neon/Supabase, Render or Railway, and Vercel.

## License

Private / Unlicensed
