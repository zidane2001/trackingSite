package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.SiteSettings;
import com.novahexa.tracking.repository.SiteSettingsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
public class SiteSettingsController {

    private final SiteSettingsRepository repository;

    public SiteSettingsController(SiteSettingsRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/api/settings")
    public ResponseEntity<SiteSettings> getPublicSettings() {
        Optional<SiteSettings> settings = repository.findFirstByOrderByIdAsc();
        if (settings.isPresent()) {
            return ResponseEntity.ok(settings.get());
        }
        SiteSettings defaultSettings = new SiteSettings();
        defaultSettings.setAddress("26 Rue Charles Fabry, 66000 Perpignan, France");
        defaultSettings.setWhatsappNumber("+33 6 00 00 00 00");
        defaultSettings.setEmail("youmslogistic@gmail.com");
        defaultSettings.setHours("Mon - Sat: 8:00 AM - 7:00 PM");
        defaultSettings.setCompanyName("Youms Logistics");
        defaultSettings.setCompanyDescription("International transport & logistics. Track your packages in real time across 150+ countries.");
        defaultSettings.setFacebookUrl("");
        defaultSettings.setTwitterUrl("");
        defaultSettings.setInstagramUrl("");
        defaultSettings.setLinkedinUrl("");
        defaultSettings.setPackagesDelivered(50000);
        defaultSettings.setCountriesCovered(150);
        defaultSettings.setCopyrightText("All rights reserved.");
        SiteSettings saved = repository.save(defaultSettings);
        return ResponseEntity.ok(saved);
    }
}
