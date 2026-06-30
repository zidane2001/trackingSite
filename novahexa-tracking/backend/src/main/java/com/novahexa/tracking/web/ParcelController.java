package com.novahexa.tracking.web;

import com.novahexa.tracking.dto.ParcelSubmissionRequest;
import com.novahexa.tracking.dto.ParcelSubmissionResponse;
import com.novahexa.tracking.dto.ParcelView;
import com.novahexa.tracking.service.ParcelService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ParcelController {

    private final ParcelService parcels;

    public ParcelController(ParcelService parcels) {
        this.parcels = parcels;
    }

    /** Soumission d'un colis depuis le formulaire du hero (public). */
    @PostMapping("/packages")
    @ResponseStatus(HttpStatus.CREATED)
    public ParcelSubmissionResponse submit(@Valid @RequestBody ParcelSubmissionRequest req) {
        return parcels.submit(req);
    }

    /** Suivi public par numéro (cahier §3.3). */
    @GetMapping("/track/{trackingNumber}")
    public ParcelView track(@PathVariable String trackingNumber) {
        return ParcelView.of(parcels.getByTrackingNumber(trackingNumber));
    }
}
