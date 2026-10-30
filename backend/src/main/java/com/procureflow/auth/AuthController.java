package com.procureflow.auth;

import com.procureflow.auth.AuthDtos.*;
import com.procureflow.workspace.WorkspaceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final WorkspaceService workspaces;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository contextRepository;
    private final JdbcTemplate jdbc;
    private final CsrfTokenRepository csrfRepository;

    public AuthController(AuthService authService, WorkspaceService workspaces, AuthenticationManager authenticationManager,
                          SecurityContextRepository contextRepository, JdbcTemplate jdbc, CsrfTokenRepository csrfRepository) {
        this.authService = authService; this.workspaces = workspaces;
        this.authenticationManager = authenticationManager; this.contextRepository = contextRepository; this.jdbc = jdbc;
        this.csrfRepository = csrfRepository;
    }

    private UserResponse userResponse(String email) {
        UUID id = jdbc.queryForObject("SELECT id FROM users WHERE email_normalised=?", UUID.class, email);
        return new UserResponse(id.toString(), email);
    }

    @GetMapping("/csrf")
    public CsrfResponse csrf(CsrfToken token) { return new CsrfResponse("X-CSRF-TOKEN", token.getToken()); }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return new MessageResponse("Account and company workspace created. Sign in to continue.");
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest,
                              HttpServletResponse response) {
        String email = request.email().trim().toLowerCase(java.util.Locale.ROOT);
        Authentication authentication = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken.unauthenticated(email, request.password()));
        var memberships = workspaces.list(email);
        if (memberships.isEmpty()) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No active workspace membership");
        if (httpRequest.getSession(false) != null) httpRequest.changeSessionId();
        else httpRequest.getSession(true);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        contextRepository.saveContext(context, httpRequest, response);
        csrfRepository.saveToken(null, httpRequest, response);
        httpRequest.getSession(true).setAttribute("ACTIVE_WORKSPACE_ID", memberships.getFirst().id());
        return new AuthResponse(userResponse(email), memberships, memberships.getFirst().id());
    }

    @GetMapping("/me")
    public AuthResponse me(Authentication authentication, HttpServletRequest request) {
        var memberships = workspaces.list(authentication.getName());
        HttpSession session = request.getSession(false);
        String active = session == null ? null : (String) session.getAttribute("ACTIVE_WORKSPACE_ID");
        if (active != null && memberships.stream().noneMatch(w -> w.id().equals(active))) active = null;
        return new AuthResponse(userResponse(authentication.getName()), memberships, active);
    }

    @PostMapping("/logout")
    public MessageResponse logout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return new MessageResponse("Signed out");
    }
}
