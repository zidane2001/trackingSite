package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.domain.Notification;
import com.novahexa.tracking.repository.AppUserRepository;
import com.novahexa.tracking.repository.NotificationRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository repo;
    private final AppUserRepository users;

    public NotificationController(NotificationRepository repo, AppUserRepository users) {
        this.repo = repo;
        this.users = users;
    }

    /** Liste des notifications de l'utilisateur connecté (ou toutes si admin). */
    @GetMapping
    public List<Notification> list(Authentication auth) {
        AppUser user = resolveUser(auth);
        if (user == null) {
            return repo.findAllByOrderByCreatedAtDesc();
        }
        return repo.findByUserOrderByCreatedAtDesc(user);
    }

    /** Nombre de notifications non lues. */
    @GetMapping("/unread-count")
    public Map<String, Object> unreadCount(Authentication auth) {
        AppUser user = resolveUser(auth);
        if (user == null) {
            return Map.of("count", 0L);
        }
        long count = repo.countByUserAndReadFalse(user);
        return Map.of("count", count);
    }

    @PutMapping("/{id}/read")
    public Map<String, String> markRead(@PathVariable UUID id) {
        repo.findById(id).ifPresent(n -> {
            n.setRead(true);
            repo.save(n);
        });
        return Map.of("status", "read");
    }

    @PutMapping("/read-all")
    public Map<String, String> markAllRead(Authentication auth) {
        AppUser user = resolveUser(auth);
        if (user != null) {
            repo.findByUserOrderByCreatedAtDesc(user).forEach(n -> {
                n.setRead(true);
                repo.save(n);
            });
        } else {
            repo.findAll().forEach(n -> {
                n.setRead(true);
                repo.save(n);
            });
        }
        return Map.of("status", "all_read");
    }

    /** Résout l'utilisateur depuis le token Bearer (UUID) ou HTTP Basic (email). */
    private AppUser resolveUser(Authentication auth) {
        if (auth == null) return null;
        String name = auth.getName();
        try {
            UUID id = UUID.fromString(name);
            return users.findById(id).orElse(null);
        } catch (IllegalArgumentException e) {
            return users.findByEmail(name).orElse(null);
        }
    }
}
