package com.novahexa.tracking.service;

import com.novahexa.tracking.domain.*;
import com.novahexa.tracking.dto.ParcelSubmissionRequest;
import com.novahexa.tracking.dto.ParcelSubmissionResponse;
import com.novahexa.tracking.repository.ParcelRepository;
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

    public ParcelService(ParcelRepository parcels, TrackingNumberService trackingNumbers,
                         NotificationService notificationService, PricingService pricingService,
                         GeocodingService geocodingService) {
        this.parcels = parcels;
        this.trackingNumbers = trackingNumbers;
        this.notificationService = notificationService;
        this.pricingService = pricingService;
        this.geocodingService = geocodingService;
    }

    /** Cahier §5.2 : soumission client -> statut PENDING + n° de suivi auto. */
    @Transactional
    public ParcelSubmissionResponse submit(ParcelSubmissionRequest req) {
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
        // Cahier §3.1 : recalcul côté serveur pour éviter la falsification
        p.setEstimatedCost(pricingService.estimateCost(
                req.mode(), req.delay(), req.material(),
                req.weightKg(),
                req.dimensions() != null ? req.dimensions().heightCm() : null,
                req.dimensions() != null ? req.dimensions().widthCm() : null,
                req.dimensions() != null ? req.dimensions().lengthCm() : null));
        p.setPhotoUrl(req.photoUrl());
        p.setStatus(ParcelStatus.PENDING);

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
        return parcels.findById(id)
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

    /** Cahier §6.2 : validation admin -> statut VALIDATED. */
    @Transactional
    public Parcel validate(String trackingNumber, AppUser admin) {
        Parcel p = getByTrackingNumber(trackingNumber);
        if (p.getStatus() != ParcelStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le colis n'est pas en attente");
        }
        p.setStatus(ParcelStatus.VALIDATED);
        p.setValidatedAt(Instant.now());
        p.setValidatedBy(admin);
        p.getEvents().add(new TrackingEvent(p, EventType.VALIDATED,
                "Validée par l'administrateur"));
        Parcel saved = parcels.save(p);

        // Cahier §9 : notification de validation
        notificationService.onValidation(saved);

        return saved;
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

    /** Mettre le colis en transit (après validation). */
    @Transactional
    public Parcel setInTransit(String trackingNumber, AppUser admin) {
        Parcel p = getByTrackingNumber(trackingNumber);
        if (p.getStatus() != ParcelStatus.VALIDATED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Le colis n'est pas validé");
        }
        p.setStatus(ParcelStatus.IN_TRANSIT);
        p.getEvents().add(new TrackingEvent(p, EventType.IN_TRANSIT,
                "Colis en transit"));
        return parcels.save(p);
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
    public Waypoint addWaypoint(String parcelId, String label, double lat, double lng) {
        Parcel p = getById(UUID.fromString(parcelId));
        Waypoint wp = new Waypoint();
        wp.setParcel(p);
        wp.setLabel(label);
        wp.setLat(lat);
        wp.setLng(lng);
        wp.setOrderIndex(p.getWaypoints().size());
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

    /** Supprimer un colis. */
    @Transactional
    public void delete(String parcelId) {
        parcels.deleteById(UUID.fromString(parcelId));
    }
}
