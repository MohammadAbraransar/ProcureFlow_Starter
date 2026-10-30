package com.procureflow.auth;

import com.procureflow.auth.AuthDtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class AuthService {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    public AuthService(JdbcTemplate jdbc, PasswordEncoder encoder) { this.jdbc = jdbc; this.encoder = encoder; }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(java.util.Locale.ROOT);
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at most 72 UTF-8 bytes");
        if (jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE email_normalised = ?", Integer.class, email) > 0)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        UUID userId = UUID.randomUUID();
        UUID tenantId = UUID.randomUUID();
        jdbc.update("INSERT INTO users (id, email_normalised, password_hash, status) VALUES (?, ?, ?, 'ACTIVE')",
            userId, email, encoder.encode(request.password()));
        jdbc.update("INSERT INTO tenants (id, legal_name, display_name, status, default_currency, timezone) VALUES (?, ?, ?, 'ACTIVE', 'INR', 'Asia/Kolkata')",
            tenantId, request.legalCompanyName().trim(), request.workspaceName().trim());
        jdbc.update("INSERT INTO tenant_memberships (id, tenant_id, user_id, role_key, status) VALUES (?, ?, ?, 'OWNER', 'ACTIVE')",
            UUID.randomUUID(), tenantId, userId);
        return new UserResponse(userId.toString(), email);
    }
}
