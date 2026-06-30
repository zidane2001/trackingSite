package com.novahexa.tracking.dto;

import com.novahexa.tracking.domain.Parcel;
import java.math.BigDecimal;
import java.time.Instant;

/** Vue lecture d'un colis (suivi public + liste admin). */
public record ParcelView(
        String trackingNumber,
        String name,
        String status,
        String senderName,
        String originAddress,
        String destinationAddress,
        String transportMode,
        String material,
        BigDecimal weightKg,
        BigDecimal estimatedCost,
        String refusalReason,
        Instant createdAt,
        Instant validatedAt
) {
    public static ParcelView of(Parcel p) {
        return new ParcelView(
                p.getTrackingNumber(),
                p.getName(),
                p.getStatus().name(),
                p.getSenderName(),
                p.getOriginAddress(),
                p.getDestinationAddress(),
                p.getTransportMode() != null ? p.getTransportMode().name() : null,
                p.getMaterial() != null ? p.getMaterial().name() : null,
                p.getWeightKg(),
                p.getEstimatedCost(),
                p.getRefusalReason(),
                p.getCreatedAt(),
                p.getValidatedAt()
        );
    }
}
