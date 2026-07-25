package com.physiqo.ai.repository;

import com.physiqo.ai.entity.AiInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiInsightRepository extends JpaRepository<AiInsight, UUID> {
    List<AiInsight> findByUserIdAndIsDismissedFalseOrderByCreatedAtDesc(UUID userId);
}
