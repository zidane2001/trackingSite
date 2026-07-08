package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.domain.DeliveryDelay;
import com.novahexa.tracking.domain.MaterialType;
import com.novahexa.tracking.domain.TransportMode;
import com.novahexa.tracking.dto.ParcelView;
import com.novahexa.tracking.dto.RefuseRequest;
import com.novahexa.tracking.repository.AppUserRepository;
import com.novahexa.tracking.service.ParcelService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/packages")
public class AdminParcelController {

    private final ParcelService parcels;
    private final AppUserRepository users;

    public AdminParcelController(ParcelService parcels, AppUserRepository users) {
        this.parcels = parcels;
        this.users = users;
    }

    /** Résout l'admin depuis le token Bearer (UUID). */
    private AppUser resolveAdmin(Authentication auth) {
        if (auth == null) return null;
        String name = auth.getName();
        try {
            return users.findById(UUID.fromString(name)).orElse(null);
        } catch (IllegalArgumentException e) {
            return users.findByEmail(name).orElse(null);
        }
    }

    /** File de validation (cahier §6.2). status=PENDING (défaut) ou ALL. */
    @GetMapping
    public List<ParcelView> list(@RequestParam(defaultValue = "PENDING") String status) {
        var source = "ALL".equalsIgnoreCase(status) ? parcels.listAll() : parcels.listPending();
        return source.stream().map(ParcelView::ofList).toList();
    }

    /** Récupérer un colis par ID. */
    @GetMapping("/{id}")
    public ParcelView get(@PathVariable String id) {
        return ParcelView.of(parcels.getById(UUID.fromString(id)));
    }

    /** Modifier les informations d'un colis avant validation (cahier §6.2). */
    @PutMapping("/{id}")
    public ParcelView updateBeforeValidation(@PathVariable String id, @RequestBody UpdateParcelRequest body) {
        return ParcelView.of(parcels.updateBeforeValidation(UUID.fromString(id), body));
    }

    @PatchMapping("/{trackingNumber}/validate")
    public ParcelView validate(@PathVariable String trackingNumber,
                               @RequestBody(required = false) ValidateRequest body,
                               Authentication auth) {
        java.math.BigDecimal price = body != null ? body.price() : null;
        Integer demo = body != null ? body.demoDurationMinutes() : null;
        List<String> imageUrls = body != null ? body.imageUrls() : null;
        return ParcelView.of(parcels.validate(trackingNumber, resolveAdmin(auth), price, demo, imageUrls));
    }

    @PatchMapping("/{trackingNumber}/refuse")
    public ParcelView refuse(@PathVariable String trackingNumber, @Valid @RequestBody RefuseRequest body) {
        return ParcelView.of(parcels.refuse(trackingNumber, body.reason()));
    }

    /** Mettre le colis en transit. */
    @PatchMapping("/{trackingNumber}/in-transit")
    public ParcelView setInTransit(@PathVariable String trackingNumber, Authentication auth) {
        return ParcelView.of(parcels.setInTransit(trackingNumber, resolveAdmin(auth)));
    }

    /** Marquer le colis comme livré. */
    @PatchMapping("/{trackingNumber}/delivered")
    public ParcelView setDelivered(@PathVariable String trackingNumber, Authentication auth) {
        return ParcelView.of(parcels.setDelivered(trackingNumber, resolveAdmin(auth)));
    }

    /** Mettre le colis en pause. */
    @PatchMapping("/{trackingNumber}/pause")
    public ParcelView pause(@PathVariable String trackingNumber, Authentication auth) {
        return ParcelView.of(parcels.pause(trackingNumber, resolveAdmin(auth)));
    }

    /** Reprendre le colis (play). */
    @PatchMapping("/{trackingNumber}/resume")
    public ParcelView resume(@PathVariable String trackingNumber, Authentication auth) {
        return ParcelView.of(parcels.resume(trackingNumber, resolveAdmin(auth)));
    }

    /** Ajouter un waypoint. */
    @PostMapping("/{parcelId}/waypoints")
    public ParcelView addWaypoint(@PathVariable String parcelId, @RequestBody AddWaypointRequest body) {
        parcels.addWaypoint(parcelId, body.label(), body.lat(), body.lng(), body.stopDurationMinutes());
        return ParcelView.of(parcels.getById(UUID.fromString(parcelId)));
    }

    /** Supprimer un waypoint. */
    @DeleteMapping("/{parcelId}/waypoints/{waypointId}")
    public ParcelView deleteWaypoint(@PathVariable String parcelId, @PathVariable UUID waypointId) {
        parcels.deleteWaypoint(parcelId, waypointId);
        return ParcelView.of(parcels.getById(UUID.fromString(parcelId)));
    }

    /** Supprimer un colis. */
    @DeleteMapping("/{parcelId}")
    public void delete(@PathVariable String parcelId) {
        parcels.delete(parcelId);
    }

    /** Admin crée un colis directement (coordonnées depuis la carte). */
    @PostMapping("/create")
    @org.springframework.web.bind.annotation.ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public ParcelView create(@RequestBody ParcelService.AdminCreateRequest body, Authentication auth) {
        return ParcelView.of(parcels.createForClient(body, resolveAdmin(auth)));
    }

    record AddWaypointRequest(String label, double lat, double lng, Integer stopDurationMinutes) {}

    public record UpdateParcelRequest(
            String name,
            String description,
            String originAddress,
            String destinationAddress,
            TransportMode transportMode,
            DeliveryDelay deliveryDelay,
            String customDeliveryDelay,
            MaterialType material,
            BigDecimal weightKg,
            Integer heightCm,
            Integer widthCm,
            Integer lengthCm,
            BigDecimal estimatedCost,
            Integer demoDurationMinutes
    ) {}

    record ValidateRequest(BigDecimal price, Integer demoDurationMinutes, List<String> imageUrls) {}
}
