package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.SiteSettings;
import com.novahexa.tracking.repository.SiteSettingsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminSiteSettingsController {

    private final SiteSettingsRepository repository;

    public AdminSiteSettingsController(SiteSettingsRepository repository) {
        this.repository = repository;
    }

    /** Get site settings (create default if none exists) */
    @GetMapping
    public ResponseEntity<SiteSettings> getSettings() {
        Optional<SiteSettings> settings = repository.findFirstByOrderByIdAsc();
        if (settings.isPresent()) {
            return ResponseEntity.ok(settings.get());
        }
        
        // Create default settings if none exists
        SiteSettings defaultSettings = createDefaultSettings();
        SiteSettings saved = repository.save(defaultSettings);
        return ResponseEntity.ok(saved);
    }

    /** Update site settings */
    @PutMapping
    public ResponseEntity<SiteSettings> updateSettings(@RequestBody SiteSettingsRequest request) {
        Optional<SiteSettings> existing = repository.findFirstByOrderByIdAsc();
        SiteSettings settings = existing.orElseGet(this::createDefaultSettings);
        
        // Update fields from request
        if (request.address() != null) settings.setAddress(request.address());
        if (request.whatsappNumber() != null) settings.setWhatsappNumber(request.whatsappNumber());
        if (request.email() != null) settings.setEmail(request.email());
        if (request.hours() != null) settings.setHours(request.hours());
        if (request.companyName() != null) settings.setCompanyName(request.companyName());
        if (request.companyDescription() != null) settings.setCompanyDescription(request.companyDescription());
        if (request.facebookUrl() != null) settings.setFacebookUrl(request.facebookUrl());
        if (request.twitterUrl() != null) settings.setTwitterUrl(request.twitterUrl());
        if (request.instagramUrl() != null) settings.setInstagramUrl(request.instagramUrl());
        if (request.linkedinUrl() != null) settings.setLinkedinUrl(request.linkedinUrl());
        if (request.packagesDelivered() != null) settings.setPackagesDelivered(request.packagesDelivered());
        if (request.countriesCovered() != null) settings.setCountriesCovered(request.countriesCovered());
        if (request.copyrightText() != null) settings.setCopyrightText(request.copyrightText());
        
        SiteSettings saved = repository.save(settings);
        return ResponseEntity.ok(saved);
    }

    /** Reset to default settings */
    @PostMapping("/reset")
    public ResponseEntity<SiteSettings> resetSettings() {
        Optional<SiteSettings> existing = repository.findFirstByOrderByIdAsc();
        existing.ifPresent(repository::delete);
        
        SiteSettings defaultSettings = createDefaultSettings();
        SiteSettings saved = repository.save(defaultSettings);
        return ResponseEntity.ok(saved);
    }

    private SiteSettings createDefaultSettings() {
        SiteSettings settings = new SiteSettings();
        settings.setAddress("26 Rue Charles Fabry, 66000 Perpignan, France");
        settings.setWhatsappNumber("+33 6 00 00 00 00");
        settings.setEmail("contact@youmslogistics.com");
        settings.setHours("Mon - Sat: 8:00 AM - 7:00 PM");
        settings.setCompanyName("Youms Logistics");
        settings.setCompanyDescription("International transport & logistics. Track your packages in real time across 150+ countries.");
        settings.setFacebookUrl("");
        settings.setTwitterUrl("");
        settings.setInstagramUrl("");
        settings.setLinkedinUrl("");
        settings.setPackagesDelivered(50000);
        settings.setCountriesCovered(150);
        settings.setCopyrightText("All rights reserved.");
        return settings;
    }

    public record SiteSettingsRequest(
            String address,
            String whatsappNumber,
            String email,
            String hours,
            String companyName,
            String companyDescription,
            String facebookUrl,
            String twitterUrl,
            String instagramUrl,
            String linkedinUrl,
            Integer packagesDelivered,
            Integer countriesCovered,
            String copyrightText
    ) {}
}
