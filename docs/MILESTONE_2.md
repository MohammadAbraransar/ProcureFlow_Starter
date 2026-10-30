# Milestone 2 — authentication and company workspaces

## Scope delivered in source

The user can create an account and an initial company workspace, sign in, list workspaces, create another workspace, select an active workspace and sign out. The API owns the session and tenant membership checks; the browser does not get to assert membership by sending a tenant identifier.

### Registration transaction

1. Validate email, password and company/workspace names.
2. Normalise email with `Locale.ROOT`.
3. Hash password with BCrypt work factor 12.
4. Insert user, tenant and OWNER membership in one transaction.
5. Enforce uniqueness and role/status constraints in PostgreSQL.

### Login/session

1. Authenticate through Spring Security's DAO provider.
2. Reject accounts not in ACTIVE state with a generic credential error.
3. Rotate the session ID.
4. Save the security context in the server-side HTTP session.
5. Clear the pre-authentication CSRF token; the next state-changing action obtains a fresh token.
6. Set the initial active workspace from the account's active memberships.

### Tenant context

- The selected workspace ID is held in the server-side session.
- Selection checks active membership against the database.
- `ActiveWorkspaceContext.requireTenantId(...)` resolves the ID and checks membership again.
- Every future supplier, quote, PO, invoice and document service must call this resolver and use the resulting tenant ID in every query and write.
- PostgreSQL RLS is not yet configured. Do not add tenant-owned business tables or expose business APIs until RLS and pooled-connection tests are in place.

## API contract summary

- `GET /api/v1/auth/csrf` → `{ headerName, token }`
- `POST /api/v1/auth/register` → `{ email, password, legalCompanyName, workspaceName }`
- `POST /api/v1/auth/login` → `{ email, password }`, returns user, workspace memberships and active workspace; sets HttpOnly session cookie.
- `GET /api/v1/auth/me` → current user and workspaces.
- `POST /api/v1/auth/logout` → invalidates server session.
- `GET /api/v1/workspaces` → active memberships.
- `POST /api/v1/workspaces` → `{ legalName, displayName }`.
- `POST /api/v1/workspaces/select` → `{ workspaceId }`, checks membership.

All state-changing requests require the CSRF token in `X-CSRF-TOKEN`. Authenticated requests require the session cookie.

## Tests authored

- Registration persists an OWNER membership and company workspace.
- Login creates a session and returns active workspace information.
- Duplicate registration is rejected.
- Workspace API rejects anonymous callers.
- Registration without a CSRF token is rejected.
- A user cannot select a workspace where they have no membership.
- Invalid password input is rejected by validation.

## Exit criteria still outstanding

- Execute `mvn test` and `npm run build` successfully in a developer environment.
- Add email verification and account recovery.
- Add distributed rate limiting and abuse detection.
- Add MFA and privileged action step-up checks.
- Add PostgreSQL RLS and connection-pool/async worker tenant context tests.
- Conduct security review and deployment configuration review.

This milestone's source implementation is an engineering increment, not a production identity service or a security certification.
