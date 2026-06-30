package com.novahexa.tracking.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tracking_events")
public class TrackingEvent {

    @Id @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "package_id")
    private Parcel parcel;

    @Enumerated(EnumType.STRING)
    private EventType eventType;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public TrackingEvent() {}
    public TrackingEvent(Parcel p, EventType t, String d) {
        this.parcel = p; this.eventType = t; this.description = d;
    }

    public UUID getId() { return id; }
    public Parcel getParcel() { return parcel; }
    public void setParcel(Parcel v) { this.parcel = v; }
    public EventType getEventType() { return eventType; }
    public void setEventType(EventType v) { this.eventType = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public Instant getCreatedAt() { return createdAt; }
}
