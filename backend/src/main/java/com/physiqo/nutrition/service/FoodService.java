package com.physiqo.nutrition.service;

import com.physiqo.common.exception.ErrorCode;
import com.physiqo.common.exception.ResourceNotFoundException;
import com.physiqo.nutrition.entity.Food;
import com.physiqo.nutrition.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;

    @Transactional(readOnly = true)
    public Page<Food> searchFoods(String search, Boolean custom, UUID userId, Pageable pageable) {
        return foodRepository.searchFoods(search, custom, userId, pageable);
    }

    @Transactional(readOnly = true)
    public Food getFoodById(UUID id) {
        return foodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_FOOD, "Food item not found: " + id));
    }

    @Transactional
    public Food createCustomFood(UUID userId, Food food) {
        food.setCustom(true);
        food.setCreatedBy(userId);
        food.setVerified(false);
        return foodRepository.save(food);
    }
}
