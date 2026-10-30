# ProcureFlow — development starter

ProcureFlow is an AI-assisted procurement workflow for Indian small and medium manufacturers and industrial distributors. The product connects supplier quotations, comparison, purchase orders and invoice discrepancy review. It is not an ERP, accounting package, payment system or supplier marketplace.

## Current milestone

- Milestone 1: project foundation and product structure created.
- Milestone 2: account registration, session login, company workspaces and workspace selection implemented in source.
- **Build/test status:** not verified in this environment. Maven and npm dependency installation did not complete. Do not treat this as a tested or production-ready release.
- **Data warning:** do not upload real customer documents or expose this development build publicly.

## Technology

- Frontend: Angular 20 + TypeScript.
- Backend: Java 21 + Spring Boot 3.5.6.
- Database: PostgreSQL + Flyway migrations.
- Security: Spring Security, BCrypt, server-side sessions, HttpOnly cookies and CSRF tokens.
- No Docker required.

## Prerequisites on Windows

1. Java 21 JDK.
2. Apache Maven 3.9+.
3. Node.js 22 LTS (or an Angular 20-supported Node release) and npm.
4. PostgreSQL 16 or newer.
5. VS Code (recommended).

## Local PostgreSQL setup

Open `psql` as a PostgreSQL administrator and run:

```sql
CREATE USER procureflow_app WITH PASSWORD 'replace-with-a-long-local-password';
CREATE DATABASE procureflow OWNER procureflow_app;
```

Use a local development-only password. Never commit it. Flyway applies versioned migrations at backend startup.

## Run the backend — Command Prompt

```bat
cd backend
set DB_URL=jdbc:postgresql://localhost:5432/procureflow
set DB_USERNAME=procureflow_app
set DB_PASSWORD=replace-with-your-local-password
set COOKIE_SECURE=false
set APP_CORS_ORIGIN=http://localhost:4200
mvn spring-boot:run
```

Backend URL: `http://localhost:8080`

Health check: `http://localhost:8080/actuator/health`

## Run the frontend — second Command Prompt

```bat
cd frontend
npm install
npm start
```

Open `http://localhost:4200`. Angular's development proxy forwards `/api` to `http://localhost:8080`, so the browser uses same-origin requests and the session cookie works locally.

## Milestone 2 API endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/v1/auth/csrf` | Public | Obtain a CSRF token for the current session |
| POST | `/api/v1/auth/register` | Public + CSRF | Create user, company and OWNER membership |
| POST | `/api/v1/auth/login` | Public + CSRF | Authenticate and create a server-side session |
| GET | `/api/v1/auth/me` | Authenticated | Current account and active workspace |
| POST | `/api/v1/auth/logout` | Authenticated + CSRF | Invalidate session |
| GET | `/api/v1/workspaces` | Authenticated | List active memberships |
| POST | `/api/v1/workspaces` | Authenticated + CSRF | Create another workspace |
| POST | `/api/v1/workspaces/select` | Authenticated + CSRF | Select a workspace after membership check |

The frontend obtains a CSRF token from `/api/v1/auth/csrf` and sends it in `X-CSRF-TOKEN` on state-changing requests. Authentication uses an HttpOnly session cookie; do not move session credentials into localStorage/sessionStorage.

## Security notes

- Registration currently activates accounts immediately. Email verification/recovery is not integrated.
- Distributed login/register rate limiting, MFA and PostgreSQL RLS remain pending.
- `ActiveWorkspaceContext` is provided for future tenant-scoped services. Every business-data service must use it, and tenant-owned tables need RLS before business data is introduced.
- Production must use HTTPS and `COOKIE_SECURE=true`, exact production CORS origin, trusted proxy configuration, email verification, abuse controls, MFA, audit logging, malware-scanned private document storage, security testing and restore drills.
- Do not disable CSRF to make requests work. Fix the client token/session flow.

## Project layout

```text
backend/       Spring Boot API, migrations and tests
frontend/      Angular application
docs/         Product, AI, security and development notes
```

## Development rules

- Never hardcode secrets or customer data.
- All tenant IDs must be resolved from authenticated server-side membership, never trusted from a request body.
- Use decimal arithmetic for all money; AI must not calculate totals or approve transactions.
- AI extraction is advisory, records source evidence/confidence and requires human review for critical fields.
- Keep the modular monolith until operational evidence justifies service extraction.
