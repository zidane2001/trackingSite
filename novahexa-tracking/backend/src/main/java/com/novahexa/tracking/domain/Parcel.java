package com.novahexa.tracking.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "packages")
public class Parcel {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String trackingNumber;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    // Déposant (le cahier prévoit owner_id -> users ; ici on stocke aussi
    // les coordonnées saisies au dépôt pour le pré-remplissage / notifications).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private AppUser owner;

    private String senderName;
    private String senderEmail;
    private String senderPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParcelStatus status = ParcelStatus.PENDING;

    @Column(columnDefinition = "text")
    private String refusalReason;

    // Trajet
    private String originAddress;
    private Double originLat;
    private Double originLng;
    private String destinationAddress;
    private Double destinationLat;
    private Double destinationLng;

    @Enumerated(EnumType.STRING)
    private TransportMode transportMode;

    @Enumerated(EnumType.STRING)
    private DeliveryDelay deliveryDelay;

    @Enumerated(EnumType.STRING)
    private MaterialType material;

    private BigDecimal weightKg;
    private Integer heightCm;
    private Integer widthCm;
    private Integer lengthCm;

    private BigDecimal estimatedCost;
    private Integer estimatedDurationMinutes;

    private LocalDate shippingDate;
    private String photoUrl;

    private Instant validatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validated_by")
    private AppUser validatedBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "parcel", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<Waypoint> waypoints = new ArrayList<>();

    @OneToMany(mappedBy = "parcel", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<TrackingEvent> events = new ArrayList<>();

    @PreUpdate
    public void touch() { this.updatedAt = Instant.now(); }

    // --- getters / setters ---
    public UUID getId() { return id; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String v) { this.trackingNumber = v; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public AppUser getOwner() { return owner; }
    public void setOwner(AppUser v) { this.owner = v; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String v) { this.senderName = v; }
    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String v) { this.senderEmail = v; }
    public String getSenderPhone() { return senderPhone; }
    public void setSenderPhone(String v) { this.senderPhone = v; }
    public ParcelStatus getStatus() { return status; }
    public void setStatus(ParcelStatus v) { this.status = v; }
    public String getRefusalReason() { return refusalReason; }
    public void setRefusalReason(String v) { this.refusalReason = v; }
    public String getOriginAddress() { return originAddress; }
    public void setOriginAddress(String v) { this.originAddress = v; }
    public Double getOriginLat() { return originLat; }
    public void setOriginLat(Double v) { this.originLat = v; }
    public Double getOriginLng() { return originLng; }
    public void setOriginLng(Double v) { this.originLng = v; }
    public String getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(String v) { this.destinationAddress = v; }
    public Double getDestinationLat() { return destinationLat; }
    public void setDestinationLat(Double v) { this.destinationLat = v; }
    public Double getDestinationLng() { return destinationLng; }
    public void setDestinationLng(Double v) { this.destinationLng = v; }
    public TransportMode getTransportMode() { return transportMode; }
    public void setTransportMode(TransportMode v) { this.transportMode = v; }
    public DeliveryDelay getDeliveryDelay() { return deliveryDelay; }
    public void setDeliveryDelay(DeliveryDelay v) { this.deliveryDelay = v; }
    public MaterialType getMaterial() { return material; }
    public void setMaterial(MaterialType v) { this.material = v; }
    public BigDecimal getWeightKg() { return weightKg; }
    public void setWeightKg(BigDecimal v) { this.weightKg = v; }
    public Integer getHeightCm() { return heightCm; }
    public void setHeightCm(Integer v) { this.heightCm = v; }
    public Integer getWidthCm() { return widthCm; }
    public void setWidthCm(Integer v) { this.widthCm = v; }
    public Integer getLengthCm() { return lengthCm; }
    public void setLengthCm(Integer v) { this.lengthCm = v; }
    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal v) { this.estimatedCost = v; }
    public Integer getEstimatedDurationMinutes() { return estimatedDurationMinutes; }
    public void setEstimatedDurationMinutes(Integer v) { this.estimatedDurationMinutes = v; }
    public LocalDate getShippingDate() { return shippingDate; }
    public void setShippingDate(LocalDate v) { this.shippingDate = v; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String v) { this.photoUrl = v; }
    public Instant getValidatedAt() { return validatedAt; }
    public void setValidatedAt(Instant v) { this.validatedAt = v; }
    public AppUser getValidatedBy() { return validatedBy; }
    public void setValidatedBy(AppUser v) { this.validatedBy = v; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<Waypoint> getWaypoints() { return waypoints; }
    public List<TrackingEvent> getEvents() { return events; }
}
