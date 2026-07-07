package com.novahexa.tracking.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.util.Map;

/**
 * Service de géocodage utilisant l'API Nominatim d'OpenStreetMap.
 * Convertit une adresse en coordonnées lat/lng.
 */
@Service
public class GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);
    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

    private final RestTemplate http = new RestTemplate();

    @Value("${app.geocoding.enabled:true}")
    private boolean enabled;

    /**
     * Géocode une adresse et retourne les coordonnées.
     * @param address l'adresse à géocoder
     * @return un tableau [lat, lng] ou null si non trouvé
     */
    public double[] geocode(String address) {
        if (!enabled || address == null || address.isBlank()) {
            return null;
        }

        try {
            String url = NOMINATIM_URL + "?q=" + UriUtils.encodePath(address, "UTF-8")
                    + "&format=json&limit=1&addressdetails=0";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "YoumsLogistics-Tracking/1.0 (youmslogistic@gmail.com)");
            HttpEntity<?> entity = new HttpEntity<>(headers);

            ResponseEntity<GeocodingResult[]> response = http.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    GeocodingResult[].class
            );

            GeocodingResult[] results = response.getBody();
            if (results != null && results.length > 0) {
                double lat = Double.parseDouble(results[0].lat());
                double lng = Double.parseDouble(results[0].lon());
                log.info("[GeocodingService] Géocodé '{}' -> [{}, {}]", address, lat, lng);
                return new double[]{lat, lng};
            }

            log.warn("[GeocodingService] Aucun résultat pour l'adresse: {}", address);
            return null;
        } catch (Exception e) {
            log.error("[GeocodingService] Erreur lors du géocodage de '{}': {}", address, e.getMessage());
            return null;
        }
    }

    private record GeocodingResult(String lat, String lon) {}
}