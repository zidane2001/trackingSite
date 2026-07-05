package com.novahexa.tracking.repository;

import com.novahexa.tracking.domain.Parcel;
import com.novahexa.tracking.domain.ParcelStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ParcelRepository extends JpaRepository<Parcel, UUID> {

    /** Detail query: loads waypoints + events for full ParcelView. */
    @EntityGraph(attributePaths = {"owner", "waypoints", "events"})
    Optional<Parcel> findByTrackingNumber(String trackingNumber);

    boolean existsByTrackingNumber(String trackingNumber);

    /** List queries: lightweight — no waypoints/events loaded. */
    List<Parcel> findByStatusOrderByCreatedAtDesc(ParcelStatus status);
    List<Parcel> findAllByOrderByCreatedAtDesc();
    List<Parcel> findByOwner_IdOrderByCreatedAtDesc(UUID ownerId);

    /** Detail query by ID with full collections for ParcelView. */
    @EntityGraph(attributePaths = {"owner", "waypoints", "events"})
    @Query("SELECT p FROM Parcel p WHERE p.id = :id")
    Optional<Parcel> findByIdWithCollections(UUID id);
}
