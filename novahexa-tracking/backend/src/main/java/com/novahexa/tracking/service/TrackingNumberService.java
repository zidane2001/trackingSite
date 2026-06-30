package com.novahexa.tracking.service;

import com.novahexa.tracking.repository.ParcelRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class TrackingNumberService {

    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom random = new SecureRandom();
    private final ParcelRepository parcels;

    public TrackingNumberService(ParcelRepository parcels) {
        this.parcels = parcels;
    }

    /** Numéro unique au format NHX-XXXXXX. */
    public String generateUnique() {
        String candidate;
        do {
            candidate = "NHX-" + random6();
        } while (parcels.existsByTrackingNumber(candidate));
        return candidate;
    }

    private String random6() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
