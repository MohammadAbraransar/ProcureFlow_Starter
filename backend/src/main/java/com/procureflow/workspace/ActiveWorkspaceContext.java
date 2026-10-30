package com.procureflow.workspace;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/** Resolves the active tenant from server-side session state and rechecks membership.
 * Business services must call requireTenantId before reading or writing tenant data.
 */
@Component
public class ActiveWorkspaceContext {
    private final JdbcTemplate jdbc;
    public ActiveWorkspaceContext(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public UUID requireTenantId(Authentication authentication, HttpServletRequest request) {
        if (authentication == null || !authentication.isAuthenticated())
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        var session = request.getSession(false);
        String activeId = session == null ? null : (String) session.getAttribute("ACTIVE_WORKSPACE_ID");
        if (activeId == null) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Select a workspace first");
        UUID tenantId;
        try { tenantId = UUID.fromString(activeId); }
        catch (IllegalArgumentException ex) { throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid workspace context"); }
        Integer count = jdbc.queryForObject("""
            SELECT COUNT(*) FROM tenant_memberships m
            JOIN users u ON u.id=m.user_id JOIN tenants t ON t.id=m.tenant_id
            WHERE u.email_normalised=? AND m.tenant_id=? AND m.status='ACTIVE' AND t.status='ACTIVE'
            """, Integer.class, authentication.getName(), tenantId);
        if (count == null || count != 1) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Workspace membership is not active");
        return tenantId;
    }
}
