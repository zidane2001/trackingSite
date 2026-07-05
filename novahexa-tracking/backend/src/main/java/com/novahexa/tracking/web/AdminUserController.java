package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.repository.AppUserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AppUserRepository users;

    public AdminUserController(AppUserRepository users) {
        this.users = users;
    }

    /** Liste de tous les clients (pour le select de création de colis). */
    @GetMapping
    public List<ClientSummary> listClients() {
        return users.findAll().stream()
                .map(u -> new ClientSummary(
                        u.getId(),
                        u.getFullName(),
                        u.getEmail(),
                        u.getPhone(),
                        u.getRole().name(),
                        u.isVerified()
                ))
                .toList();
    }

    public record ClientSummary(
            UUID id,
            String fullName,
            String email,
            String phone,
            String role,
            boolean verified
    ) {}
}
