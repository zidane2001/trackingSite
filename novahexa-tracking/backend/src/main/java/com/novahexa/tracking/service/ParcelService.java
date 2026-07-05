package com.novahexa.tracking.service;

import com.novahexa.tracking.domain.*;
import com.novahexa.tracking.dto.ParcelSubmissionRequest;
import com.novahexa.tracking.dto.ParcelSubmissionResponse;
import com.novahexa.tracking.repository.ParcelRepository;
import com.novahexa.tracking.repository.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ParcelService {

    private final ParcelRepository parcels;
    private final TrackingNumberService trackingNumbers;
    private final NotificationService notificationService;
    private final PricingService pricingService;
    private final GeocodingService geocodingService;
    private final SimulationService simulationService;
    private final AppUserRepository userRepository;

    public ParcelService(ParcelRepository parcels, TrackingNumberService trackingNumbers,
                         NotificationService notificationService, PricingService pricingService,
                         GeocodingService geocodingService, SimulationService simulationService,
                         AppUserRepository userRepository) {
        this.parcels = parcels;
        this.trackingNumbers = trackingNumbers;
        this.notificationService = notificationService;
        this.pricingService = pricingService;
        this.geocodingService = geocodingService;
        this.simulationService = simulationService;
        this.userRepository = userRepository;
    }

    /** Cahier §5.2 : soumission client -> statut PENDING + n° de suivi auto. */
    @Transactional
    public ParcelSubmissionResponse submit(ParcelSubmissionRequest req, AppUser owner) {
        Parcel p = new Parcel();
        p.setTrackingNumber(trackingNumbers.generateUnique());
        p.setName(req.name());
        p.setDescription(req.description());
        p.setSenderName(req.senderName());
        p.setSenderEmail(req.senderEmail());
        p.setSenderPhone(req.senderPhone());
        p.setMaterial(req.material());
        p.setWeightKg(req.weightKg());
        if (req.dimensions() != null) {
            p.setHeightCm(req.dimensions().heightCm());
            p.setWidthCm(req.dimensions().widthCm());
            p.setLengthCm(req.dimensions().lengthCm());
        }
        p.setOriginAddress(req.originAddress());
        p.setDestinationAddress(req.destinationAddress());
        p.setTransportMode(req.mode());
        p.setDeliveryDelay(req.delay());
        p.setShippingDate(req.shippingDate());
        p.setEstimatedCost(pricingService.estimateCost(
                req.mode(), req.delay(), req.material(),
                req.weightKg(),
                req.dimensions() != null ? req.dimensions().heightCm() : null,
                req.dimensions() != null ? req.dimensions().widthCm() : null,
                req.dimensions() != null ? req.dimensions().lengthCm() : null));
        if (req.imageUrls() != null && !req.imageUrls().isEmpty()) {
            p.setImageUrls(String.join(",", req.imageUrls()));
        }
        p.setStatus(ParcelStatus.PENDING);
        // Lier l'owner si l'utilisateur est connecté
        if (owner != null) p.setOwner(owner);

        // Géocodage des adresses
        double[] originCoords = geocodingService.geocode(req.originAddress());
        if (originCoords != null) {
            p.setOriginLat(originCoords[0]);
            p.setOriginLng(originCoords[1]);
        }
        double[] destCoords = geocodingService.geocode(req.destinationAddress());
        if (destCoords != null) {
            p.setDestinationLat(destCoords[0]);
            p.setDestinationLng(destCoords[1]);
        }

        p.getEvents().add(new TrackingEvent(p, EventType.SUBMITTED,
                "Demande soumise par le client"));

        parcels.save(p);

        // Cahier §9 : notification de confirmation de soumission
        notificationService.onSubmission(p);

        return new ParcelSubmissionResponse(p.getTrackingNumber(), p.getStatus(), p.getEstimatedCost());
    }

    @Transactional(readOnly = true)
    public Parcel getByTrackingNumber(String trackingNumber) {
        return parcels.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Colis introuvable"));
    }

    @Transactional(readOnly = true)
    public Parcel getById(UUID id) {
        return parcels.findByIdWithCollections(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Colis introuvable"));
    }

    @Transactional(readOnly = true)
    public List<Parcel> listPending() {
        return parcels.findByStatusOrderByCreatedAtDesc(ParcelStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public List<Parcel> listAll() {
        return parcels.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Parcel> listByOwner(UUID ownerId) {
        return parcels.findByOwner_IdOrderByCreatedAtDesc(ownerId);
    }

    /** Cahier §6.2 : validation admin -> statut VALIDATED. Accepte prix, durée démo et images optionnels. */
    @Transactional
    public Parcel validate(String trackingNumber, AppUser admin, java.math.BigDecimal price, Integer demoDurationMinutes, List<String> imageUrls) {
        Parcel p = getByTrackingNumber(trackingNumber);
        if (p.getStatus() != ParcelStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le colis n'est pas en attente");
        }
        p.setStatus(ParcelStatus.VALIDATED);
        p.setValidatedAt(Instant.now());
        p.setValidatedBy(admin);
        if (price != null) p.setEstimatedCost(price);
        if (demoDurationMinutes != null) p.setDemoDurationMinutes(demoDurationMinutes);
        // Merge new images with existing ones
        if (imageUrls != null && !imageUrls.isEmpty()) {
            String existing = p.getImageUrls();
            java.util.List<String> allImages = new java.util.ArrayList<>();
            if (existing != null && !existing.isBlank()) {
                allImages.addAll(List.of(existing.split(",")));
            }
            allImages.addAll(imageUrls);
            p.setImageUrls(String.join(",", allImages));
        }
        p.getEvents().add(new TrackingEvent(p, EventType.VALIDATED, "Validée par l'administrateur"));
        Parcel saved = parcels.save(p);
        notificationService.onValidation(saved);
        return saved;
    }

    /** Compat sans prix/durée/images. */
    @Transactional
    public Parcel validate(String trackingNumber, AppUser admin) {
        return validate(trackingNumber, admin, null, null, null);
    }

    /** Cahier §6.2 : refus admin avec motif obligatoire. */
    @Transactional
    public Parcel refuse(String trackingNumber, String reason) {
        Parcel p = getByTrackingNumber(trackingNumber);
        if (p.getStatus() != ParcelStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le colis n'est pas en attente");
        }
        p.setStatus(ParcelStatus.REFUSED);
        p.setRefusalReason(reason);
        p.getEvents().add(new TrackingEvent(p, EventType.REFUSED,
                "Refusée par l'administrateur : " + reason));
        Parcel saved = parcels.save(p);

        // Cahier §9 : notification de refus avec motif
        notificationService.onRefusal(saved, reason);

        return saved;
    }

    /** Mettre le colis en transit — stocke transitStartedAt pour l'animation. */
    @Transactional
    public Parcel setInTransit(String trackingNumber, AppUser admin) {
        Parcel p = getByTrackingNumber(trackingNumber);
        if (p.getStatus() != ParcelStatus.VALIDATED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le colis n'est pas validé");
        }
        p.setStatus(ParcelStatus.IN_TRANSIT);
        p.setTransitStartedAt(Instant.now());
        p.getEvents().add(new TrackingEvent(p, EventType.IN_TRANSIT, "Colis en transit"));
        if (p.getEstimatedDurationMinutes() == null) {
            double distanceKm = simulationService.calculateDistance(p);
            TransportMode mode = p.getTransportMode() != null ? p.getTransportMode() : TransportMode.ROUTE;
            p.setEstimatedDurationMinutes(simulationService.estimateDurationMinutes(distanceKm, mode));
        }
        setWaypointEstimations(p);
        return parcels.save(p);
    }

    /** Set estimated arrival timestamps on waypoints based on duration, position, and stop times. */
    private void setWaypointEstimations(Parcel p) {
        if (p.getEstimatedDurationMinutes() == null || p.getValidatedAt() == null) return;
        int totalMinutes = p.getEstimatedDurationMinutes();
        int totalSegments = p.getWaypoints().size() + 1;
        Instant base = p.getValidatedAt();
        for (int i = 0; i < p.getWaypoints().size(); i++) {
            Waypoint wp = p.getWaypoints().get(i);
            double fraction = (double) (i + 1) / totalSegments;
            long travelSeconds = (long) (totalMinutes * 60 * fraction);
            // Add cumulative stop durations from previous waypoints
            long stopSeconds = 0;
            for (int j = 0; j < i; j++) {
                Waypoint prev = p.getWaypoints().get(j);
                if (prev.getStopDurationMinutes() != null && prev.getStopDurationMinutes() > 0) {
                    stopSeconds += prev.getStopDurationMinutes() * 60L;
                }
            }
            wp.setEstimatedArrival(base.plusSeconds(travelSeconds + stopSeconds));
        }
    }

    /** Marquer le colis comme livré. */
    @Transactional
    public Parcel setDelivered(String trackingNumber, AppUser admin) {
        Parcel p = getByTrackingNumber(trackingNumber);
        if (p.getStatus() != ParcelStatus.IN_TRANSIT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le colis n'est pas en transit");
        }
        p.setStatus(ParcelStatus.DELIVERED);
        p.getEvents().add(new TrackingEvent(p, EventType.DELIVERED,
                "Colis livré"));
        Parcel saved = parcels.save(p);

        // Cahier §9 : notification de livraison
        notificationService.onDelivery(saved);

        return saved;
    }

    /** Ajouter un waypoint à un colis. */
    @Transactional
    public Waypoint addWaypoint(String parcelId, String label, double lat, double lng, Integer stopDurationMinutes) {
        Parcel p = getById(UUID.fromString(parcelId));
        Waypoint wp = new Waypoint();
        wp.setParcel(p);
        wp.setLabel(label);
        wp.setLat(lat);
        wp.setLng(lng);
        wp.setOrderIndex(p.getWaypoints().size());
        if (stopDurationMinutes != null && stopDurationMinutes > 0) {
            wp.setStopDurationMinutes(stopDurationMinutes);
        }
        p.getWaypoints().add(wp);
        return parcels.save(p).getWaypoints().get(p.getWaypoints().size() - 1);
    }

    /** Supprimer un waypoint. */
    @Transactional
    public void deleteWaypoint(String parcelId, UUID waypointId) {
        Parcel p = getById(UUID.fromString(parcelId));
        p.getWaypoints().removeIf(wp -> wp.getId().equals(waypointId));
        parcels.save(p);
    }

    /** Cahier §6.2 : modifier les infos d'un colis PENDING avant validation. */
    @Transactional
    public Parcel updateBeforeValidation(UUID id, com.novahexa.tracking.web.AdminParcelController.UpdateParcelRequest body) {
        Parcel p = getById(id);
        if (p.getStatus() != ParcelStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "On ne peut modifier qu'un colis en attente");
        }
        if (body.name() != null) p.setName(body.name());
        if (body.description() != null) p.setDescription(body.description());
        if (body.originAddress() != null) p.setOriginAddress(body.originAddress());
        if (body.destinationAddress() != null) p.setDestinationAddress(body.destinationAddress());
        if (body.transportMode() != null) p.setTransportMode(body.transportMode());
        if (body.deliveryDelay() != null) p.setDeliveryDelay(body.deliveryDelay());
        if (body.material() != null) p.setMaterial(body.material());
        if (body.weightKg() != null) p.setWeightKg(body.weightKg());
        if (body.heightCm() != null) p.setHeightCm(body.heightCm());
        if (body.widthCm() != null) p.setWidthCm(body.widthCm());
        if (body.lengthCm() != null) p.setLengthCm(body.lengthCm());
        if (body.estimatedCost() != null) p.setEstimatedCost(body.estimatedCost());
        if (body.demoDurationMinutes() != null) p.setDemoDurationMinutes(body.demoDurationMinutes());
        return parcels.save(p);
    }

    /** Admin crée un colis directement pour un client avec coordonnées carte. */
    @Transactional
    public Parcel createForClient(AdminCreateRequest req, AppUser admin) {
        Parcel p = new Parcel();
        p.setTrackingNumber(trackingNumbers.generateUnique());
        p.setName(req.name());
        p.setDescription(req.description());
        p.setSenderName(req.senderName());
        p.setSenderEmail(req.senderEmail());
        p.setOriginAddress(req.originAddress());
        p.setOriginLat(req.originLat());
        p.setOriginLng(req.originLng());
        p.setDestinationAddress(req.destinationAddress());
        p.setDestinationLat(req.destinationLat());
        p.setDestinationLng(req.destinationLng());
        p.setTransportMode(req.transportMode());
        p.setMaterial(req.material());
        p.setWeightKg(req.weightKg());
        p.setEstimatedCost(req.estimatedCost());
        p.setDemoDurationMinutes(req.demoDurationMinutes());
        if (req.estimatedDurationMinutes() != null) p.setEstimatedDurationMinutes(req.estimatedDurationMinutes());
        p.setStatus(ParcelStatus.VALIDATED);
        p.setValidatedAt(Instant.now());
        p.setValidatedBy(admin);
        if (req.ownerId() != null) {
            userRepository.findById(req.ownerId()).ifPresent(p::setOwner);
        }
        if (req.imageUrls() != null && !req.imageUrls().isEmpty()) {
            p.setImageUrls(String.join(",", req.imageUrls()));
        }
        p.getEvents().add(new TrackingEvent(p, EventType.VALIDATED, "Créé et validé par l'administrateur"));
        Parcel saved = parcels.save(p);
        // Notifier le client si un propriétaire est assigné
        notificationService.onValidation(saved);
        return saved;
    }

    public record AdminCreateRequest(
        String name, String description, String senderName, String senderEmail,
        String originAddress, Double originLat, Double originLng,
        String destinationAddress, Double destinationLat, Double destinationLng,
        TransportMode transportMode, MaterialType material,
        java.math.BigDecimal weightKg, java.math.BigDecimal estimatedCost,
        Integer demoDurationMinutes, Integer estimatedDurationMinutes,
        java.util.UUID ownerId, List<String> imageUrls
    ) {}

    /** Supprimer un colis. */
    @Transactional
    public void delete(String parcelId) {
        parcels.deleteById(UUID.fromString(parcelId));
    }
}
