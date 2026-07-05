package com.novahexa.tracking.service;

import com.novahexa.tracking.repository.ParcelRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class TrackingNumberService {

    private static final String DIGITS = "0123456789";
    private final SecureRandom random = new SecureRandom();
    private final ParcelRepository parcels;

    public TrackingNumberService(ParcelRepository parcels) {
        this.parcels = parcels;
    }

    /** Numéro unique au format YL-XXXXXXXX-FR (Youms Logistics). */
    public String generateUnique() {
        String candidate;
        do {
            candidate = "YL-" + randomDigits(8) + "-FR";
        } while (parcels.existsByTrackingNumber(candidate));
        return candidate;
    }

    private String randomDigits(int count) {
        StringBuilder sb = new StringBuilder(count);
        for (int i = 0; i < count; i++) {
            sb.append(DIGITS.charAt(random.nextInt(DIGITS.length())));
        }
        return sb.toString();
    }
}
