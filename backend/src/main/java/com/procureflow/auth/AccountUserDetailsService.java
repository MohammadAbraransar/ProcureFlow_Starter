package com.procureflow.auth;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AccountUserDetailsService implements UserDetailsService {
    private final JdbcTemplate jdbc;
    public AccountUserDetailsService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String normalisedEmail = email.toLowerCase(java.util.Locale.ROOT);
        return jdbc.query("SELECT email_normalised, password_hash, status FROM users WHERE email_normalised = ?",
            rs -> {
                if (!rs.next()) throw new UsernameNotFoundException("Invalid email or password");
                String status = rs.getString("status");
                if (!"ACTIVE".equals(status)) throw new UsernameNotFoundException("Invalid email or password");
                return User.withUsername(rs.getString("email_normalised"))
                    .password(rs.getString("password_hash"))
                    .roles("USER")
                    .build();
            }, normalisedEmail);
    }
}
