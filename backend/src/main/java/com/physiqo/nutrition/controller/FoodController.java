package com.physiqo.nutrition.controller;

import com.physiqo.common.security.CurrentUser;
import com.physiqo.common.security.UserPrincipal;
import com.physiqo.nutrition.entity.Food;
import com.physiqo.nutrition.service.FoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @GetMapping
    public ResponseEntity<Page<Food>> searchFoods(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean custom,
            Pageable pageable) {
        Page<Food> foods = foodService.searchFoods(search, custom, currentUser.getId(), pageable);
        return ResponseEntity.ok(foods);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Food> getFoodById(@PathVariable UUID id) {
        Food food = foodService.getFoodById(id);
        return ResponseEntity.ok(food);
    }

    @PostMapping
    public ResponseEntity<Food> createCustomFood(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody Food food) {
        Food created = foodService.createCustomFood(currentUser.getId(), food);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
