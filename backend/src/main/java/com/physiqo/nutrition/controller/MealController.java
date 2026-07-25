package com.physiqo.nutrition.controller;

import com.physiqo.common.security.CurrentUser;
import com.physiqo.common.security.UserPrincipal;
import com.physiqo.nutrition.dto.DailySummaryDto;
import com.physiqo.nutrition.dto.MealDto;
import com.physiqo.nutrition.dto.MealRequest;
import com.physiqo.nutrition.service.MealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    @PostMapping
    public ResponseEntity<MealDto> createMeal(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody MealRequest request) {
        MealDto meal = mealService.createMeal(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(meal);
    }

    @GetMapping
    public ResponseEntity<Page<MealDto>> getMeals(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            Pageable pageable) {
        Page<MealDto> meals = mealService.getMeals(currentUser.getId(), date, from, to, pageable);
        return ResponseEntity.ok(meals);
    }

    @GetMapping("/daily-summary")
    public ResponseEntity<DailySummaryDto> getDailySummary(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DailySummaryDto summary = mealService.getDailySummary(currentUser.getId(), date);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MealDto> getMealById(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {
        MealDto meal = mealService.getMealById(id, currentUser.getId());
        return ResponseEntity.ok(meal);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeal(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable UUID id) {
        mealService.deleteMeal(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
