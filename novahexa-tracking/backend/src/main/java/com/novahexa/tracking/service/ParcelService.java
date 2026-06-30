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

@Service
public class ParcelService {

    private final ParcelRepository parcels;
    private final TrackingNumberService trackingNumbers;

    public ParcelService(ParcelRepository parcels, TrackingNumberService trackingNumbers) {
        this.parcels = parcels;
        this.trackingNumbers = trackingNumbers;
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
        p.setEstimatedCost(req.estimatedCost());
        p.setPhotoUrl(req.photoUrl());
        p.setStatus(ParcelStatus.PENDING);

        p.getEvents().add(new TrackingEvent(p, EventType.SUBMITTED,
                "Demande soumise par le client"));

        parcels.save(p);
        return new ParcelSubmissionResponse(p.getTrackingNumber(), p.getStatus(), p.getEstimatedCost());
    }

    @Transactional(readOnly = true)
    public Parcel getByTrackingNumber(String trackingNumber) {
        return parcels.findByTrackingNumber(trackingNumber)
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
        return parcels.save(p);
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
        return parcels.save(p);
    }
}
