package com.novahexa.tracking.service;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.domain.PasswordResetToken;
import com.novahexa.tracking.domain.VerificationToken;
import com.novahexa.tracking.repository.AppUserRepository;
import com.novahexa.tracking.repository.PasswordResetTokenRepository;
import com.novahexa.tracking.repository.VerificationTokenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Gère la vérification d'email et la réinitialisation de mot de passe.
 */
@Service
public class AuthService {

    private final AppUserRepository users;
    private final VerificationTokenRepository verificationTokens;
    private final PasswordResetTokenRepository resetTokens;
    private final EmailService emailService;
    private final PasswordEncoder encoder;

    public AuthService(AppUserRepository users,
                       VerificationTokenRepository verificationTokens,
                       PasswordResetTokenRepository resetTokens,
                       EmailService emailService,
                       PasswordEncoder encoder) {
        this.users = users;
        this.verificationTokens = verificationTokens;
        this.resetTokens = resetTokens;
        this.emailService = emailService;
        this.encoder = encoder;
    }

    // ── Email Verification ───────────────────────────────────────

    /**
     * Crée un token de vérification et envoie l'email.
     * Appelé lors de l'inscription.
     */
    @Transactional
    public void sendVerificationEmail(AppUser user) {
        // Supprimer les anciens tokens de cet utilisateur
        verificationTokens.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(24, ChronoUnit.HOURS);
        verificationTokens.save(new VerificationToken(token, user, expiresAt));

        String verifyUrl = "http://localhost:5174/verify-email?token=" + token;
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verifyUrl);
    }

    /**
     * Vérifie l'email de l'utilisateur via le token.
     */
    @Transactional
    public void verifyEmail(String token) {
        VerificationToken vt = verificationTokens.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lien de vérification invalide"));

        if (vt.isExpired()) {
            verificationTokens.delete(vt);
            throw new ResponseStatusException(HttpStatus.GONE, "Lien de vérification expiré. Veuillez vous re-connecter.");
        }

        AppUser user = vt.getUser();
        user.setVerified(true);
        users.save(user);
        verificationTokens.delete(vt);
    }

    /**
     * Renvoie un email de vérification pour un utilisateur non vérifié.
     */
    @Transactional
    public void resendVerificationEmail(String email) {
        AppUser user = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucun compte associé à cet email"));

        if (user.isVerified()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà vérifié");
        }

        sendVerificationEmail(user);
    }

    // ── Password Reset ───────────────────────────────────────────

    /**
     * Envoie un email de réinitialisation de mot de passe.
     */
    @Transactional
    public void sendPasswordResetEmail(String email) {
        AppUser user = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucun compte associé à cet email"));

        // Supprimer les anciens tokens
        resetTokens.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(1, ChronoUnit.HOURS);
        resetTokens.save(new PasswordResetToken(token, user, expiresAt));

        String resetUrl = "http://localhost:5174/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetUrl);
    }

    /**
     * Réinitialise le mot de passe via le token.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken prt = resetTokens.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lien de réinitialisation invalide"));

        if (prt.isExpired()) {
            resetTokens.delete(prt);
            throw new ResponseStatusException(HttpStatus.GONE, "Lien de réinitialisation expiré. Veuillez faire une nouvelle demande.");
        }

        AppUser user = prt.getUser();
        user.setPasswordHash(encoder.encode(newPassword));
        users.save(user);
        resetTokens.delete(prt);
    }
}
