package com.novahexa.tracking.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

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
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id")
    private AppUser owner;

    private String senderName;
    private String senderEmail;
    private String senderPhone;
    private String senderAddress;
    private String receiverName;
    private String receiverEmail;
    private String receiverPhone;
    private String receiverAddress;

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

    @Column(name = "photo_url", columnDefinition = "text")
    private String imageUrls;

    private Instant validatedAt;

    /** Instant où le colis est passé IN_TRANSIT (départ de l'animation). */
    private Instant transitStartedAt;

    /** Durée démo en minutes (compressée pour les tests). Null = durée réelle. */
    private Integer demoDurationMinutes;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "validated_by")
    private AppUser validatedBy;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "parcel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    private List<Waypoint> waypoints = new ArrayList<>();

    @OneToMany(mappedBy = "parcel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private Set<TrackingEvent> events = new LinkedHashSet<>();

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
    public String getSenderAddress() { return senderAddress; }
    public void setSenderAddress(String v) { this.senderAddress = v; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String v) { this.receiverName = v; }
    public String getReceiverEmail() { return receiverEmail; }
    public void setReceiverEmail(String v) { this.receiverEmail = v; }
    public String getReceiverPhone() { return receiverPhone; }
    public void setReceiverPhone(String v) { this.receiverPhone = v; }
    public String getReceiverAddress() { return receiverAddress; }
    public void setReceiverAddress(String v) { this.receiverAddress = v; }
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
    public String getImageUrls() { return imageUrls; }
    public void setImageUrls(String v) { this.imageUrls = v; }
    public Instant getValidatedAt() { return validatedAt; }
    public void setValidatedAt(Instant v) { this.validatedAt = v; }
    public Instant getTransitStartedAt() { return transitStartedAt; }
    public void setTransitStartedAt(Instant v) { this.transitStartedAt = v; }
    public Integer getDemoDurationMinutes() { return demoDurationMinutes; }
    public void setDemoDurationMinutes(Integer v) { this.demoDurationMinutes = v; }
    public AppUser getValidatedBy() { return validatedBy; }
    public void setValidatedBy(AppUser v) { this.validatedBy = v; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<Waypoint> getWaypoints() { return waypoints; }
    public Set<TrackingEvent> getEvents() { return events; }
}
