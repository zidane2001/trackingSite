package com.novahexa.tracking.service;

import com.novahexa.tracking.domain.DeliveryDelay;
import com.novahexa.tracking.domain.MaterialType;
import com.novahexa.tracking.domain.TransportMode;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Moteur de tarification backend (cahier des charges §3.1).
 * Formule identique à pricing.ts côté frontend.
 * Le backend recalcule toujours le coût pour éviter la falsification côté client.
 */
@Service
public class PricingService {

    // --- Base rate per transport mode (EUR) ---
    private static final Map<TransportMode, BigDecimal> MODE_BASE = Map.of(
            TransportMode.ROUTE, BigDecimal.valueOf(10),
            TransportMode.MER, BigDecimal.valueOf(25),
            TransportMode.AIR, BigDecimal.valueOf(40)
    );

    // --- Rate per billable kg (EUR/kg) ---
    private static final Map<TransportMode, BigDecimal> MODE_RATE_PER_KG = Map.of(
            TransportMode.ROUTE, BigDecimal.valueOf(1.2),
            TransportMode.MER, BigDecimal.valueOf(0.9),
            TransportMode.AIR, BigDecimal.valueOf(3.5)
    );

    // --- Delay multipliers ---
    private static final Map<DeliveryDelay, BigDecimal> DELAY_MULT = Map.of(
            DeliveryDelay.STANDARD, BigDecimal.ONE,
            DeliveryDelay.EXPRESS, BigDecimal.valueOf(1.5),
            DeliveryDelay.JOUR_MEME, BigDecimal.valueOf(2.2)
    );

    // --- Material surcharges (EUR) ---
    private static final Map<MaterialType, BigDecimal> MATERIAL_SURCHARGE = Map.of(
            MaterialType.GENERAL, BigDecimal.ZERO,
            MaterialType.DOCUMENTS, BigDecimal.ZERO,
            MaterialType.AUTO_PARTS, BigDecimal.valueOf(8),
            MaterialType.FRAGILE, BigDecimal.valueOf(12),
            MaterialType.ELECTRONIQUE, BigDecimal.valueOf(15)
    );

    // Volumetric divisor (air freight standard = 5000)
    private static final int VOLUMETRIC_DIVISOR = 5000;

    /**
     * Calculate billable weight: max(actual weight, volumetric weight).
     */
    public BigDecimal billableWeight(BigDecimal weightKg, Integer heightCm, Integer widthCm, Integer lengthCm) {
        double h = heightCm != null ? heightCm : 0;
        double w = widthCm != null ? widthCm : 0;
        double l = lengthCm != null ? lengthCm : 0;
        double actual = weightKg != null ? weightKg.doubleValue() : 0;
        double volumetric = (h * w * l) / VOLUMETRIC_DIVISOR;
        return BigDecimal.valueOf(Math.max(actual, volumetric));
    }

    /**
     * Calculate estimated cost in EUR, rounded to 2 decimal places.
     *
     * Formula: (baseRate + billableWeight × ratePerKg + materialSurcharge) × delayMultiplier
     */
    public BigDecimal estimateCost(TransportMode mode, DeliveryDelay delay, MaterialType material,
                                   BigDecimal weightKg, Integer heightCm, Integer widthCm, Integer lengthCm) {
        BigDecimal billable = billableWeight(weightKg, heightCm, widthCm, lengthCm);

        BigDecimal base = MODE_BASE.getOrDefault(mode, BigDecimal.TEN);
        BigDecimal rate = MODE_RATE_PER_KG.getOrDefault(mode, BigDecimal.ONE);
        BigDecimal surcharge = MATERIAL_SURCHARGE.getOrDefault(material, BigDecimal.ZERO);
        BigDecimal delayMult = DELAY_MULT.getOrDefault(delay, BigDecimal.ONE);

        BigDecimal variable = billable.multiply(rate);
        BigDecimal subtotal = base.add(variable).add(surcharge).multiply(delayMult);

        return subtotal.setScale(2, RoundingMode.HALF_UP);
    }
}
