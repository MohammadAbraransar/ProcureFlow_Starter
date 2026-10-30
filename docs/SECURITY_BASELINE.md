# Security baseline — ProcureFlow

## Implemented in the current development increment

- Spring Security deny-by-default replaced with explicit public routes for registration, login and CSRF bootstrap; all other API routes require an authenticated session.
- Passwords are stored as BCrypt hashes (work factor 12), never plaintext. Minimum length is 12 characters; inputs exceeding BCrypt's 72-byte limit are rejected rather than silently truncated.
- Server-side HTTP session authentication. Session IDs are rotated on login. The browser session cookie is HttpOnly and SameSite=Lax; `COOKIE_SECURE=true` is mandatory behind HTTPS in production.
- CSRF protection is enabled. State-changing endpoints require the session CSRF token in `X-CSRF-TOKEN`.
- CORS is restricted to one configured origin (`APP_CORS_ORIGIN`); credentials are allowed only for that origin.
- Registration creates user, tenant and owner membership transactionally. Email uniqueness is enforced by the database.
- Workspace selection uses a server-side session attribute and rechecks membership in the database. Never trust a tenant ID supplied by the browser as authorisation.
- `ActiveWorkspaceContext.requireTenantId(...)` is the required entry point for future tenant-scoped business services.
- Errors do not return stack traces or SQL details.

## Mandatory before production

1. Verify email before account activation; implement single-use, expiring verification tokens and secure recovery.
2. Add distributed rate limits for registration, login, recovery and expensive document/AI operations; add abuse monitoring and safe lockout controls.
3. Add MFA, particularly for owners/admins and sensitive approvals.
4. Implement PostgreSQL row-level security as defence in depth for tenant-owned tables, and test RLS context with pooled connections, async jobs and worker processes.
5. Add explicit permission checks for every object and action; role labels alone are not sufficient.
6. Enforce TLS, secure cookies, trusted proxy configuration, restrictive CSP/security headers and deployment-specific CORS.
7. Add audit events for login, workspace membership changes, approvals and financial decisions. Do not log passwords, session IDs, CSRF tokens, uploaded document contents or AI secrets.
8. Add file quarantine, malware scanning, signature checks, size/page limits, isolated parsing and private object storage before enabling uploads.
9. Keep LLM output untrusted; schema-validate it, retain source evidence/confidence, scope retrieval by tenant and require human review of critical financial fields. AI must not approve orders or invoices or calculate payable totals.
10. Add dependency/SAST/DAST/secrets scanning, backup restore tests, incident response and independent penetration testing before production release.

## Important limitation

This is a development baseline, not a security certification or production-ready identity system. Registration currently activates the account immediately because an email-delivery/verification provider has not yet been integrated. Do not expose it publicly or use real customer data until the mandatory controls are complete.
