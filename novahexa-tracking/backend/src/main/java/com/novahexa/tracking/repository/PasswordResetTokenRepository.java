package com.novahexa.tracking.repository;

import com.novahexa.tracking.domain.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, java.util.UUID> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUserId(java.util.UUID userId);
}
