package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.domain.Role;
import com.novahexa.tracking.repository.AppUserRepository;
import com.novahexa.tracking.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final AuthService authService;
    private final com.novahexa.tracking.config.JwtService jwtService;

    public AuthController(AppUserRepository users, PasswordEncoder encoder, AuthService authService,
                          com.novahexa.tracking.config.JwtService jwtService) {
        this.users = users;
        this.encoder = encoder;
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest body) {
        AppUser user = users.findByEmail(body.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants incorrects"));

        if (!encoder.matches(body.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants incorrects");
        }

        String token = generateToken(user);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId().toString(),
                        "fullName", user.getFullName(),
                        "email", user.getEmail(),
                        "role", user.getRole().name(),
                        "verified", user.isVerified(),
                        "createdAt", user.getCreatedAt().toString()
                )
        ));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> register(@Valid @RequestBody RegisterRequest body) {
        if (users.existsByEmail(body.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé");
        }

        AppUser user = new AppUser();
        user.setFullName(body.fullName());
        user.setEmail(body.email());
        user.setPasswordHash(encoder.encode(body.password()));
        user.setPhone(body.phone());
        user.setRole(Role.CLIENT);
        user.setVerified(false);
        users.saveAndFlush(user); // flush pour garantir l'ID avant sendVerificationEmail

        // Envoyer l'email de vérification (non bloquant si ça échoue)
        try {
            authService.sendVerificationEmail(user);
        } catch (Exception e) {
            log.warn("Email de vérification échoué pour {}: {}", body.email(), e.getMessage());
        }

        return Map.of(
                "status", "registered",
                "message", "Inscription réussie. Vérifiez votre email pour activer votre compte."
        );
    }

    // ── Email Verification ─────────────────────────────────────

    @PostMapping("/verify-email")
    public Map<String, String> verifyEmail(@RequestBody VerifyEmailRequest body) {
        authService.verifyEmail(body.token());
        return Map.of("status", "verified", "message", "Email vérifié avec succès");
    }

    @PostMapping("/resend-verification")
    public Map<String, String> resendVerification(@RequestBody ResendVerificationRequest body) {
        authService.resendVerificationEmail(body.email());
        return Map.of("status", "sent", "message", "Un nouvel email de vérification a été envoyé");
    }

    // ── Password Reset ─────────────────────────────────────────

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@RequestBody ForgotPasswordRequest body) {
        // Ne pas révéler si l'email existe ou non (protection anti-énumération)
        try {
            authService.sendPasswordResetEmail(body.email());
        } catch (ResponseStatusException ignored) {
            // Silencieux pour éviter l'énumération d'emails
        }
        return Map.of("status", "sent", "message", "Si un compte est associé à cet email, un lien de réinitialisation a été envoyé.");
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest body) {
        authService.resetPassword(body.token(), body.password());
        return Map.of("status", "reset", "message", "Mot de passe réinitialisé avec succès");
    }

    // ── Helpers ────────────────────────────────────────────────

    private String generateToken(AppUser user) {
        return jwtService.generateToken(user.getId().toString(), user.getRole().name());
    }

    // ── DTOs ───────────────────────────────────────────────────

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
    public record RegisterRequest(@NotBlank String fullName, @NotBlank @Email String email, @NotBlank @Size(min = 6) String password, String phone) {}
    public record VerifyEmailRequest(@NotBlank String token) {}
    public record ResendVerificationRequest(@NotBlank @Email String email) {}
    public record ForgotPasswordRequest(@NotBlank @Email String email) {}
    public record ResetPasswordRequest(@NotBlank String token, @NotBlank @Size(min = 6) String password) {}
}
