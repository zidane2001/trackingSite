package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.domain.Message;
import com.novahexa.tracking.repository.AppUserRepository;
import com.novahexa.tracking.service.MessageService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller de messagerie admin → client pour un colis.
 * POST /api/admin/packages/{parcelId}/messages → envoi message
 * GET  /api/admin/packages/{parcelId}/messages → historique
 */
@RestController
@RequestMapping("/api")
public class MessageController {

    private final MessageService messageService;
    private final AppUserRepository users;

    public MessageController(MessageService messageService, AppUserRepository users) {
        this.messageService = messageService;
        this.users = users;
    }

    /** Envoie un message admin concernant un colis. */
    @PostMapping("/admin/packages/{parcelId}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public Message send(@PathVariable UUID parcelId,
                        @RequestBody Map<String, String> body,
                        Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentification requise");
        }
        AppUser admin = users.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin introuvable"));

        String subject = body.getOrDefault("subject", "Message");
        String msgBody = body.getOrDefault("body", "");
        if (msgBody.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le message ne peut pas être vide");
        }

        return messageService.sendAdminMessage(parcelId, subject, msgBody, admin);
    }

    /** Historique des messages d'un colis. */
    @GetMapping("/admin/packages/{parcelId}/messages")
    public List<Message> list(@PathVariable UUID parcelId) {
        return messageService.getMessages(parcelId);
    }
}
