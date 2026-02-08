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

Then set `DATABASE_URL` in `backend/.env`:

```
DATABASE_URL=postgresql://lendwise:lendwise@localhost:5432/lendwise
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # edit with your DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

API runs at http://localhost:3001

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:3000

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

- **Backend:** Set `DATABASE_URL`, `JWT_SECRET`, `PORT`; run `prisma migrate deploy` and `prisma db seed`. Deploy to Render, Railway, or Docker.
- **Frontend:** Set `NEXT_PUBLIC_API_URL` to your backend API base (e.g. `https://api.example.com/api`). Deploy to Vercel or static host.
- **Database:** Use managed PostgreSQL; ensure indexes on `applications(merchant_id)` and `applications(status)` (see Prisma schema).

## License

Private / Unlicensed
