package com.novahexa.tracking.repository;

import com.novahexa.tracking.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByParcelIdOrderBySentAtDesc(UUID parcelId);
}
