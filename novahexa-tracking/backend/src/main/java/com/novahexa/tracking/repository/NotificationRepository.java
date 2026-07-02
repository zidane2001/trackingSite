package com.novahexa.tracking.repository;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findAllByOrderByCreatedAtDesc();

    List<Notification> findByUserOrderByCreatedAtDesc(AppUser user);

    long countByUserAndReadFalse(AppUser user);

    @Query("SELECT n FROM Notification n WHERE n.user.email = :email ORDER BY n.createdAt DESC")
    List<Notification> findByUserEmail(@Param("email") String email);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.email = :email AND n.read = false")
    long countUnreadByEmail(@Param("email") String email);
}
