package com.novahexa.tracking.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "contact_messages")
public class ContactMessage {

    @Id @GeneratedValue
    private UUID id;

    private String name;
    private String email;

    @Column(columnDefinition = "text")
    private String message;

    @Enumerated(EnumType.STRING)
    private ContactStatus status = ContactStatus.NON_TRAITE;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public String getMessage() { return message; }
    public void setMessage(String v) { this.message = v; }
    public ContactStatus getStatus() { return status; }
    public void setStatus(ContactStatus v) { this.status = v; }
    public Instant getCreatedAt() { return createdAt; }
}
