package com.physiqo.nutrition.service;

import com.physiqo.common.exception.ErrorCode;
import com.physiqo.common.exception.ResourceNotFoundException;
import com.physiqo.nutrition.dto.*;
import com.physiqo.nutrition.entity.Food;
import com.physiqo.nutrition.entity.Meal;
import com.physiqo.nutrition.entity.MealItem;
import com.physiqo.nutrition.entity.NutritionGoal;
import com.physiqo.nutrition.repository.FoodRepository;
import com.physiqo.nutrition.repository.MealRepository;
import com.physiqo.nutrition.repository.NutritionGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository mealRepository;
    private final FoodRepository foodRepository;
    private final NutritionGoalRepository goalRepository;

    @Transactional
    public MealDto createMeal(UUID userId, MealRequest request) {
        Meal meal = Meal.builder()
                .userId(userId)
                .mealType(request.getMealType().toUpperCase())
                .mealDate(request.getMealDate())
                .mealTime(request.getMealTime() != null ? request.getMealTime() : LocalTime.now())
                .notes(request.getNotes())
                .build();

        if (request.getItems() != null) {
            for (MealItemRequest itemReq : request.getItems()) {
                Food food = foodRepository.findById(itemReq.getFoodId())
                        .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_FOOD, "Food item not found: " + itemReq.getFoodId()));

                MealItem item = MealItem.builder()
                        .meal(meal)
                        .food(food)
                        .quantity(itemReq.getQuantity())
                        .build();

                meal.getItems().add(item);
            }
        }

        Meal saved = mealRepository.save(meal);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<MealDto> getMeals(UUID userId, LocalDate date, LocalDate from, LocalDate to, Pageable pageable) {
        Page<Meal> page;
        if (date != null) {
            page = mealRepository.findByUserIdAndMealDate(userId, date, pageable);
        } else if (from != null && to != null) {
            page = mealRepository.findByUserIdAndMealDateBetween(userId, from, to, pageable);
        } else {
            page = mealRepository.findByUserId(userId, pageable);
        }
        return page.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public MealDto getMealById(UUID id, UUID userId) {
        Meal meal = mealRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_MEAL, "Meal not found: " + id));
        return toDto(meal);
    }

    @Transactional
    public void deleteMeal(UUID id, UUID userId) {
        Meal meal = mealRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND_MEAL, "Meal not found: " + id));
        mealRepository.delete(meal);
    }

    @Transactional(readOnly = true)
    public DailySummaryDto getDailySummary(UUID userId, LocalDate date) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        List<Meal> meals = mealRepository.findByUserIdAndMealDateOrderByMealTimeAsc(userId, queryDate);

        BigDecimal totalCalories = BigDecimal.ZERO;
        BigDecimal totalProtein = BigDecimal.ZERO;
        BigDecimal totalCarbs = BigDecimal.ZERO;
        BigDecimal totalFat = BigDecimal.ZERO;

        Map<String, MealDto.MacroTotals> mealTypeTotals = new LinkedHashMap<>();

        for (Meal meal : meals) {
            MealDto dto = toDto(meal);
            totalCalories = totalCalories.add(dto.getTotals().getCalories());
            totalProtein = totalProtein.add(dto.getTotals().getProtein());
            totalCarbs = totalCarbs.add(dto.getTotals().getCarbs());
            totalFat = totalFat.add(dto.getTotals().getFat());

            mealTypeTotals.merge(meal.getMealType(), dto.getTotals(), (existing, newTotals) ->
                    MealDto.MacroTotals.builder()
                            .calories(existing.getCalories().add(newTotals.getCalories()))
                            .protein(existing.getProtein().add(newTotals.getProtein()))
                            .carbs(existing.getCarbs().add(newTotals.getCarbs()))
                            .fat(existing.getFat().add(newTotals.getFat()))
                            .build()
            );
        }

        List<DailySummaryDto.MealSummary> mealSummaries = mealTypeTotals.entrySet().stream()
                .map(e -> DailySummaryDto.MealSummary.builder()
                        .mealType(e.getKey())
                        .calories(e.getValue().getCalories())
                        .protein(e.getValue().getProtein())
                        .carbs(e.getValue().getCarbs())
                        .fat(e.getValue().getFat())
                        .build())
                .collect(Collectors.toList());

        NutritionGoal currentGoal = goalRepository.findCurrentGoalForUser(userId, queryDate).orElse(null);

        return DailySummaryDto.builder()
                .date(queryDate)
                .totalCalories(totalCalories)
                .totalProtein(totalProtein)
                .totalCarbs(totalCarbs)
                .totalFat(totalFat)
                .goal(currentGoal)
                .meals(mealSummaries)
                .build();
    }

    private MealDto toDto(Meal meal) {
        BigDecimal cal = BigDecimal.ZERO;
        BigDecimal pro = BigDecimal.ZERO;
        BigDecimal carb = BigDecimal.ZERO;
        BigDecimal fat = BigDecimal.ZERO;

        List<MealDto.MealItemDto> itemDtos = new ArrayList<>();

        if (meal.getItems() != null) {
            for (MealItem item : meal.getItems()) {
                Food food = item.getFood();
                BigDecimal qty = item.getQuantity();

                BigDecimal itemCal = food.getCaloriesKcal().multiply(qty).setScale(1, RoundingMode.HALF_UP);
                BigDecimal itemPro = food.getProteinG().multiply(qty).setScale(1, RoundingMode.HALF_UP);
                BigDecimal itemCarb = food.getCarbsG().multiply(qty).setScale(1, RoundingMode.HALF_UP);
                BigDecimal itemFat = food.getFatG().multiply(qty).setScale(1, RoundingMode.HALF_UP);

                cal = cal.add(itemCal);
                pro = pro.add(itemPro);
                carb = carb.add(itemCarb);
                fat = fat.add(itemFat);

                itemDtos.add(MealDto.MealItemDto.builder()
                        .id(item.getId())
                        .foodId(food.getId())
                        .foodName(food.getName())
                        .brand(food.getBrand())
                        .servingSizeG(food.getServingSizeG())
                        .servingLabel(food.getServingLabel())
                        .quantity(qty)
                        .caloriesKcal(itemCal)
                        .proteinG(itemPro)
                        .carbsG(itemCarb)
                        .fatG(itemFat)
                        .build());
            }
        }

        return MealDto.builder()
                .id(meal.getId())
                .userId(meal.getUserId())
                .mealType(meal.getMealType())
                .mealDate(meal.getMealDate())
                .mealTime(meal.getMealTime())
                .notes(meal.getNotes())
                .items(itemDtos)
                .totals(MealDto.MacroTotals.builder()
                        .calories(cal)
                        .protein(pro)
                        .carbs(carb)
                        .fat(fat)
                        .build())
                .createdAt(meal.getCreatedAt())
                .updatedAt(meal.getUpdatedAt())
                .build();
    }
}
