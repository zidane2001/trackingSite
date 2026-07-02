package com.novahexa.tracking.service;

import com.novahexa.tracking.domain.Message;
import com.novahexa.tracking.domain.Parcel;
import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.repository.MessageRepository;
import com.novahexa.tracking.repository.ParcelRepository;
import com.novahexa.tracking.repository.AppUserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service de messagerie admin ↔ client pour chaque colis.
 * Cahier §8 : communication bidirectionnelle avec notifications.
 */
@Service
public class MessageService {

    private final MessageRepository messages;
    private final ParcelRepository parcels;
    private final AppUserRepository users;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate wsTemplate;

    public MessageService(MessageRepository messages, ParcelRepository parcels,
                          AppUserRepository users, NotificationService notificationService,
                          SimpMessagingTemplate wsTemplate) {
        this.messages = messages;
        this.parcels = parcels;
        this.users = users;
        this.notificationService = notificationService;
        this.wsTemplate = wsTemplate;
    }

    /**
     * Envoie un message admin → client concernant un colis.
     */
    @Transactional
    public Message sendAdminMessage(UUID parcelId, String subject, String body, AppUser admin) {
        Parcel parcel = parcels.findById(parcelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Colis introuvable"));

        Message msg = new Message();
        msg.setParcel(parcel);
        msg.setSender(admin);
        msg.setSubject(subject);
        msg.setBody(body);
        Message saved = messages.save(msg);

        // Notification interne + email
        notificationService.onAdminMessage(parcel, subject, body);

        // WebSocket push
        if (parcel.getOwner() != null) {
            wsTemplate.convertAndSend(
                    "/topic/notifications/" + parcel.getOwner().getId(),
                    Map.of(
                            "type", "MESSAGE",
                            "content", "Nouveau message : " + subject,
                            "parcelId", parcelId.toString(),
                            "trackingNumber", parcel.getTrackingNumber()
                    )
            );
        }

        return saved;
    }

    /**
     * Récupère les messages d'un colis.
     */
    @Transactional(readOnly = true)
    public List<Message> getMessages(UUID parcelId) {
        return messages.findByParcelIdOrderBySentAtDesc(parcelId);
    }
}
