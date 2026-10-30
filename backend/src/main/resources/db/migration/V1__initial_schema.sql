-- Initial minimal schema foundation. Extend only through versioned migrations.
-- Tenant-aware tables carry tenant_id. RLS and tenant context wiring are not
-- implemented in this first scaffold and are mandatory before business data use.

CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    legal_name VARCHAR(200) NOT NULL,
    display_name VARCHAR(160) NOT NULL,
    status VARCHAR(24) NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED')),
    default_currency CHAR(3) NOT NULL DEFAULT 'INR',
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email_normalised VARCHAR(320) NOT NULL UNIQUE,
    identity_subject VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    status VARCHAR(24) NOT NULL CHECK (status IN ('INVITED', 'ACTIVE', 'LOCKED', 'DISABLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tenant_memberships (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role_key VARCHAR(40) NOT NULL,
    status VARCHAR(24) NOT NULL CHECK (status IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, user_id),
    UNIQUE (tenant_id, id)
);

CREATE INDEX idx_membership_user_status ON tenant_memberships(user_id, status);
CREATE INDEX idx_membership_tenant_status ON tenant_memberships(tenant_id, status);
