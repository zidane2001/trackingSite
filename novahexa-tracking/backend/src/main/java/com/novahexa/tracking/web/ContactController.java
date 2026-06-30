package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.ContactMessage;
import com.novahexa.tracking.dto.ContactRequest;
import com.novahexa.tracking.repository.ContactMessageRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactMessageRepository repo;

    public ContactController(ContactMessageRepository repo) {
        this.repo = repo;
    }

    /** Liste des messages de contact (admin). */
    @GetMapping
    public List<ContactMessage> list() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    /** Formulaire de contact public (cahier §3.6). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> send(@Valid @RequestBody ContactRequest req) {
        ContactMessage m = new ContactMessage();
        m.setName(req.name());
        m.setEmail(req.email());
        m.setMessage(req.message());
        repo.save(m);
        return Map.of("status", "received");
    }

    /** Marquer un message comme traité (admin). */
    @PutMapping("/{id}/treat")
    public Map<String, String> markTreated(@PathVariable UUID id) {
        repo.findById(id).ifPresent(m -> {
            m.setStatus(com.novahexa.tracking.domain.ContactStatus.TRAITE);
            repo.save(m);
        });
        return Map.of("status", "treated");
    }
}
