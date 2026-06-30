package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.Notification;
import com.novahexa.tracking.repository.NotificationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository repo;

    public NotificationController(NotificationRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Notification> list() {
        return repo.findAllByOrderByCreatedAtDesc();
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
    public Map<String, String> markAllRead() {
        repo.findAll().forEach(n -> {
            n.setRead(true);
            repo.save(n);
        });
        return Map.of("status", "all_read");
    }
}
