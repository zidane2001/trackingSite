package com.novahexa.tracking.service;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.domain.Notification;
import com.novahexa.tracking.domain.Parcel;
import com.novahexa.tracking.repository.AppUserRepository;
import com.novahexa.tracking.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service centralisé de notifications : crée la notification interne ET envoie l'email.
 * Cahier §9 : chaque événement déclenche email + notification interne.
 */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notifications;
    private final AppUserRepository users;
    private final EmailService emailService;

    public NotificationService(NotificationRepository notifications,
                               AppUserRepository users,
                               EmailService emailService) {
        this.notifications = notifications;
        this.users = users;
        this.emailService = emailService;
    }

    // ── Soumission ──────────────────────────────────────────────

    @Transactional
    public void onSubmission(Parcel parcel) {
        AppUser owner = parcel.getOwner();
        if (owner == null) {
            log.warn("[NotificationService] Pas de propriétaire pour le colis {}", parcel.getTrackingNumber());
            return;
        }

        // Notification interne
        createInternal(owner, "SUBMISSION",
                "Votre demande de colis " + parcel.getTrackingNumber() + " a bien été enregistrée.");

        // Email
        emailService.sendSubmissionConfirmation(
                owner.getEmail(),
                owner.getFullName(),
                parcel.getTrackingNumber()
        );
    }

    // ── Validation ──────────────────────────────────────────────

    @Transactional
    public void onValidation(Parcel parcel) {
        AppUser owner = parcel.getOwner();
        if (owner == null) return;

        createInternal(owner, "VALIDATED",
                "Votre colis " + parcel.getTrackingNumber() + " a été validé.");

        emailService.sendValidationEmail(
                owner.getEmail(),
                owner.getFullName(),
                parcel.getTrackingNumber()
        );
    }

    // ── Refus ───────────────────────────────────────────────────

    @Transactional
    public void onRefusal(Parcel parcel, String reason) {
        AppUser owner = parcel.getOwner();
        if (owner == null) return;

        createInternal(owner, "REFUSED",
                "Votre colis " + parcel.getTrackingNumber() + " a été refusé. Motif : " + reason);

        emailService.sendRefusalEmail(
                owner.getEmail(),
                owner.getFullName(),
                parcel.getTrackingNumber(),
                reason
        );
    }

    // ── Point d'arrêt ───────────────────────────────────────────

    @Transactional
    public void onWaypointReached(Parcel parcel, String waypointLabel) {
        AppUser owner = parcel.getOwner();
        if (owner == null) return;

        createInternal(owner, "WAYPOINT",
                "Votre colis " + parcel.getTrackingNumber() + " a atteint l'étape : " + waypointLabel);

        emailService.sendWaypointEmail(
                owner.getEmail(),
                owner.getFullName(),
                parcel.getTrackingNumber(),
                waypointLabel
        );
    }

    // ── Livraison ───────────────────────────────────────────────

    @Transactional
    public void onDelivery(Parcel parcel) {
        AppUser owner = parcel.getOwner();
        if (owner == null) return;

        createInternal(owner, "DELIVERED",
                "Votre colis " + parcel.getTrackingNumber() + " a été livré ! 🎉");

        emailService.sendDeliveryEmail(
                owner.getEmail(),
                owner.getFullName(),
                parcel.getTrackingNumber()
        );
    }

    // ── Message admin → client ──────────────────────────────────

    @Transactional
    public void onAdminMessage(Parcel parcel, String subject, String messageBody) {
        AppUser owner = parcel.getOwner();
        if (owner == null) return;

        createInternal(owner, "MESSAGE",
                "Nouveau message concernant votre colis " + parcel.getTrackingNumber() + " : " + subject);

        emailService.sendAdminMessageEmail(
                owner.getEmail(),
                owner.getFullName(),
                parcel.getTrackingNumber(),
                subject,
                messageBody
        );
    }

    // ── Création notification interne ───────────────────────────

    private void createInternal(AppUser user, String type, String content) {
        Notification n = new Notification();
        n.setUser(user);
        n.setType(type);
        n.setContent(content);
        n.setRead(false);
        notifications.save(n);
    }
}
