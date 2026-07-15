package com.novahexa.tracking.service;

import com.novahexa.tracking.domain.*;
import com.novahexa.tracking.repository.ParcelRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

/**
 * Cahier §7.2 : Simulation serveur du déplacement d'un colis.
 * Calcule la position interpolée, détecte le passage aux waypoints
 * et la livraison automatique.
 */
@Service
public class SimulationService {

    private static final Logger log = LoggerFactory.getLogger(SimulationService.class);

    /** Average speed in km/h per transport mode. */
    private static final double SPEED_ROUTE = 80;
    private static final double SPEED_AIR = 800;
    private static final double SPEED_SEA = 30;

    private final ParcelRepository parcels;
    private final NotificationService notificationService;

    public SimulationService(ParcelRepository parcels, NotificationService notificationService) {
        this.parcels = parcels;
        this.notificationService = notificationService;
    }

    /**
     * Calculate estimated duration in minutes based on distance and transport mode.
     * Cahier §6.4 : estimation automatique de la durée estimée.
     */
    public int estimateDurationMinutes(double distanceKm, TransportMode mode) {
        double speedKmh = switch (mode) {
            case ROUTE -> SPEED_ROUTE;
            case AIR -> SPEED_AIR;
            case MER -> SPEED_SEA;
        };
        if (speedKmh <= 0) speedKmh = SPEED_ROUTE;
        double hours = distanceKm / speedKmh;
        // Add 10% buffer for stops, loading, customs
        return (int) Math.ceil(hours * 60 * 1.1);
    }

    /**
     * Get speed in km/h for a transport mode.
     */
    public double getSpeedKmh(TransportMode mode) {
        return switch (mode) {
            case ROUTE -> SPEED_ROUTE;
            case AIR -> SPEED_AIR;
            case MER -> SPEED_SEA;
        };
    }

    /**
     * Process all IN_TRANSIT parcels: simulate position, check waypoints, deliver.
     * Called by the scheduled job every minute.
     */
    @Transactional
    public void tick() {
        List<Parcel> inTransit = parcels.findByStatusOrderByCreatedAtDesc(ParcelStatus.IN_TRANSIT);
        log.info("[SimulationJob] Processing {} IN_TRANSIT parcels", inTransit.size());

        for (Parcel parcel : inTransit) {
            try {
                processParcel(parcel);
            } catch (Exception e) {
                log.error("[SimulationJob] Error processing parcel {}: {}", parcel.getTrackingNumber(), e.getMessage());
            }
        }
    }

    /**
     * Process a single IN_TRANSIT parcel: check if waypoints have been reached
     * or if the destination has been reached.
     */
    private void processParcel(Parcel parcel) {
        Instant now = Instant.now();
        Instant departureTime = parcel.getValidatedAt() != null ? parcel.getValidatedAt() : parcel.getCreatedAt();

        long elapsedMs = now.toEpochMilli() - departureTime.toEpochMilli();
        if (elapsedMs < 0) elapsedMs = 0;

        double totalDurationMs = parcel.getEstimatedDurationMinutes() != null
                ? parcel.getEstimatedDurationMinutes() * 60_000.0
                : calculateDurationFromDistance(parcel);

        // Add total stop durations from all waypoints to total duration
        long totalStopMs = 0;
        for (Waypoint wp : parcel.getWaypoints()) {
            if (wp.getStopDurationMinutes() != null && wp.getStopDurationMinutes() > 0) {
                totalStopMs += wp.getStopDurationMinutes() * 60_000L;
            }
        }
        totalDurationMs += totalStopMs;

        if (totalDurationMs <= 0) return;

        double progressRatio = Math.min(1.0, (double) elapsedMs / totalDurationMs);

        // Check if destination reached
        if (progressRatio >= 1.0) {
            deliverParcel(parcel);
            return;
        }

        // Check waypoints
        checkWaypoints(parcel, progressRatio);
    }

