package com.novahexa.tracking.repository;

import com.novahexa.tracking.domain.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(value = "DELETE FROM password_reset_tokens WHERE user_id = CAST(:userId AS uuid)", nativeQuery = true)
    void deleteByUserId(UUID userId);
}
