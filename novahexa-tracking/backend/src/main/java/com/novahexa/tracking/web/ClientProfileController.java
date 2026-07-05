package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.repository.AppUserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/client")
public class ClientProfileController {

    private final AppUserRepository users;
    private final PasswordEncoder encoder;

    public ClientProfileController(AppUserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    /** Récupérer le profil de l'utilisateur connecté. */
    @GetMapping("/profile")
    public Map<String, Object> getProfile(Authentication auth) {
        AppUser user = requireUser(auth);
        return Map.of(
                "id", user.getId().toString(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "role", user.getRole().name(),
                "verified", user.isVerified(),
                "createdAt", user.getCreatedAt().toString()
        );
    }

    /** Modifier le profil (nom, email, téléphone). */
    @PutMapping("/profile")
    public Map<String, Object> updateProfile(Authentication auth, @Valid @RequestBody UpdateProfileRequest body) {
        AppUser user = requireUser(auth);

        if (body.fullName() != null && !body.fullName().isBlank()) {
            user.setFullName(body.fullName());
        }
        if (body.email() != null && !body.email().isBlank()) {
            if (!user.getEmail().equals(body.email()) && users.existsByEmail(body.email())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé");
            }
            user.setEmail(body.email());
        }
        if (body.phone() != null) {
            user.setPhone(body.phone());
        }

        users.save(user);

        return Map.of(
                "id", user.getId().toString(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "role", user.getRole().name(),
                "verified", user.isVerified()
        );
    }

    /** Changer le mot de passe. */
    @PutMapping("/profile/password")
    public Map<String, String> changePassword(Authentication auth, @Valid @RequestBody ChangePasswordRequest body) {
        AppUser user = requireUser(auth);

        if (!encoder.matches(body.currentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mot de passe actuel incorrect");
        }

        user.setPasswordHash(encoder.encode(body.newPassword()));
        users.save(user);

        return Map.of("status", "updated", "message", "Mot de passe mis à jour avec succès");
    }

    private AppUser requireUser(Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentification requise");
        }
        return users.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));
    }

    public record UpdateProfileRequest(String fullName, String email, String phone) {}
    public record ChangePasswordRequest(@jakarta.validation.constraints.NotBlank String currentPassword, @jakarta.validation.constraints.NotBlank @Size(min = 6) String newPassword) {}
}
