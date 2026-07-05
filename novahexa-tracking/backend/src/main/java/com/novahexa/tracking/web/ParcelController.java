package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.dto.ParcelSubmissionRequest;
import com.novahexa.tracking.dto.ParcelSubmissionResponse;
import com.novahexa.tracking.dto.ParcelView;
import com.novahexa.tracking.repository.AppUserRepository;
import com.novahexa.tracking.service.ParcelService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ParcelController {

    private final ParcelService parcels;
    private final AppUserRepository users;

    public ParcelController(ParcelService parcels, AppUserRepository users) {
        this.parcels = parcels;
        this.users = users;
    }

    /** Soumission d'un colis depuis le formulaire du hero (public ou authentifié). */
    @PostMapping("/packages")
    @ResponseStatus(HttpStatus.CREATED)
    public ParcelSubmissionResponse submit(@Valid @RequestBody ParcelSubmissionRequest req,
                                           Authentication auth) {
        AppUser owner = resolveOwner(auth);
        return parcels.submit(req, owner);
    }

    /** Suivi public par numéro (cahier §3.3). */
    @GetMapping("/track/{trackingNumber}")
    public ParcelView track(@PathVariable String trackingNumber) {
        return ParcelView.of(parcels.getByTrackingNumber(trackingNumber));
    }

    /** Résout l'owner depuis le token Bearer (UUID) si connecté, sinon null. */
    private AppUser resolveOwner(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        String name = auth.getName();
        try {
            return users.findById(UUID.fromString(name)).orElse(null);
        } catch (IllegalArgumentException e) {
            return users.findByEmail(name).orElse(null);
        }
    }
}
