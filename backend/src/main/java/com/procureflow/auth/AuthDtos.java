package com.procureflow.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}
    public record RegisterRequest(
        @NotBlank @Email @Size(max = 320) String email,
        @NotBlank @Size(min = 12, max = 72) String password,
        @NotBlank @Size(min = 2, max = 200) String legalCompanyName,
        @NotBlank @Size(min = 2, max = 160) String workspaceName
    ) {}
    public record LoginRequest(@NotBlank @Email @Size(max = 320) String email,
                               @NotBlank @Size(max = 72) String password) {}
    public record UserResponse(String id, String email) {}
    public record WorkspaceResponse(String id, String legalName, String displayName, String role, String status) {}
    public record AuthResponse(UserResponse user, java.util.List<WorkspaceResponse> workspaces, String activeWorkspaceId) {}
    public record CsrfResponse(String headerName, String token) {}
    public record MessageResponse(String message) {}
}