    /**
     * Check if any waypoints have been reached based on progress ratio.
     * Waypoints are distributed proportionally along the route.
     */
    private void checkWaypoints(Parcel parcel, double progressRatio) {
        List<Waypoint> sortedWaypoints = parcel.getWaypoints().stream()
                .sorted(Comparator.comparing(Waypoint::getOrderIndex))
                .toList();

        if (sortedWaypoints.isEmpty()) return;

        int totalSegments = sortedWaypoints.size() + 1; // origin → wp1 → wp2 → ... → destination
        for (int i = 0; i < sortedWaypoints.size(); i++) {
            Waypoint wp = sortedWaypoints.get(i);
            if (wp.getReachedAt() != null) continue; // Already reached

            // Each waypoint is at position (i+1) / totalSegments along the route
            double waypointThreshold = (double) (i + 1) / totalSegments;
            if (progressRatio >= waypointThreshold) {
                reachWaypoint(parcel, wp);
            }
        }
    }

    /**
     * Mark a waypoint as reached and send notification.
     */
    private void reachWaypoint(Parcel parcel, Waypoint wp) {
        wp.setReachedAt(Instant.now());
        parcel.getEvents().add(new TrackingEvent(parcel, EventType.WAYPOINT_REACHED,
                "Colis passé par " + wp.getLabel()));
        parcels.save(parcel);
        log.info("[SimulationJob] Waypoint '{}' reached for parcel {}", wp.getLabel(), parcel.getTrackingNumber());
        notificationService.onWaypointReached(parcel, wp.getLabel());
    }

    /**
     * Mark a parcel as delivered and send notification.
     */
    private void deliverParcel(Parcel parcel) {
        parcel.setStatus(ParcelStatus.DELIVERED);
        parcel.getEvents().add(new TrackingEvent(parcel, EventType.DELIVERED,
                "Colis livré à destination"));
        parcels.save(parcel);
        log.info("[SimulationJob] Parcel {} delivered", parcel.getTrackingNumber());
        notificationService.onDelivery(parcel);
    }

    /**
     * Calculate duration from distance when estimatedDurationMinutes is not set.
     */
    private double calculateDurationFromDistance(Parcel parcel) {
        double distanceKm = calculateDistance(parcel);
        TransportMode mode = parcel.getTransportMode() != null ? parcel.getTransportMode() : TransportMode.ROUTE;
        if (distanceKm <= 0) {
            // Fallback: use default 7 days when coordinates are missing
            return 7 * 24 * 60 * 60_000.0;
        }
        return estimateDurationMinutes(distanceKm, mode) * 60_000.0;
    }

    /**
     * Calculate total route distance in km using Haversine formula.
     */
    public double calculateDistance(Parcel parcel) {
        if (parcel.getOriginLat() == null || parcel.getOriginLng() == null ||
            parcel.getDestinationLat() == null || parcel.getDestinationLng() == null) {
            return 0;
        }

        double totalDist = haversine(parcel.getOriginLat(), parcel.getOriginLng(),
                parcel.getDestinationLat(), parcel.getDestinationLng());

        // If there are waypoints, sum segment distances
        List<Waypoint> sortedWaypoints = parcel.getWaypoints().stream()
                .sorted(Comparator.comparing(Waypoint::getOrderIndex))
                .toList();

        if (!sortedWaypoints.isEmpty()) {
            totalDist = 0;
            double prevLat = parcel.getOriginLat();
            double prevLng = parcel.getOriginLng();

            for (Waypoint wp : sortedWaypoints) {
                if (wp.getLat() != null && wp.getLng() != null) {
                    totalDist += haversine(prevLat, prevLng, wp.getLat(), wp.getLng());
                    prevLat = wp.getLat();
                    prevLng = wp.getLng();
                }
            }
            // Last segment: last waypoint → destination
            totalDist += haversine(prevLat, prevLng,
                    parcel.getDestinationLat(), parcel.getDestinationLng());
        }

        return totalDist;
    }

