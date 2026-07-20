# Trivacare

Trivacare is a healthcare coordination prototype for travelers in Morocco. The
repo contains a Vite/React frontend and a NestJS/Prisma/Postgres backend.

## Project Structure

- `src/`: frontend app, personas, shared UI, data, styles, and assets.
- `backend/src/`: NestJS API modules for auth, patients, clinics, professionals,
  appointments, messaging, billing, trips, security, and audit logs.
- `backend/prisma/`: Prisma schema, migrations, and seed scripts.
- `docs/reference/`: legacy/reference prototype material, not production app code.
- `public/`: static assets intentionally served by the frontend.

## Requirements

- Node.js 22+
- npm
- Docker, for local Postgres via `docker compose`

## Frontend Setup

```bash
npm install
npm run dev
```

Frontend defaults to `http://localhost:4173` and calls the API at
`http://localhost:3001` unless `VITE_API_URL` is set.

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate deploy
npx tsx prisma/seed.ts
npm run seed:admin
npm run dev
```

For local Postgres, copy `.env.example` at the repo root to `.env`, set local
passwords/secrets, then run:

```bash
docker compose up -d postgres
```

## Verification

Run these before committing or pushing:

```bash
npm run build
cd backend && npm run lint
cd backend && npm run test:patient
cd backend && npm run test:personas
```

## Environment Rules

- Commit `.env.example` files only.
- Never commit real `.env` files, production secrets, database dumps, or local
  generated output.
- `node_modules/`, `dist/`, `.vite/`, `coverage/`, and `pet-runs/` are ignored.

## Production Notes

Before production deployment, confirm HTTPS, locked CORS origins, real secret
management, database backup and rollback procedures, monitoring, rate limiting,
security headers, and authorization test coverage for all personas.
