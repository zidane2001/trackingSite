package com.novahexa.tracking.repository;

import com.novahexa.tracking.domain.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, java.util.UUID> {
    Optional<VerificationToken> findByToken(String token);
    void deleteByUserId(java.util.UUID userId);
}
