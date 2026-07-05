package com.novahexa.tracking.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "waypoints")
public class Waypoint {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "package_id")
    private Parcel parcel;

    private String label;
    private Integer orderIndex;
    private Double lat;
    private Double lng;
    private Instant estimatedArrival;
    private Instant reachedAt;

    /** Durée de l'arrêt en minutes (définie par l'admin). */
    private Integer stopDurationMinutes;

    public UUID getId() { return id; }
    public Parcel getParcel() { return parcel; }
    public void setParcel(Parcel v) { this.parcel = v; }
    public String getLabel() { return label; }
    public void setLabel(String v) { this.label = v; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer v) { this.orderIndex = v; }
    public Double getLat() { return lat; }
    public void setLat(Double v) { this.lat = v; }
    public Double getLng() { return lng; }
    public void setLng(Double v) { this.lng = v; }
    public Instant getEstimatedArrival() { return estimatedArrival; }
    public void setEstimatedArrival(Instant v) { this.estimatedArrival = v; }
    public Instant getReachedAt() { return reachedAt; }
    public void setReachedAt(Instant v) { this.reachedAt = v; }
    public Integer getStopDurationMinutes() { return stopDurationMinutes; }
    public void setStopDurationMinutes(Integer v) { this.stopDurationMinutes = v; }
}
