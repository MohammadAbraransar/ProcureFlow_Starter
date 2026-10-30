package com.procureflow;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:procureflow-auth;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.flyway.enabled=true",
    "app.cors.allowed-origin=http://localhost:4200"
})
@AutoConfigureMockMvc
class AuthenticationWorkspaceTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    @Test
    void registrationCreatesAnOwnerAndWorkspaceAndLoginCreatesSession() throws Exception {
        String email = "owner-" + java.util.UUID.randomUUID() + "@example.test";
        String body = "{\"email\":\"" + email + "\",\"password\":\"CorrectHorseBattery9!\",\"legalCompanyName\":\"Example Manufacturing Pvt Ltd\",\"workspaceName\":\"Example Workspace\"}";
        mvc.perform(post("/api/v1/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.message").exists());
        org.junit.jupiter.api.Assertions.assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM tenant_memberships m JOIN users u ON u.id=m.user_id WHERE u.email_normalised=? AND m.role_key='OWNER'", Integer.class, email));

        var login = mvc.perform(post("/api/v1/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"CorrectHorseBattery9!\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.user.email").value(email))
            .andExpect(jsonPath("$.workspaces[0].role").value("OWNER"))
            .andReturn();
        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        org.junit.jupiter.api.Assertions.assertNotNull(session);
        mvc.perform(get("/api/v1/auth/me").session(session)).andExpect(status().isOk())
            .andExpect(jsonPath("$.activeWorkspaceId").isNotEmpty());
    }

    @Test
    void duplicateEmailIsRejected() throws Exception {
        String email = "duplicate-" + java.util.UUID.randomUUID() + "@example.test";
        String body = "{\"email\":\"" + email + "\",\"password\":\"CorrectHorseBattery9!\",\"legalCompanyName\":\"Example Manufacturing Pvt Ltd\",\"workspaceName\":\"Example Workspace\"}";
        mvc.perform(post("/api/v1/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isCreated());
        mvc.perform(post("/api/v1/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isConflict());
    }

    @Test
    void unauthenticatedWorkspaceAccessIsRejected() throws Exception {
        mvc.perform(get("/api/v1/workspaces")).andExpect(status().isUnauthorized());
    }

    @Test
    void stateChangingRegistrationRequiresCsrfToken() throws Exception {
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"csrf@example.test\",\"password\":\"CorrectHorseBattery9!\",\"legalCompanyName\":\"Example Manufacturing Pvt Ltd\",\"workspaceName\":\"Example Workspace\"}"))
            .andExpect(status().isForbidden());
    }

    @Test
    void userCannotSelectWorkspaceWithoutMembership() throws Exception {
        String email = "tenant-" + java.util.UUID.randomUUID() + "@example.test";
        String register = "{\"email\":\"" + email + "\",\"password\":\"CorrectHorseBattery9!\",\"legalCompanyName\":\"Example Manufacturing Pvt Ltd\",\"workspaceName\":\"Example Workspace\"}";
        mvc.perform(post("/api/v1/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(register)).andExpect(status().isCreated());
        var login = mvc.perform(post("/api/v1/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"" + email + "\",\"password\":\"CorrectHorseBattery9!\"}"))
            .andExpect(status().isOk()).andReturn();
        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        mvc.perform(post("/api/v1/workspaces/select").session(session).with(csrf())
            .contentType(MediaType.APPLICATION_JSON).content("{\"workspaceId\":\"" + java.util.UUID.randomUUID() + "\"}"))
            .andExpect(status().isNotFound());
    }

    @Test
    void invalidPasswordAndWorkspaceInputAreRejected() throws Exception {
        mvc.perform(post("/api/v1/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON)
            .content("{\"email\":\"bad@example.test\",\"password\":\"short\",\"legalCompanyName\":\"Example Company\",\"workspaceName\":\"Example\"}"))
            .andExpect(status().isBadRequest());
    }
}
