import React, { useState, useEffect, useCallback } from 'react';
import { nutritionApi } from '../../api/nutrition.api';
import { MealPhotoEstimate } from './components/MealPhotoEstimate';
import { LogMealModal } from './components/LogMealModal';
import { NutritionGoalModal } from './components/NutritionGoalModal';
import { toast } from '../../stores/toastStore';

import { DietaryBadge, DietaryType } from './components/DietaryBadge';

interface MealItemDto {
  id: string;
  foodId: string;
  foodName: string;
  brand?: string;
  servingSizeG: number;
  servingLabel?: string;
  quantity: number;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  dietaryType?: DietaryType | string;
}

interface MealDto {
  id: string;
  userId: string;
  mealType: string;
  mealDate: string;
  mealTime?: string;
  notes?: string;
  items: MealItemDto[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface GoalState {
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

const DEFAULT_GOAL: GoalState = {
  caloriesKcal: 2200,
  proteinG: 160,
  carbsG: 220,
  fatG: 65,
};

const MEAL_TYPES = [
  { key: 'BREAKFAST', label: 'Breakfast', icon: '🍳' },
  { key: 'LUNCH', label: 'Lunch', icon: '🥗' },
  { key: 'DINNER', label: 'Dinner', icon: '🥩' },
  { key: 'SNACK', label: 'Snacks', icon: '🍎' },
];

const formatLocalDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayString = (): string => formatLocalDate(new Date());

const NutritionPage: React.FC = () => {
  const [date, setDate] = useState<string>(getTodayString);
  const [meals, setMeals] = useState<MealDto[]>([]);
  const [goal, setGoal] = useState<GoalState>(DEFAULT_GOAL);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [targetMealType, setTargetMealType] = useState('BREAKFAST');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | DietaryType>('ALL');

  const fetchNutritionData = useCallback(async () => {
    setLoading(true);
    try {
      const [mealsRes, goalRes] = await Promise.allSettled([
        nutritionApi.getMeals(date),
        nutritionApi.getCurrentGoal(),
      ]);

      if (mealsRes.status === 'fulfilled') {
        const fetched = mealsRes.value.data.content || mealsRes.value.data || [];
        setMeals(fetched);
      }

      if (goalRes.status === 'fulfilled' && goalRes.value.data) {
        const g = goalRes.value.data;
        setGoal({
          caloriesKcal: Number(g.caloriesKcal) || DEFAULT_GOAL.caloriesKcal,
          proteinG: Number(g.proteinG) || DEFAULT_GOAL.proteinG,
          carbsG: Number(g.carbsG) || DEFAULT_GOAL.carbsG,
          fatG: Number(g.fatG) || DEFAULT_GOAL.fatG,
        });
      }
    } catch (err) {
      console.error('Error loading nutrition data:', err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchNutritionData();
  }, [fetchNutritionData]);

  // Totals calculated from all logged meal items
  const totalCalories = Math.round(meals.reduce((sum, m) => sum + (Number(m.totals?.calories) || 0), 0));
  const totalProtein = Math.round(meals.reduce((sum, m) => sum + (Number(m.totals?.protein) || 0), 0));
  const totalCarbs = Math.round(meals.reduce((sum, m) => sum + (Number(m.totals?.carbs) || 0), 0));
  const totalFat = Math.round(meals.reduce((sum, m) => sum + (Number(m.totals?.fat) || 0), 0));

  const remainingCalories = goal.caloriesKcal - totalCalories;

  // Date Navigation Helpers
  const shiftDate = (days: number) => {
    const parts = date.split('-').map(Number);
    const year = parts[0] || new Date().getFullYear();
    const month = (parts[1] || 1) - 1;
    const day = parts[2] || 1;
    const d = new Date(year, month, day);
    d.setDate(d.getDate() + days);
    setDate(formatLocalDate(d));
  };

  const isToday = date === getTodayString();

  const handleDeleteItem = async (mealId: string, itemId: string, foodName: string) => {
    try {
      await nutritionApi.deleteMealItem(mealId, itemId);
      toast.success(`Removed ${foodName}`, 'Item Deleted');
      fetchNutritionData();
    } catch (err) {
      console.error('Failed to delete item:', err);
      toast.error('Could not remove item. Please try again.', 'Error');
    }
  };

  const handleAIAdd = async (estimatedData: any) => {
    if (!estimatedData?.items || estimatedData.items.length === 0) return;
    try {
      const itemsToLog = [];
      for (const item of estimatedData.items) {
        // Create custom food entry for estimated item
        const foodRes = await nutritionApi.createCustomFood({
          name: item.name,
          servingSizeG: item.portion_grams || 100,
          servingLabel: `${item.portion_grams || 100}g`,
          caloriesKcal: item.calories || 150,
          proteinG: item.protein_g || 10,
          carbsG: item.carbs_g || 15,
          fatG: item.fat_g || 5,
          custom: true,
        });
        itemsToLog.push({
          foodId: foodRes.data.id,
          quantity: 1,
        });
      }

      await nutritionApi.createMeal({
        mealType: targetMealType,
        mealDate: date,
        items: itemsToLog,
      });

      toast.success(`Saved AI meal estimate to ${targetMealType.toLowerCase()}!`, 'Meal Saved');
      fetchNutritionData();
    } catch (err) {
      console.error('Failed to save AI estimate meal:', err);
      toast.error('Could not save AI estimate to your meal log.', 'Error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 relative animate-fade-in">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-surface-900/60 p-5 rounded-2xl border border-surface-800">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Daily Nutrition</h1>
          <p className="text-xs text-gray-400 mt-1">
            Track macros, log meals, and review daily progress against your nutrition targets
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Navigator */}
          <div className="flex items-center bg-surface-950 rounded-xl border border-surface-700 p-1">
            <button
              onClick={() => shiftDate(-1)}
              title="Previous Day"
              className="px-2.5 py-1.5 text-gray-400 hover:text-white hover:bg-surface-800 rounded-lg text-xs transition-colors cursor-pointer"
            >
              ◀
            </button>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1 bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
            />
            <button
              onClick={() => shiftDate(1)}
              title="Next Day"
              className="px-2.5 py-1.5 text-gray-400 hover:text-white hover:bg-surface-800 rounded-lg text-xs transition-colors cursor-pointer"
            >
              ▶
            </button>
          </div>

          {!isToday && (
            <button
              onClick={() => setDate(getTodayString())}
              className="px-3 py-2 bg-surface-800 hover:bg-surface-700 text-brand-400 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Today
            </button>
          )}

          {/* Action Buttons */}
          <button
            onClick={() => {
              setTargetMealType('BREAKFAST');
              setIsAIModalOpen(true);
            }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            AI Estimate
          </button>

          <button
            onClick={() => {
              setTargetMealType('BREAKFAST');
              setIsLogModalOpen(true);
            }}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-600/20 transition-all cursor-pointer"
          >
            + Log Meal
          </button>
        </div>
      </div>

      {/* Macro Summary Cards with Progress Bars */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Daily Targets</h2>
            <span className="text-xs text-gray-500">
              {remainingCalories >= 0 ? `${remainingCalories} kcal remaining` : `${Math.abs(remainingCalories)} kcal over target`}
            </span>
          </div>
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold hover:underline cursor-pointer"
          >
            ⚙ Edit Targets
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Calories */}
          <div className="bg-surface-900 p-4 rounded-2xl border border-surface-800 space-y-2 hover:border-surface-700 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-400">Calories</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400 font-bold">
                {Math.round((totalCalories / goal.caloriesKcal) * 100)}%
              </span>
            </div>
            <p className="text-2xl font-extrabold text-white">
              {totalCalories} <span className="text-xs font-normal text-gray-400">/ {goal.caloriesKcal} kcal</span>
            </p>
            <div className="w-full bg-surface-950 h-2.5 rounded-full overflow-hidden border border-surface-800">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalCalories / goal.caloriesKcal) * 100)}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div className="bg-surface-900 p-4 rounded-2xl border border-surface-800 space-y-2 hover:border-surface-700 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-blue-400">Protein</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold">
                {Math.round((totalProtein / goal.proteinG) * 100)}%
              </span>
            </div>
            <p className="text-2xl font-extrabold text-white">
              {totalProtein}g <span className="text-xs font-normal text-gray-400">/ {goal.proteinG}g</span>
            </p>
            <div className="w-full bg-surface-950 h-2.5 rounded-full overflow-hidden border border-surface-800">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalProtein / goal.proteinG) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-surface-900 p-4 rounded-2xl border border-surface-800 space-y-2 hover:border-surface-700 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-emerald-400">Carbs</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                {Math.round((totalCarbs / goal.carbsG) * 100)}%
              </span>
            </div>
            <p className="text-2xl font-extrabold text-white">
              {totalCarbs}g <span className="text-xs font-normal text-gray-400">/ {goal.carbsG}g</span>
            </p>
            <div className="w-full bg-surface-950 h-2.5 rounded-full overflow-hidden border border-surface-800">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalCarbs / goal.carbsG) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="bg-surface-900 p-4 rounded-2xl border border-surface-800 space-y-2 hover:border-surface-700 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-amber-400">Fat</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold">
                {Math.round((totalFat / goal.fatG) * 100)}%
              </span>
            </div>
            <p className="text-2xl font-extrabold text-white">
              {totalFat}g <span className="text-xs font-normal text-gray-400">/ {goal.fatG}g</span>
            </p>
            <div className="w-full bg-surface-950 h-2.5 rounded-full overflow-hidden border border-surface-800">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalFat / goal.fatG) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Meals Breakdown List */}
      <div className="bg-surface-900 p-6 rounded-2xl border border-surface-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface-800 pb-4 gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Meals Breakdown</h2>
            <p className="text-xs text-gray-400 mt-0.5">Categorized food items consumed today</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Dietary Filter Buttons */}
            <div className="flex items-center gap-1 bg-surface-950 p-1 rounded-xl border border-surface-800">
              {(
                [
                  { id: 'ALL', label: 'All' },
                  { id: 'VEG', label: 'Veg', badge: 'VEG' },
                  { id: 'EGG', label: 'Egg', badge: 'EGG' },
                  { id: 'NON_VEG', label: 'Non-Veg', badge: 'NON_VEG' },
                ] as const
              ).map((f) => {
                const isActive = dietaryFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setDietaryFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-surface-800 text-white shadow-xs'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {'badge' in f && <DietaryBadge type={f.badge} size="sm" />}
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-3 py-1.5 rounded-full border border-brand-500/20">
              {totalCalories} kcal Total
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto" />
            <p className="text-xs text-gray-400">Loading meals for {date}...</p>
          </div>
        ) : (
          MEAL_TYPES.map(({ key, label, icon }) => {
            const matchingMeals = meals.filter(
              (m) => m.mealType === key || m.mealType === label.toUpperCase() || (key === 'SNACK' && m.mealType === 'SNACKS')
            );
            const allItems = matchingMeals.flatMap((m) =>
              m.items.map((it) => ({ ...it, mealId: m.id }))
            );

            const displayedItems = allItems.filter((item) => {
              if (dietaryFilter === 'ALL') return true;
              const itType = (item.dietaryType || 'VEG').toUpperCase();
              return itType === dietaryFilter;
            });

            const sectionCalories = Math.round(
              matchingMeals.reduce((sum, m) => sum + (Number(m.totals?.calories) || 0), 0)
            );
            const sectionProtein = Math.round(
              matchingMeals.reduce((sum, m) => sum + (Number(m.totals?.protein) || 0), 0)
            );
            const sectionCarbs = Math.round(
              matchingMeals.reduce((sum, m) => sum + (Number(m.totals?.carbs) || 0), 0)
            );
            const sectionFat = Math.round(
              matchingMeals.reduce((sum, m) => sum + (Number(m.totals?.fat) || 0), 0)
            );

            return (
              <div key={key} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-surface-800 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <h3 className="text-sm font-bold text-gray-200">{label}</h3>
                    {sectionCalories > 0 && (
                      <span className="text-xs font-semibold text-gray-400 ml-2">
                        {sectionCalories} kcal • {sectionProtein}g P • {sectionCarbs}g C • {sectionFat}g F
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setTargetMealType(key);
                        setIsAIModalOpen(true);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-medium flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>✨</span> AI Estimate
                    </button>
                    <button
                      onClick={() => {
                        setTargetMealType(key);
                        setIsLogModalOpen(true);
                      }}
                      className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>+</span> Add Food
                    </button>
                  </div>
                </div>

                {allItems.length === 0 ? (
                  <p className="text-xs text-gray-500 py-3 pl-2 italic">
                    No entries logged for {label.toLowerCase()} yet.
                  </p>
                ) : displayedItems.length === 0 ? (
                  <p className="text-xs text-gray-500 py-3 pl-2 italic">
                    No {dietaryFilter === 'NON_VEG' ? 'Non-Veg' : dietaryFilter === 'EGG' ? 'Egg-Veg' : 'Veg'} entries logged in {label.toLowerCase()}.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {displayedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-surface-950 p-3.5 rounded-xl border border-surface-800 hover:border-surface-700 transition-all group"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <DietaryBadge type={item.dietaryType} size="sm" />
                            <p className="text-xs font-semibold text-white">
                              {item.foodName}
                              {item.brand && (
                                <span className="text-[10px] text-gray-500 ml-1.5 font-normal">
                                  ({item.brand})
                                </span>
                              )}
                            </p>
                          </div>
                          <p className="text-[11px] text-gray-400 pl-5">
                            <span className="text-gray-300 font-medium">
                              {item.quantity} serving{item.quantity > 1 ? 's' : ''}
                            </span>{' '}
                            ({Math.round(item.servingSizeG * item.quantity)}g) •{' '}
                            <span className="text-blue-400">{Math.round(item.proteinG)}g P</span> •{' '}
                            <span className="text-emerald-400">{Math.round(item.carbsG)}g C</span> •{' '}
                            <span className="text-amber-400">{Math.round(item.fatG)}g F</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-white">
                            {Math.round(item.caloriesKcal)} kcal
                          </span>
                          <button
                            onClick={() => handleDeleteItem(item.mealId, item.id, item.foodName)}
                            title="Delete Item"
                            className="text-gray-500 hover:text-red-400 p-1 rounded-lg hover:bg-surface-800 transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Log Meal Modal */}
      <LogMealModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        defaultMealType={targetMealType}
        date={date}
        onMealLogged={fetchNutritionData}
      />

      {/* Nutrition Goal Modal */}
      <NutritionGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        currentGoal={goal}
        onGoalUpdated={fetchNutritionData}
      />

      {/* AI Photo Meal Estimation Modal */}
      <MealPhotoEstimate
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onAddToLog={handleAIAdd}
      />
    </div>
  );
};

export default NutritionPage;
