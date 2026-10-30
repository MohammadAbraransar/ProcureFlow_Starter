package com.procureflow.workspace;

import com.procureflow.auth.AuthDtos.MessageResponse;
import com.procureflow.auth.AuthDtos.WorkspaceResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces")
public class WorkspaceController {
    private final WorkspaceService service;
    public WorkspaceController(WorkspaceService service) { this.service = service; }

    public record CreateWorkspaceRequest(@NotBlank @Size(min=2,max=200) String legalName,
                                         @NotBlank @Size(min=2,max=160) String displayName) {}
    public record SelectWorkspaceRequest(@NotBlank String workspaceId) {}

    @GetMapping public List<WorkspaceResponse> list(Authentication auth) { return service.list(auth.getName()); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkspaceResponse create(Authentication auth, @Valid @RequestBody CreateWorkspaceRequest body) {
        return service.create(auth.getName(), body.legalName(), body.displayName());
    }

    @PostMapping("/select")
    public MessageResponse select(Authentication auth, @Valid @RequestBody SelectWorkspaceRequest body,
                                  HttpServletRequest request) {
        UUID id;
        try { id = UUID.fromString(body.workspaceId()); }
        catch (IllegalArgumentException ex) { throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid workspace ID"); }
        service.assertMembership(auth.getName(), id);
        request.getSession(true).setAttribute("ACTIVE_WORKSPACE_ID", id.toString());
        return new MessageResponse("Workspace selected");
    }
}
