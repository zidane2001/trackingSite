package com.novahexa.tracking.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "messages")
public class Message {

    @Id @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "package_id")
    private Parcel parcel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private AppUser sender;

    private String subject;

    @Column(columnDefinition = "text")
    private String body;

    @Column(nullable = false, updatable = false)
    private Instant sentAt = Instant.now();

    public UUID getId() { return id; }
    public Parcel getParcel() { return parcel; }
    public void setParcel(Parcel v) { this.parcel = v; }
    public AppUser getSender() { return sender; }
    public void setSender(AppUser v) { this.sender = v; }
    public String getSubject() { return subject; }
    public void setSubject(String v) { this.subject = v; }
    public String getBody() { return body; }
    public void setBody(String v) { this.body = v; }
    public Instant getSentAt() { return sentAt; }
}
