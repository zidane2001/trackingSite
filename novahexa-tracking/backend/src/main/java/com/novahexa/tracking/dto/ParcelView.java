package com.novahexa.tracking.dto;

import com.novahexa.tracking.domain.Message;
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
        String customDeliveryDelay,
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
        Instant transitStartedAt,
        Integer demoDurationMinutes,
        Instant updatedAt,
        String ownerName,
        String ownerEmail,
        String ownerId,
        List<String> imageUrls,
        List<WaypointView> waypoints,
        List<TrackingEventView> trackingEvents,
        List<MessageView> messages
) {
    /** Vue complète (détail) — nécessite les collections chargées (EntityGraph). */
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
                p.getCustomDeliveryDelay(),
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
                p.getTransitStartedAt(),
                p.getDemoDurationMinutes(),
                p.getUpdatedAt(),
                p.getOwner() != null ? p.getOwner().getFullName() : null,
                p.getOwner() != null ? p.getOwner().getEmail() : null,
                p.getOwner() != null ? p.getOwner().getId().toString() : null,
                parseImageUrls(p.getImageUrls()),
                p.getWaypoints() != null ? p.getWaypoints().stream().map(WaypointView::of).toList() : null,
                p.getEvents() != null ? p.getEvents().stream().map(TrackingEventView::of).toList() : null,
                null
        );
    }

    /** Vue légère (liste) — n'accède PAS aux collections LAZY (waypoints, events). */
    public static ParcelView ofList(Parcel p) {
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
                p.getCustomDeliveryDelay(),
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
                p.getTransitStartedAt(),
                p.getDemoDurationMinutes(),
                p.getUpdatedAt(),
                p.getOwner() != null ? p.getOwner().getFullName() : null,
                p.getOwner() != null ? p.getOwner().getEmail() : null,
                p.getOwner() != null ? p.getOwner().getId().toString() : null,
                parseImageUrls(p.getImageUrls()),
                null, // waypoints — pas chargés en LAZY
                null, // events — pas chargés en LAZY
                null
        );
    }

    private static List<String> parseImageUrls(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return List.of(csv.split(","));
    }

    public static ParcelView of(Parcel p, List<Message> msgs) {
        ParcelView view = of(p);
        if (msgs == null) msgs = List.of();
        return new ParcelView(
                view.id, view.trackingNumber, view.name, view.description, view.status,
                view.senderName, view.senderEmail, view.senderPhone,
                view.originAddress, view.originLat, view.originLng,
                view.destinationAddress, view.destinationLat, view.destinationLng,
                view.transportMode, view.deliveryDelay, view.customDeliveryDelay, view.material,
                view.weightKg, view.heightCm, view.widthCm, view.lengthCm,
                view.estimatedCost, view.estimatedDuration, view.refusalReason,
                view.shippingDate, view.createdAt, view.validatedAt,
                view.transitStartedAt, view.demoDurationMinutes,
                view.updatedAt,                view.ownerName, view.ownerEmail, view.ownerId, view.imageUrls,
                view.waypoints, view.trackingEvents,
                msgs.stream().map(MessageView::of).toList()
        );
    }

    /** Vue d'un waypoint pour l'affichage sur la carte. */
    public static record WaypointView(
            UUID id,
            String label,
            Integer orderIndex,
            Double lat,
            Double lng,
            Instant estimatedArrival,
            Instant reachedAt,
            Integer stopDurationMinutes
    ) {
        public static WaypointView of(com.novahexa.tracking.domain.Waypoint w) {
            return new WaypointView(
                    w.getId(),
                    w.getLabel(),
                    w.getOrderIndex(),
                    w.getLat(),
                    w.getLng(),
                    w.getEstimatedArrival(),
                    w.getReachedAt(),
                    w.getStopDurationMinutes()
            );
        }
    }

    /** Vue d'un message admin ↔ client. */
    public static record MessageView(
            UUID id,
            String senderName,
            String subject,
            String body,
            Instant sentAt
    ) {
        public static MessageView of(Message m) {
            return new MessageView(
                    m.getId(),
                    m.getSender() != null ? m.getSender().getFullName() : null,
                    m.getSubject(),
                    m.getBody(),
                    m.getSentAt()
            );
        }
    }

    /** Vue d'un événement de suivi. */
    public static record TrackingEventView(
            UUID id,
            String eventType,
            String description,
            Instant createdAt
    ) {
        public static TrackingEventView of(TrackingEvent e) {
            return new TrackingEventView(
                    e.getId(),
                    e.getEventType() != null ? e.getEventType().name() : null,
                    e.getDescription(),
                    e.getCreatedAt()
            );
        }
    }
}
