package com.physiqo.nutrition.repository;

import com.physiqo.nutrition.entity.Food;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FoodRepository extends JpaRepository<Food, UUID> {

    @Query(value = "SELECT f FROM Food f WHERE " +
           "(:search IS NULL OR LOWER(f.name) LIKE :search OR LOWER(f.brand) LIKE :search) AND " +
           "(:custom IS NULL OR f.custom = :custom) AND " +
           "(f.custom = false OR (:userId IS NOT NULL AND f.createdBy = :userId))",
           countQuery = "SELECT count(f) FROM Food f WHERE " +
           "(:search IS NULL OR LOWER(f.name) LIKE :search OR LOWER(f.brand) LIKE :search) AND " +
           "(:custom IS NULL OR f.custom = :custom) AND " +
           "(f.custom = false OR (:userId IS NOT NULL AND f.createdBy = :userId))")
    Page<Food> searchFoods(
            @Param("search") String search,
            @Param("custom") Boolean custom,
            @Param("userId") UUID userId,
            Pageable pageable);
}
