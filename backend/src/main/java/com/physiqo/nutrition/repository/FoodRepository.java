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

    @Query("SELECT f FROM Food f WHERE " +
           "(:search IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(f.brand) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:custom IS NULL OR f.custom = :custom) AND " +
           "(f.custom = false OR f.createdBy = :userId)")
    Page<Food> searchFoods(
            @Param("search") String search,
            @Param("custom") Boolean custom,
            @Param("userId") UUID userId,
            Pageable pageable);
}
