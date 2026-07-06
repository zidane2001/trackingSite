package com.novahexa.tracking.repository;

import com.novahexa.tracking.domain.SiteSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SiteSettingsRepository extends JpaRepository<SiteSettings, UUID> {
    Optional<SiteSettings> findFirstByOrderByIdAsc();
}
