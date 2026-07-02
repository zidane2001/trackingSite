package com.novahexa.tracking.service;

import com.novahexa.tracking.domain.*;
import com.novahexa.tracking.repository.ParcelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service d'analytics pour le tableau de bord admin.
 * Agrège les données de performance, revenus, et livraisons.
 */
@Service
public class AnalyticsService {

    private final ParcelRepository parcels;

    public AnalyticsService(ParcelRepository parcels) {
        this.parcels = parcels;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFullAnalytics() {
        List<Parcel> all = parcels.findAllByOrderByCreatedAtDesc();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("overview", buildOverview(all));
        result.put("statusDistribution", buildStatusDistribution(all));
        result.put("monthlyShipments", buildMonthlyShipments(all));
        result.put("revenue", buildRevenue(all));
        result.put("transportDistribution", buildTransportDistribution(all));
        result.put("deliveryPerformance", buildDeliveryPerformance(all));
        result.put("topRoutes", buildTopRoutes(all));
        result.put("materialDistribution", buildMaterialDistribution(all));
        return result;
    }

    private Map<String, Object> buildOverview(List<Parcel> all) {
        long total = all.size();
        long delivered = all.stream().filter(p -> p.getStatus() == ParcelStatus.DELIVERED).count();
        long inTransit = all.stream().filter(p -> p.getStatus() == ParcelStatus.IN_TRANSIT).count();
        long pending = all.stream().filter(p -> p.getStatus() == ParcelStatus.PENDING).count();
        long refused = all.stream().filter(p -> p.getStatus() == ParcelStatus.REFUSED).count();

        BigDecimal totalRevenue = all.stream()
                .filter(p -> p.getStatus() == ParcelStatus.DELIVERED || p.getStatus() == ParcelStatus.IN_TRANSIT)
                .map(p -> p.getEstimatedCost() != null ? p.getEstimatedCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Monthly revenue (current month)
        LocalDate now = LocalDate.now();
        BigDecimal currentMonthRevenue = all.stream()
                .filter(p -> {
                    Instant created = p.getCreatedAt();
                    if (created == null) return false;
                    LocalDate d = created.atZone(ZoneId.systemDefault()).toLocalDate();
                    return d.getYear() == now.getYear() && d.getMonthValue() == now.getMonthValue();
                })
                .filter(p -> p.getEstimatedCost() != null)
                .map(Parcel::getEstimatedCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("totalParcels", total);
        overview.put("delivered", delivered);
        overview.put("inTransit", inTransit);
        overview.put("pending", pending);
        overview.put("refused", refused);
        overview.put("totalRevenue", totalRevenue);
        overview.put("currentMonthRevenue", currentMonthRevenue);
        overview.put("deliveryRate", total > 0 ? Math.round(delivered * 100.0 / total) : 0);
        overview.put("activeShipments", inTransit);
        return overview;
    }

    private List<Map<String, Object>> buildStatusDistribution(List<Parcel> all) {
        Map<ParcelStatus, Long> counts = all.stream()
                .collect(Collectors.groupingBy(Parcel::getStatus, Collectors.counting()));
        return Arrays.stream(ParcelStatus.values())
                .map(s -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("status", s.name());
                    entry.put("label", formatStatus(s.name()));
                    entry.put("count", counts.getOrDefault(s, 0L));
                    return entry;
                })
                .toList();
    }

    private List<Map<String, Object>> buildMonthlyShipments(List<Parcel> all) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy", Locale.FRENCH);
        Map<String, Long> monthly = all.stream()
                .filter(p -> p.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate().withDayOfMonth(1).format(fmt),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        return monthly.entrySet().stream()
                .map(e -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("month", e.getKey());
                    entry.put("count", e.getValue());
                    return entry;
                })
                .sorted(Comparator.comparing(e -> (String) e.get("month")))
                .toList();
    }

    private Map<String, Object> buildRevenue(List<Parcel> all) {
        BigDecimal total = all.stream()
                .filter(p -> p.getEstimatedCost() != null)
                .map(Parcel::getEstimatedCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avg = total;
        long paidCount = all.stream()
                .filter(p -> p.getEstimatedCost() != null)
                .count();
        if (paidCount > 0) {
            avg = total.divide(BigDecimal.valueOf(paidCount), 2, java.math.RoundingMode.HALF_UP);
        }

        Map<String, Object> revenue = new LinkedHashMap<>();
        revenue.put("total", total);
        revenue.put("average", avg);
        revenue.put("count", paidCount);
        return revenue;
    }

    private List<Map<String, Object>> buildTransportDistribution(List<Parcel> all) {
        Map<String, Long> counts = all.stream()
                .filter(p -> p.getTransportMode() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getTransportMode().name(),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        return counts.entrySet().stream()
                .map(e -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("mode", formatEnum(e.getKey()));
                    entry.put("count", e.getValue());
                    return entry;
                })
                .toList();
    }

    private Map<String, Object> buildDeliveryPerformance(List<Parcel> all) {
        long delivered = all.stream()
                .filter(p -> p.getStatus() == ParcelStatus.DELIVERED && p.getValidatedAt() != null)
                .count();

        // Average delivery time estimate
        Map<String, Object> perf = new LinkedHashMap<>();
        perf.put("totalDelivered", delivered);
        perf.put("deliveryRate", all.size() > 0 ? Math.round(delivered * 100.0 / all.size()) : 0);
        return perf;
    }

    private List<Map<String, Object>> buildTopRoutes(List<Parcel> all) {
        Map<String, Long> routes = all.stream()
                .filter(p -> p.getOriginAddress() != null && p.getDestinationAddress() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getOriginAddress() + " → " + p.getDestinationAddress(),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        return routes.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("route", e.getKey());
                    entry.put("count", e.getValue());
                    return entry;
                })
                .toList();
    }

    private List<Map<String, Object>> buildMaterialDistribution(List<Parcel> all) {
        Map<String, Long> counts = all.stream()
                .filter(p -> p.getMaterial() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getMaterial().name(),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        return counts.entrySet().stream()
                .map(e -> {
                    Map<String, Object> entry = new LinkedHashMap<>();
                    entry.put("material", formatEnum(e.getKey()));
                    entry.put("count", e.getValue());
                    return entry;
                })
                .toList();
    }

    private String formatStatus(String s) {
        return switch (s) {
            case "PENDING" -> "En attente";
            case "VALIDATED" -> "Validé";
            case "REFUSED" -> "Refusé";
            case "IN_TRANSIT" -> "En transit";
            case "DELIVERED" -> "Livré";
            default -> s;
        };
    }

    private String formatEnum(String name) {
        return switch (name) {
            case "ROUTIER" -> "Routier";
            case "AERIEN" -> "Aérien";
            case "MARITIME" -> "Maritime";
            case "GENERAL" -> "Général";
            case "AUTO_PARTS" -> "Pièces auto";
            case "FRAGILE" -> "Fragile";
            case "FOOD" -> "Alimentaire";
            case "DOCUMENTS" -> "Documents";
            default -> name;
        };
    }
}