    /**
     * Haversine distance between two lat/lng points in km.
     */
    public double haversine(double lat1, double lng1, double lat2, double lng2) {
        final double R = 6371; // Earth radius in km
        double toRad = Math.PI / 180;
        double dLat = (lat2 - lat1) * toRad;
        double dLng = (lng2 - lng1) * toRad;
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
                   Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /**
     * Simulate the current position of a parcel (used by API for real-time display).
     * Returns {lat, lng} or null if no valid route.
     */
    public double[] simulatePosition(Parcel parcel) {
        if (parcel.getOriginLat() == null || parcel.getOriginLng() == null) return null;
        if (parcel.getDestinationLat() == null || parcel.getDestinationLng() == null) return null;

        // Utiliser transitStartedAt (pas validatedAt) comme point de départ de la simulation
        Instant departureTime = parcel.getTransitStartedAt() != null ? parcel.getTransitStartedAt()
                : parcel.getValidatedAt() != null ? parcel.getValidatedAt() : parcel.getCreatedAt();
        long elapsedMs = Math.max(0, Instant.now().toEpochMilli() - departureTime.toEpochMilli());

        double totalDurationMs = parcel.getEstimatedDurationMinutes() != null
                ? parcel.getEstimatedDurationMinutes() * 60_000.0
                : calculateDurationFromDistance(parcel);

        // Add total stop durations
        long totalStopMs = 0;
        for (Waypoint wp : parcel.getWaypoints()) {
            if (wp.getStopDurationMinutes() != null && wp.getStopDurationMinutes() > 0) {
                totalStopMs += wp.getStopDurationMinutes() * 60_000L;
            }
        }
        totalDurationMs += totalStopMs;

        if (totalDurationMs <= 0) return new double[]{parcel.getOriginLat(), parcel.getOriginLng()};

        double ratio = Math.min(1.0, (double) elapsedMs / totalDurationMs);
        if (parcel.getStatus() == ParcelStatus.DELIVERED) ratio = 1;
        if (parcel.getStatus() == ParcelStatus.PENDING || parcel.getStatus() == ParcelStatus.REFUSED) ratio = 0;
        if (parcel.getStatus() == ParcelStatus.VALIDATED) ratio = 0; // Validé mais pas encore en transit — reste à l'origine
        if (parcel.getStatus() == ParcelStatus.PAUSED) {
            // Calculate ratio at pause time and freeze it
            Instant pauseTime = parcel.getUpdatedAt() != null ? parcel.getUpdatedAt() : parcel.getCreatedAt();
            long pauseElapsedMs = Math.max(0, pauseTime.toEpochMilli() - departureTime.toEpochMilli());
            ratio = Math.min(1.0, (double) pauseElapsedMs / totalDurationMs);
        }

        return interpolateRoute(parcel, ratio);
    }

    /**
     * Interpolate position along the full route (origin → waypoints → destination).
     */
    private double[] interpolateRoute(Parcel parcel, double ratio) {
        // Build route points: origin → waypoints → destination
        record Point(double lat, double lng) {}
        java.util.List<Point> points = new java.util.ArrayList<>();
        points.add(new Point(parcel.getOriginLat(), parcel.getOriginLng()));

        parcel.getWaypoints().stream()
                .sorted(Comparator.comparing(Waypoint::getOrderIndex))
                .filter(wp -> wp.getLat() != null && wp.getLng() != null)
                .forEach(wp -> points.add(new Point(wp.getLat(), wp.getLng())));

        points.add(new Point(parcel.getDestinationLat(), parcel.getDestinationLng()));

        if (points.size() < 2) return new double[]{parcel.getOriginLat(), parcel.getOriginLng()};

        // Calculate segment distances
        double[] segDists = new double[points.size() - 1];
        double totalDist = 0;
        for (int i = 0; i < segDists.length; i++) {
            segDists[i] = haversine(points.get(i).lat, points.get(i).lng,
                    points.get(i + 1).lat, points.get(i + 1).lng);
            totalDist += segDists[i];
        }

        if (totalDist == 0) return new double[]{points.get(0).lat, points.get(0).lng};

        double targetDist = ratio * totalDist;
        double accumulated = 0;

        for (int i = 0; i < segDists.length; i++) {
            if (accumulated + segDists[i] >= targetDist) {
                double segRatio = segDists[i] > 0 ? (targetDist - accumulated) / segDists[i] : 0;
                double lat = points.get(i).lat + (points.get(i + 1).lat - points.get(i).lat) * segRatio;
                double lng = points.get(i).lng + (points.get(i + 1).lng - points.get(i).lng) * segRatio;
                return new double[]{lat, lng};
            }
            accumulated += segDists[i];
        }

        Point last = points.get(points.size() - 1);
        return new double[]{last.lat, last.lng};
    }
}
