package com.novahexa.tracking.web;

import com.novahexa.tracking.dto.ParcelView;
import com.novahexa.tracking.service.ParcelService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
public class PublicPackageController {

    private final ParcelService parcels;

    public PublicPackageController(ParcelService parcels) {
        this.parcels = parcels;
    }

    /** Liste tous les colis (utilisé par le client pour ses propres colis). */
    @GetMapping
    public List<ParcelView> list() {
        return parcels.listAll().stream().map(ParcelView::of).toList();
    }

    /** Détail d'un colis par ID. */
    @GetMapping("/{id}")
    public ParcelView get(@PathVariable String id) {
        // Try to find by tracking number first, then by ID
        return parcels.listAll().stream()
                .filter(p -> p.getId().toString().equals(id))
                .findFirst()
                .map(ParcelView::of)
                .orElseGet(() -> {
                    // Search by tracking number
                    return parcels.listAll().stream()
                            .filter(p -> p.getTrackingNumber().equals(id))
                            .findFirst()
                            .map(ParcelView::of)
                            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                    org.springframework.http.HttpStatus.NOT_FOUND, "Colis introuvable"));
                });
    }

    /** Recherche par numéro de suivi (cahier §3.3). */
    @GetMapping("/tracking/{trackingNumber}")
    public ParcelView getByTracking(@PathVariable String trackingNumber) {
        return ParcelView.of(parcels.getByTrackingNumber(trackingNumber));
    }
}
