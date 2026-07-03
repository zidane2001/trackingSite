package com.novahexa.tracking.dto;

import com.novahexa.tracking.domain.Parcel;
import com.novahexa.tracking.domain.TrackingEvent;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Vue lecture d'un colis (suivi public + liste admin). */
public record ParcelView(
        UUID id,
        String trackingNumber,
        String name,
        String description,
        String status,
        String senderName,
        String senderEmail,
        String senderPhone,
        String originAddress,
        Double originLat,
        Double originLng,
        String destinationAddress,
        Double destinationLat,
        Double destinationLng,
        String transportMode,
        String deliveryDelay,
        String material,
        BigDecimal weightKg,
        Integer heightCm,
        Integer widthCm,
        Integer lengthCm,
        BigDecimal estimatedCost,
        String estimatedDuration,
        String refusalReason,
        String shippingDate,
        Instant createdAt,
        Instant validatedAt,
        Instant updatedAt,
        String ownerName,
        String ownerEmail,
        String photoUrl,
        List<WaypointView> waypoints,
        List<TrackingEventView> trackingEvents
) {
    public static ParcelView of(Parcel p) {
        return new ParcelView(
                p.getId(),
                p.getTrackingNumber(),
                p.getName(),
                p.getDescription(),
                p.getStatus().name(),
                p.getSenderName(),
                p.getSenderEmail(),
                p.getSenderPhone(),
                p.getOriginAddress(),
                p.getOriginLat(),
                p.getOriginLng(),
                p.getDestinationAddress(),
                p.getDestinationLat(),
                p.getDestinationLng(),
                p.getTransportMode() != null ? p.getTransportMode().name() : null,
                p.getDeliveryDelay() != null ? p.getDeliveryDelay().name() : null,
                p.getMaterial() != null ? p.getMaterial().name() : null,
                p.getWeightKg(),
                p.getHeightCm(),
                p.getWidthCm(),
                p.getLengthCm(),
                p.getEstimatedCost(),
                p.getEstimatedDurationMinutes() != null ? p.getEstimatedDurationMinutes() + " min" : null,
                p.getRefusalReason(),
                p.getShippingDate() != null ? p.getShippingDate().toString() : null,
                p.getCreatedAt(),
                p.getValidatedAt(),
                p.getUpdatedAt(),
                p.getOwner() != null ? p.getOwner().getFullName() : null,
                p.getOwner() != null ? p.getOwner().getEmail() : null,
                p.getPhotoUrl(),
                p.getWaypoints() != null ? p.getWaypoints().stream().map(WaypointView::of).toList() : null,
                p.getEvents() != null ? p.getEvents().stream().map(TrackingEventView::of).toList() : null
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

/** Vue d'un événement de suivi. */
record TrackingEventView(
        UUID id,
        String eventType,
        String description,
        Instant createdAt
) {
    static TrackingEventView of(TrackingEvent e) {
        return new TrackingEventView(
                e.getId(),
                e.getEventType() != null ? e.getEventType().name() : null,
                e.getDescription(),
                e.getCreatedAt()
        );
    }
}
