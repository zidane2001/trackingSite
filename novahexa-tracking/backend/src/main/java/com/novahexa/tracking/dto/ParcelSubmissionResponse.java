package com.novahexa.tracking.dto;

import com.novahexa.tracking.domain.ParcelStatus;
import java.math.BigDecimal;

public record ParcelSubmissionResponse(
        String trackingNumber,
        ParcelStatus status,
        BigDecimal estimatedCost
) {}
