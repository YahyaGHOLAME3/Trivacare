# Trivacare Backend

NestJS + Prisma/Postgres backend for Trivacare patient, care coordination,
messaging, billing, and security workflows.

## Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Start Postgres with `docker compose up -d postgres`.
3. Install dependencies in `backend/` with `npm install`.
4. Apply migrations with `npx prisma migrate deploy`.
5. Seed demo data with `npx tsx prisma/seed.ts`.
6. Seed the local super admin with `npm run seed:admin`.
7. Start the API with `npm run dev`.

## Environment Variables

- `PORT`: API port, default `3001`
- `DATABASE_URL`: Postgres connection string
- `JWT_ACCESS_SECRET`: access token signing secret
- `JWT_ACCESS_EXPIRES_IN`: access token lifetime
- `JWT_REFRESH_SECRET`: refresh/session token signing secret
- `JWT_REFRESH_EXPIRES_IN`: refresh/session token lifetime
- `BILLING_PROVIDER_WEBHOOK_SECRET`: HMAC secret for `POST /billing/provider-events`
- `API_PREFIX`: optional global prefix, leave empty to keep routes like `/auth/login`
- `CORS_ORIGIN`: comma-separated frontend origins allowed for CORS
- `ADMIN_EMAIL`: admin seed email; required for `npm run seed:admin`
- `ADMIN_PASSWORD`: admin seed password; required for `npm run seed:admin`

## Running

- Dev: `npm run dev`
- Build: `npm run build`
- Type check: `npm run lint`
- Deploy Prisma migrations: `npm run migrate:deploy`
- Seed local super admin: `npm run seed:admin`
- Prod: `npm run start:prod`
- Docker stack: `docker compose up -d`

Note: `npm run dev` starts the API directly with `ts-node`. Hot reload is not
configured in this repo.

## Main Endpoints

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /patients/me/dashboard`
- `GET|PUT /patients/me/profile`
- `GET|POST|PATCH /patients/me/trips`
- `POST /patients/me/trips/:id/stops`
- `GET /patients/me/appointments`
- `POST /patients/me/appointments/requests`
- `PATCH /patients/me/appointments/:id/cancel`
- `PATCH /patients/me/appointments/:id/reschedule`
- `GET|POST /threads`
- `GET|POST /threads/:id/messages`
- `POST /threads/:id/read`
- `GET /billing/summary`
- `GET /billing/quotes`
- `GET /billing/invoices`
- `POST /billing/quotes/:id/approve`
- `POST /billing/payment-intents`
- `POST /billing/provider-events` with `x-trivacare-timestamp` and `x-trivacare-signature` HMAC headers
- `POST /security/mfa/totp/enroll`
- `POST /security/mfa/totp/verify`
- `POST /security/mfa/disable`
- `GET /security/sessions`
- `DELETE /security/sessions/:id`
- `POST /security/sessions/revoke-others`
- `POST /security/password/change`

## Roles

- `PATIENT`
- `CLINIC_ADMIN`
- `PROFESSIONAL`
- `SUPER_ADMIN`

`SUPER_ADMIN` exists in the backend role model but is intentionally not
self-registerable.

## Legacy SQL Dump Handling

The uploaded `trivacar_prod2.sql` file is a MariaDB/phpMyAdmin dump, not a
Postgres dump. Do not import it directly into the Prisma/Postgres database. It
contains legacy auth/session-sensitive fields such as OAuth provider tokens,
password reset tokens, session payloads, OTP and two-factor columns, and bcrypt
password hashes.

Keep that dump outside the git repo, inspect or import it only into an isolated
local MariaDB-compatible scratch database, and migrate selected records into
Postgres through explicit Prisma scripts that hash or discard credentials as
appropriate.
