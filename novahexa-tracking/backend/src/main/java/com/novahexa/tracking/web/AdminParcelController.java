package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.dto.ParcelView;
import com.novahexa.tracking.dto.RefuseRequest;
import com.novahexa.tracking.repository.AppUserRepository;
import com.novahexa.tracking.service.ParcelService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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

    /** File de validation (cahier §6.2). status=PENDING (défaut) ou ALL. */
    @GetMapping
    public List<ParcelView> list(@RequestParam(defaultValue = "PENDING") String status) {
        var source = "ALL".equalsIgnoreCase(status) ? parcels.listAll() : parcels.listPending();
        return source.stream().map(ParcelView::of).toList();
    }

    /** Récupérer un colis par ID. */
    @GetMapping("/{id}")
    public ParcelView get(@PathVariable String id) {
        return ParcelView.of(parcels.getById(UUID.fromString(id)));
    }

    @PatchMapping("/{trackingNumber}/validate")
    public ParcelView validate(@PathVariable String trackingNumber, Authentication auth) {
        AppUser admin = (auth != null)
                ? users.findByEmail(auth.getName()).orElse(null)
                : null;
        return ParcelView.of(parcels.validate(trackingNumber, admin));
    }

    @PatchMapping("/{trackingNumber}/refuse")
    public ParcelView refuse(@PathVariable String trackingNumber, @Valid @RequestBody RefuseRequest body) {
        return ParcelView.of(parcels.refuse(trackingNumber, body.reason()));
    }

    /** Mettre le colis en transit. */
    @PatchMapping("/{trackingNumber}/in-transit")
    public ParcelView setInTransit(@PathVariable String trackingNumber, Authentication auth) {
        AppUser admin = (auth != null)
                ? users.findByEmail(auth.getName()).orElse(null)
                : null;
        return ParcelView.of(parcels.setInTransit(trackingNumber, admin));
    }

    /** Marquer le colis comme livré. */
    @PatchMapping("/{trackingNumber}/delivered")
    public ParcelView setDelivered(@PathVariable String trackingNumber, Authentication auth) {
        AppUser admin = (auth != null)
                ? users.findByEmail(auth.getName()).orElse(null)
                : null;
        return ParcelView.of(parcels.setDelivered(trackingNumber, admin));
    }

    /** Ajouter un waypoint. */
    @PostMapping("/{parcelId}/waypoints")
    public ParcelView addWaypoint(@PathVariable String parcelId, @RequestBody AddWaypointRequest body) {
        parcels.addWaypoint(parcelId, body.label(), body.lat(), body.lng());
        return ParcelView.of(parcels.getById(UUID.fromString(parcelId)));
    }

    /** Supprimer un waypoint. */
    @DeleteMapping("/{parcelId}/waypoints/{waypointId}")
    public ParcelView deleteWaypoint(@PathVariable String parcelId, @PathVariable Long waypointId) {
        parcels.deleteWaypoint(parcelId, waypointId);
        return ParcelView.of(parcels.getById(UUID.fromString(parcelId)));
    }

    /** Supprimer un colis. */
    @DeleteMapping("/{parcelId}")
    public void delete(@PathVariable String parcelId) {
        parcels.delete(parcelId);
    }

    record AddWaypointRequest(String label, double lat, double lng) {}
}
