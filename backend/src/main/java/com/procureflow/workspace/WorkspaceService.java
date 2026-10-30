package com.procureflow.workspace;

import com.procureflow.auth.AuthDtos.WorkspaceResponse;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class WorkspaceService {
    private final JdbcTemplate jdbc;
    public WorkspaceService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<WorkspaceResponse> list(String email) {
        return jdbc.query("""
            SELECT t.id, t.legal_name, t.display_name, m.role_key, t.status
            FROM tenants t JOIN tenant_memberships m ON m.tenant_id=t.id
            JOIN users u ON u.id=m.user_id
            WHERE u.email_normalised=? AND m.status='ACTIVE' AND t.status='ACTIVE'
            ORDER BY t.created_at
            """, (rs, row) -> new WorkspaceResponse(rs.getString("id"), rs.getString("legal_name"),
                rs.getString("display_name"), rs.getString("role_key"), rs.getString("status")), email);
    }

    @Transactional
    public WorkspaceResponse create(String email, String legalName, String displayName) {
        UUID userId = jdbc.queryForObject("SELECT id FROM users WHERE email_normalised=? AND status='ACTIVE'", UUID.class, email);
        UUID tenantId = UUID.randomUUID();
        jdbc.update("INSERT INTO tenants (id, legal_name, display_name, status, default_currency, timezone) VALUES (?, ?, ?, 'ACTIVE', 'INR', 'Asia/Kolkata')",
            tenantId, legalName.trim(), displayName.trim());
        jdbc.update("INSERT INTO tenant_memberships (id, tenant_id, user_id, role_key, status) VALUES (?, ?, ?, 'OWNER', 'ACTIVE')",
            UUID.randomUUID(), tenantId, userId);
        return new WorkspaceResponse(tenantId.toString(), legalName.trim(), displayName.trim(), "OWNER", "ACTIVE");
    }

    public void assertMembership(String email, UUID tenantId) {
        Integer count = jdbc.queryForObject("""
            SELECT COUNT(*) FROM tenant_memberships m JOIN users u ON u.id=m.user_id
            JOIN tenants t ON t.id=m.tenant_id
            WHERE u.email_normalised=? AND m.tenant_id=? AND m.status='ACTIVE' AND t.status='ACTIVE'
            """, Integer.class, email, tenantId);
        if (count == null || count != 1) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Workspace not found");
    }
}
