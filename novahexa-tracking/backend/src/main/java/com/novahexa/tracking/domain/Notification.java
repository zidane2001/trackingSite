package com.novahexa.tracking.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private AppUser user;

    private String type;

    @Column(columnDefinition = "text")
    private String content;

    @Column(nullable = false)
    private boolean read = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser v) { this.user = v; }
    public String getType() { return type; }
    public void setType(String v) { this.type = v; }
    public String getContent() { return content; }
    public void setContent(String v) { this.content = v; }
    public boolean isRead() { return read; }
    public void setRead(boolean v) { this.read = v; }
    public Instant getCreatedAt() { return createdAt; }
}
