package com.novahexa.tracking.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "site_settings")
public class SiteSettings {

    @Id
    @GeneratedValue
    private UUID id;

    // Contact Information
    @Column(columnDefinition = "text")
    private String address;

    @Column(columnDefinition = "text")
    private String whatsappNumber;

    @Column(columnDefinition = "text")
    private String email;

    @Column(columnDefinition = "text")
    private String hours;

    // Company Information
    @Column(columnDefinition = "text")
    private String companyName;

    @Column(columnDefinition = "text")
    private String companyDescription;

    // Social Media
    @Column(columnDefinition = "text")
    private String facebookUrl;

    @Column(columnDefinition = "text")
    private String twitterUrl;

    @Column(columnDefinition = "text")
    private String instagramUrl;

    @Column(columnDefinition = "text")
    private String linkedinUrl;

    // Metrics (for homepage)
    @Column
    private Integer packagesDelivered;

    @Column
    private Integer countriesCovered;

    // Footer Information
    @Column(columnDefinition = "text")
    private String copyrightText;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getHours() { return hours; }
    public void setHours(String hours) { this.hours = hours; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyDescription() { return companyDescription; }
    public void setCompanyDescription(String companyDescription) { this.companyDescription = companyDescription; }

    public String getFacebookUrl() { return facebookUrl; }
    public void setFacebookUrl(String facebookUrl) { this.facebookUrl = facebookUrl; }

    public String getTwitterUrl() { return twitterUrl; }
    public void setTwitterUrl(String twitterUrl) { this.twitterUrl = twitterUrl; }

    public String getInstagramUrl() { return instagramUrl; }
    public void setInstagramUrl(String instagramUrl) { this.instagramUrl = instagramUrl; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public Integer getPackagesDelivered() { return packagesDelivered; }
    public void setPackagesDelivered(Integer packagesDelivered) { this.packagesDelivered = packagesDelivered; }

    public Integer getCountriesCovered() { return countriesCovered; }
    public void setCountriesCovered(Integer countriesCovered) { this.countriesCovered = countriesCovered; }

    public String getCopyrightText() { return copyrightText; }
    public void setCopyrightText(String copyrightText) { this.copyrightText = copyrightText; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
