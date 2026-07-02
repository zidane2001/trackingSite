package com.novahexa.tracking.web;

import com.novahexa.tracking.service.AnalyticsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * Retourne les données analytics complètes pour le dashboard admin.
     * Inclut : overview, statusDistribution, monthlyShipments, revenue,
     * transportDistribution, deliveryPerformance, topRoutes, materialDistribution.
     */
    @GetMapping
    public Map<String, Object> getAnalytics() {
        return analyticsService.getFullAnalytics();
    }
}
