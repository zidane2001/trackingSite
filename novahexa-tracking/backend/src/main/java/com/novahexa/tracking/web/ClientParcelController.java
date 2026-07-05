package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.dto.ParcelView;
import com.novahexa.tracking.repository.AppUserRepository;
import com.novahexa.tracking.repository.MessageRepository;
import com.novahexa.tracking.service.MessageService;
import com.novahexa.tracking.service.ParcelService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;


/**
 * Endpoint client : liste les colis de l'utilisateur connecté.
 * GET /api/client/packages
 */
@RestController
@RequestMapping("/api/client")
public class ClientParcelController {

    private final ParcelService parcels;
    private final AppUserRepository users;
    private final MessageRepository messageRepo;
    private final MessageService messageService;

    public ClientParcelController(ParcelService parcels, AppUserRepository users,
                                  MessageRepository messageRepo, MessageService messageService) {
        this.parcels = parcels;
        this.users = users;
        this.messageRepo = messageRepo;
        this.messageService = messageService;
    }

    @GetMapping("/packages")
    public List<ParcelView> listByOwner(Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentification requise");
        }
        AppUser user = resolveUser(auth);
        return parcels.listByOwner(user.getId())
                .stream()
                .map(ParcelView::ofList)
                .toList();
    }

    @GetMapping("/packages/{id}")
    public ParcelView getById(@PathVariable UUID id, Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentification requise");
        }
        AppUser user = resolveUser(auth);
        var parcel = parcels.getById(id);
        if (parcel.getOwner() == null || !parcel.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès interdit");
        }
        var msgs = messageRepo.findByParcelIdOrderBySentAtDesc(parcel.getId());
        return ParcelView.of(parcel, msgs);
    }

    /**
     * Envoie un message client → admin pour un colis possédé par le client.
     */
    @PostMapping("/packages/{id}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public ParcelView.MessageView sendMessage(@PathVariable UUID id,
                               @RequestBody Map<String, String> body,
                               Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentification requise");
        }
        AppUser user = resolveUser(auth);

        String subject = body.getOrDefault("subject", "Message");
        String msgBody = body.getOrDefault("body", "");
        if (msgBody.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le message ne peut pas être vide");
        }

        return ParcelView.MessageView.of(messageService.sendClientMessage(id, subject, msgBody, user));
    }

    /**
     * Récupère les messages d'un colis possédé par le client.
     */
    @GetMapping("/packages/{id}/messages")
    public List<ParcelView.MessageView> listMessages(@PathVariable UUID id, Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentification requise");
        }
        AppUser user = resolveUser(auth);
        var parcel = parcels.getById(id);
        if (parcel.getOwner() == null || !parcel.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès interdit");
        }
        return messageRepo.findByParcelIdOrderBySentAtDesc(id)
                .stream().map(ParcelView.MessageView::of).toList();
    }

    /** Résout l'utilisateur depuis le token Bearer (UUID) ou HTTP Basic (email). */
    private AppUser resolveUser(Authentication auth) {
        String name = auth.getName();
        try {
            UUID id = UUID.fromString(name);
            return users.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));
        } catch (IllegalArgumentException e) {
            return users.findByEmail(name)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));
        }
    }
}
