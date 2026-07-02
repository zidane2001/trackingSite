package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.DeliveryDelay;
import com.novahexa.tracking.domain.MaterialType;
import com.novahexa.tracking.domain.TransportMode;
import com.novahexa.tracking.service.PricingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * Endpoint public pour le calcul de devis en temps réel.
 */
@RestController
@RequestMapping("/api/pricing")
@CrossOrigin
public class PricingController {

    private final PricingService pricing;

    public PricingController(PricingService pricing) {
        this.pricing = pricing;
    }

    public record EstimateRequest(
            @NotNull TransportMode mode,
            @NotNull DeliveryDelay delay,
            @NotNull MaterialType material,
            BigDecimal weightKg,
            Integer heightCm,
            Integer widthCm,
            Integer lengthCm
    ) {}

    public record EstimateResponse(
            BigDecimal estimatedCost,
            BigDecimal billableWeight,
            TransportMode mode,
            DeliveryDelay delay,
            MaterialType material
    ) {}

    @PostMapping("/estimate")
    public EstimateResponse estimate(@Valid @RequestBody EstimateRequest req) {
        BigDecimal cost = pricing.estimateCost(
                req.mode(), req.delay(), req.material(),
                req.weightKg(), req.heightCm(), req.widthCm(), req.lengthCm());
        BigDecimal billable = pricing.billableWeight(
                req.weightKg(), req.heightCm(), req.widthCm(), req.lengthCm());
        return new EstimateResponse(cost, billable, req.mode(), req.delay(), req.material());
    }
}
