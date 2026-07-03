package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.dto.ParcelView;
import com.novahexa.tracking.repository.AppUserRepository;
import com.novahexa.tracking.service.ParcelService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
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

    public ClientParcelController(ParcelService parcels, AppUserRepository users) {
        this.parcels = parcels;
        this.users = users;
    }

    @GetMapping("/packages")
    public List<ParcelView> listByOwner(Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentification requise");
        }
        AppUser user = users.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));
        return parcels.listByOwner(user.getId())
                .stream()
                .map(ParcelView::of)
                .toList();
    }

    @GetMapping("/packages/{id}")
    public ParcelView getById(@PathVariable UUID id, Authentication auth) {
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentification requise");
        }
        AppUser user = users.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));
        var parcel = parcels.getById(id);
        if (parcel.getOwner() == null || !parcel.getOwner().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès interdit");
        }
        return ParcelView.of(parcel);
    }
}
