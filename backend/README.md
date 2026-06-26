# Trivacare Backend

NestJS + MongoDB backend for Trivacare authentication and user onboarding.

## Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Start MongoDB with `docker compose up -d mongo`.
3. Install dependencies in `backend/` with `npm install`.
4. Start the API with `npm run dev`.

## Environment Variables

- `PORT`: API port, default `3001`
- `MONGODB_URI`: MongoDB connection string
- `JWT_ACCESS_SECRET`: access token signing secret
- `JWT_ACCESS_EXPIRES_IN`: access token lifetime
- `JWT_REFRESH_SECRET`: refresh token signing secret
- `JWT_REFRESH_EXPIRES_IN`: refresh token lifetime
- `API_PREFIX`: optional global prefix, leave empty to keep routes like `/auth/login`
- `CORS_ORIGIN`: frontend origin allowed for CORS

## Running

- Dev: `npm run dev`
- Build: `npm run build`
- Prod: `npm run start:prod`
- Docker stack: `docker compose up -d`

## Roles

- `PATIENT`
- `CLINIC_ADMIN`
- `PROFESSIONAL`
- `SUPER_ADMIN`

`SUPER_ADMIN` exists in the backend role model but is intentionally not self-registerable.

## Main Endpoints

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /users/me`
- `PATCH /users/me`
