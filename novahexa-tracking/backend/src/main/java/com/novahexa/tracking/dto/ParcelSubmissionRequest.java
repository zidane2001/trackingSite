package com.novahexa.tracking.dto;

import com.novahexa.tracking.domain.DeliveryDelay;
import com.novahexa.tracking.domain.MaterialType;
import com.novahexa.tracking.domain.TransportMode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** Charge utile envoyée par le formulaire du hero (front). */
public record ParcelSubmissionRequest(
        @NotBlank String senderName,
        @NotBlank @Email String senderEmail,
        String senderPhone,
        @NotBlank String name,
        String description,
        @NotNull MaterialType material,
        BigDecimal weightKg,
        Dimensions dimensions,
        @NotBlank String originAddress,
        @NotBlank String destinationAddress,
        @NotNull TransportMode mode,
        @NotNull DeliveryDelay delay,
        LocalDate shippingDate,
        BigDecimal estimatedCost,
        List<String> imageUrls
) {}
