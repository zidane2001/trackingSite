package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.domain.Role;
import com.novahexa.tracking.repository.AppUserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository users;
    private final PasswordEncoder encoder;

    public AuthController(AppUserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest body) {
        AppUser user = users.findByEmail(body.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants incorrects"));

        if (!encoder.matches(body.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants incorrects");
        }

        // Simple token: user ID + role encoded (production should use JWT library)
        String token = generateToken(user);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId().toString(),
                        "fullName", user.getFullName(),
                        "email", user.getEmail(),
                        "role", user.getRole().name(),
                        "createdAt", user.getCreatedAt().toString()
                )
        ));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(@Valid @RequestBody RegisterRequest body) {
        if (users.existsByEmail(body.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé");
        }

        AppUser user = new AppUser();
        user.setFullName(body.fullName());
        user.setEmail(body.email());
        user.setPasswordHash(encoder.encode(body.password()));
        user.setPhone(body.phone());
        user.setRole(Role.CLIENT);
        user.setVerified(true);
        users.save(user);

        return Map.of("status", "registered");
    }

    private String generateToken(AppUser user) {
        // Simple base64-like token (replace with JWT library in production)
        return java.util.Base64.getEncoder().encodeToString(
                (user.getId() + ":" + user.getRole().name() + ":" + System.currentTimeMillis()).getBytes()
        );
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
    public record RegisterRequest(@NotBlank String fullName, @NotBlank @Email String email, @NotBlank String password, String phone) {}
}
