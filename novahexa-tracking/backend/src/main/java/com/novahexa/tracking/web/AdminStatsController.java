package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.Parcel;
import com.novahexa.tracking.domain.ParcelStatus;
import com.novahexa.tracking.repository.ParcelRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminStatsController {

    private final ParcelRepository parcels;

    public AdminStatsController(ParcelRepository parcels) {
        this.parcels = parcels;
    }

    /**
     * Statistiques rapides pour le dashboard admin (DashboardStats type côté frontend).
     * GET /api/admin/stats
     */
    @GetMapping("/stats")
    public Map<String, Object> stats() {
        List<Parcel> all = parcels.findAllByOrderByCreatedAtDesc();
        long total = all.size();
        long pending = all.stream().filter(p -> p.getStatus() == ParcelStatus.PENDING).count();
        long validated = all.stream().filter(p -> p.getStatus() == ParcelStatus.VALIDATED).count();
        long inTransit = all.stream().filter(p -> p.getStatus() == ParcelStatus.IN_TRANSIT).count();
        long delivered = all.stream().filter(p -> p.getStatus() == ParcelStatus.DELIVERED).count();
        long refused = all.stream().filter(p -> p.getStatus() == ParcelStatus.REFUSED).count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", total);
        stats.put("pending", pending);
        stats.put("validated", validated);
        stats.put("inTransit", inTransit);
        stats.put("delivered", delivered);
        stats.put("refused", refused);
        return stats;
    }
}
