package com.novahexa.tracking.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final boolean enabled;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name:}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret) {

        this.enabled = !cloudName.isBlank() && !apiKey.isBlank() && !apiSecret.isBlank();
        this.cloudinary = enabled
                ? new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true))
                : null;
    }

    /** Téléverse un fichier et retourne l'URL sécurisée. */
    @SuppressWarnings("unchecked")
    public String upload(MultipartFile file) throws IOException {
        if (!enabled) {
            throw new IllegalStateException(
                    "Cloudinary non configuré : renseigne CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET.");
        }
        Map<String, Object> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap("folder", "youmslogistic/packages"));
        return (String) result.get("secure_url");
    }

    public boolean isEnabled() {
        return enabled;
    }
}
