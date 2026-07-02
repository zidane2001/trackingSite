package com.novahexa.tracking.dto;

import com.novahexa.tracking.domain.Parcel;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Vue lecture d'un colis (suivi public + liste admin). */
public record ParcelView(
        String trackingNumber,
        String name,
        String status,
        String senderName,
        String originAddress,
        Double originLat,
        Double originLng,
        String destinationAddress,
        Double destinationLat,
        Double destinationLng,
        String transportMode,
        String material,
        BigDecimal weightKg,
        BigDecimal estimatedCost,
        String estimatedDuration,
        String refusalReason,
        Instant createdAt,
        Instant validatedAt,
        String ownerName,
        String ownerEmail,
        String photoUrl,
        List<WaypointView> waypoints
) {
    public static ParcelView of(Parcel p) {
        return new ParcelView(
                p.getTrackingNumber(),
                p.getName(),
                p.getStatus().name(),
                p.getSenderName(),
                p.getOriginAddress(),
                p.getOriginLat(),
                p.getOriginLng(),
                p.getDestinationAddress(),
                p.getDestinationLat(),
                p.getDestinationLng(),
                p.getTransportMode() != null ? p.getTransportMode().name() : null,
                p.getMaterial() != null ? p.getMaterial().name() : null,
                p.getWeightKg(),
                p.getEstimatedCost(),
                p.getEstimatedDurationMinutes() != null ? p.getEstimatedDurationMinutes() + " min" : null,
                p.getRefusalReason(),
                p.getCreatedAt(),
                p.getValidatedAt(),
                p.getOwner() != null ? p.getOwner().getFullName() : null,
                p.getOwner() != null ? p.getOwner().getEmail() : null,
                p.getPhotoUrl(),
                p.getWaypoints() != null ? p.getWaypoints().stream().map(WaypointView::of).toList() : null
        );
    }
}

/** Vue d'un waypoint pour l'affichage sur la carte. */
record WaypointView(
        UUID id,
        String label,
        Integer orderIndex,
        Double lat,
        Double lng,
        Instant estimatedArrival,
        Instant reachedAt
) {
    static WaypointView of(com.novahexa.tracking.domain.Waypoint w) {
        return new WaypointView(
                w.getId(),
                w.getLabel(),
                w.getOrderIndex(),
                w.getLat(),
                w.getLng(),
                w.getEstimatedArrival(),
                w.getReachedAt()
        );
    }
}
