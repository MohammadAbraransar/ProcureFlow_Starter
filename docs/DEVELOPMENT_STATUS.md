# ProcureFlow development status

Last updated: 2026-10-30

## Milestone 1 — foundation

- [x] Product scope and modular-monolith direction documented.
- [x] Angular + TypeScript frontend scaffold.
- [x] Spring Boot API scaffold.
- [x] PostgreSQL/Flyway baseline schema.
- [x] AI architecture and security baseline notes.
- [ ] Full local build verification of the original starter (dependency installation was not completed in the prior increment).

## Milestone 2 — authentication and company workspaces

### Implemented in this increment

- [x] Registration creates an account, company workspace and OWNER membership in one database transaction.
- [x] Email normalisation and unique database constraint.
- [x] BCrypt password hashing (work factor 12); minimum 12 characters and maximum 72 UTF-8 bytes.
- [x] Session-based authentication; no browser-stored bearer token.
- [x] Session ID rotation on successful login.
- [x] HttpOnly session cookie; SameSite=Lax; Secure flag configurable for HTTPS deployment.
- [x] CSRF protection for state-changing requests using a server-side session token and `X-CSRF-TOKEN` header.
- [x] Authenticated current-user and workspace-list endpoints.
- [x] Create additional workspace, select active workspace, and sign out.
- [x] Membership is checked server-side before workspace selection.
- [x] `ActiveWorkspaceContext` helper resolves tenant from server-side session state and rechecks active membership. Future business services must use it before any tenant-scoped read/write.
- [x] Angular login, registration, workspace chooser, create-workspace and sign-out screens.
- [x] Local Angular proxy routes `/api` to the backend, avoiding cross-origin cookies in local development.
- [x] Tests authored for registration, duplicate email, login/session, authenticated access, CSRF and cross-tenant workspace selection.

### Not yet complete / not production-ready

- [ ] Maven and Angular dependency installation/build/test execution. This environment did not complete package installation, so source is not represented as compiled or test-passing.
- [ ] Email verification and verified account recovery.
- [ ] Distributed login/register rate limiting and account-abuse controls.
- [ ] MFA and privileged-role step-up authentication.
- [ ] Tenant row-level security (RLS) and connection-pool context tests. There are no business-data endpoints yet; RLS is required before adding them.
- [ ] Security review of session lifetime, reverse-proxy headers, CORS and deployment cookie settings.
- [ ] Production identity/email delivery, monitoring and incident runbooks.

**Status:** Milestone 2 implementation increment is present, but milestone exit criteria are not met until builds/tests pass and the outstanding production controls are addressed. Do not use real customer data or expose this starter publicly.
