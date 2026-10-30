-- Strengthen the identity/workspace foundation before business records are introduced.
ALTER TABLE users
    ADD CONSTRAINT chk_users_email_normalised CHECK (email_normalised = lower(email_normalised)),
    ADD CONSTRAINT chk_users_password_hash_present CHECK (password_hash IS NOT NULL AND length(password_hash) >= 50);

ALTER TABLE tenant_memberships
    ADD CONSTRAINT chk_membership_role_key CHECK (role_key IN ('OWNER', 'ADMIN', 'PURCHASING', 'FINANCE', 'REVIEWER'));

CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_tenant_memberships_user_tenant ON tenant_memberships(user_id, tenant_id);
