package com.novahexa.tracking.repository;

import com.novahexa.tracking.domain.FaqItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FaqItemRepository extends JpaRepository<FaqItem, UUID> {
    List<FaqItem> findByEnabledTrueOrderBySortOrderAsc();
    List<FaqItem> findAllByOrderBySortOrderAsc();
}
