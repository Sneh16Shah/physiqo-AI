import React, { useState, useEffect } from 'react';
import { nutritionApi } from '../../../api/nutrition.api';
import { toast } from '../../../stores/toastStore';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSizeG: number;
  servingLabel?: string;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType: string;
  date: string;
  onMealLogged: () => void;
}

export const LogMealModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultMealType,
  date,
  onMealLogged,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');
  const [mealType, setMealType] = useState(defaultMealType.toUpperCase());
  
  // Search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  // Custom food state
  const [customName, setCustomName] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customServingG, setCustomServingG] = useState(100);
  const [customServingLabel, setCustomServingLabel] = useState('100g');
  const [customCalories, setCustomCalories] = useState<number | ''>('');
  const [customProtein, setCustomProtein] = useState<number | ''>('');
  const [customCarbs, setCustomCarbs] = useState<number | ''>('');
  const [customFat, setCustomFat] = useState<number | ''>('');

  useEffect(() => {
    setMealType(defaultMealType.toUpperCase());
  }, [defaultMealType]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedFood(null);
      setQuantity(1);
      return;
    }

    const fetchInitialFoods = async () => {
      setSearching(true);
      try {
        const res = await nutritionApi.getFoods({ search: searchQuery.trim() || undefined, size: 20 });
        const items = res.data.content || res.data || [];
        setSearchResults(items);
        if (!selectedFood && items.length > 0) {
          setSelectedFood(items[0]);
        }
      } catch (err) {
        console.error('Failed to load foods:', err);
      } finally {
        setSearching(false);
      }
    };

    const timer = setTimeout(fetchInitialFoods, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  if (!isOpen) return null;

  const handleAddSearchMeal = async () => {
    if (!selectedFood) return;
    setSubmitting(true);
    try {
      await nutritionApi.createMeal({
        mealType: mealType,
        mealDate: date,
        items: [
          {
            foodId: selectedFood.id,
            quantity: quantity,
          },
        ],
      });
      toast.success(`Added ${selectedFood.name} to ${mealType.toLowerCase()}`, 'Meal Logged');
      onMealLogged();
      onClose();
    } catch (err: any) {
      console.error('Failed to log meal:', err);
      toast.error('Failed to log meal. Please try again.', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCustomMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || customCalories === '') {
      toast.error('Please enter food name and calories.', 'Missing Fields');
      return;
    }
    setSubmitting(true);
    try {
      const foodRes = await nutritionApi.createCustomFood({
        name: customName.trim(),
        brand: customBrand.trim() || undefined,
        servingSizeG: customServingG || 100,
        servingLabel: customServingLabel.trim() || `${customServingG}g`,
        caloriesKcal: Number(customCalories),
        proteinG: Number(customProtein) || 0,
        carbsG: Number(customCarbs) || 0,
        fatG: Number(customFat) || 0,
        custom: true,
      });

      const newFood = foodRes.data;
      await nutritionApi.createMeal({
        mealType: mealType,
        mealDate: date,
        items: [
          {
            foodId: newFood.id,
            quantity: 1,
          },
        ],
      });

      toast.success(`Logged ${customName} for ${mealType.toLowerCase()}`, 'Meal Logged');
      onMealLogged();
      onClose();
    } catch (err) {
      console.error('Failed to create and log custom food:', err);
      toast.error('Failed to save food. Please check the values.', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-surface-900 border border-surface-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-surface-800 flex justify-between items-center bg-surface-950/50">
          <div>
            <h3 className="text-lg font-bold text-white">Log Meal</h3>
            <p className="text-xs text-gray-400 mt-0.5">Record food intake for {date}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-surface-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Meal Type Selector & Tabs */}
        <div className="p-5 pb-0 space-y-4">
          <div className="flex gap-2 p-1 bg-surface-950 rounded-xl border border-surface-800">
            {['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMealType(type)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  mealType === type
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {type === 'SNACK' ? 'Snacks' : type.toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex border-b border-surface-800">
            <button
              onClick={() => setActiveTab('search')}
              className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'search'
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Search Food Library
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'custom'
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              + Add Custom Food
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'search' ? (
            <>
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chicken, oats, eggs, rice..."
                  className="w-full pl-9 pr-4 py-2.5 bg-surface-950 border border-surface-700 text-white rounded-xl text-xs focus:outline-none focus:border-brand-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-500 text-xs">🔍</span>
              </div>

              {/* Search Results List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {searching ? (
                  <div className="py-8 text-center text-xs text-gray-500">Searching food library...</div>
                ) : searchResults.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No foods found. Try a different query or use the "+ Add Custom Food" tab.
                  </div>
                ) : (
                  searchResults.map((food) => {
                    const isSelected = selectedFood?.id === food.id;
                    return (
                      <div
                        key={food.id}
                        onClick={() => setSelectedFood(food)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-brand-600/15 border-brand-500'
                            : 'bg-surface-950/60 border-surface-800 hover:border-surface-700'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold text-white">{food.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {food.servingLabel || `${food.servingSizeG}g`} • {food.proteinG}g P • {food.carbsG}g C • {food.fatG}g F
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-brand-400">
                            {food.caloriesKcal} kcal
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quantity Selector & Summary preview */}
              {selectedFood && (
                <div className="p-4 bg-surface-950 rounded-xl border border-surface-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-semibold text-gray-200">Quantity / Servings</p>
                      <p className="text-[10px] text-gray-500">
                        1 serving = {selectedFood.servingLabel || `${selectedFood.servingSizeG}g`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.max(0.25, parseFloat((prev - 0.25).toFixed(2))))}
                        className="w-7 h-7 bg-surface-800 hover:bg-surface-700 text-white rounded-lg flex items-center justify-center text-xs font-bold"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="0.25"
                        min="0.1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
                        className="w-14 text-center py-1 bg-surface-900 border border-surface-700 text-white text-xs rounded-lg focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => parseFloat((prev + 0.25).toFixed(2)))}
                        className="w-7 h-7 bg-surface-800 hover:bg-surface-700 text-white rounded-lg flex items-center justify-center text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-surface-850 text-center">
                    <div>
                      <span className="text-[10px] text-gray-400">Calories</span>
                      <p className="text-xs font-bold text-white">
                        {Math.round(selectedFood.caloriesKcal * quantity)} kcal
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400">Protein</span>
                      <p className="text-xs font-bold text-blue-400">
                        {(selectedFood.proteinG * quantity).toFixed(1)}g
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400">Carbs</span>
                      <p className="text-xs font-bold text-emerald-400">
                        {(selectedFood.carbsG * quantity).toFixed(1)}g
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400">Fat</span>
                      <p className="text-xs font-bold text-amber-400">
                        {(selectedFood.fatG * quantity).toFixed(1)}g
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Custom Food Form */
            <form id="custom-food-form" onSubmit={handleAddCustomMeal} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                  Food Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Homemade Protein Smoothie"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-950 border border-surface-700 text-white rounded-xl text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                    Brand (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Homemade"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-950 border border-surface-700 text-white rounded-xl text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                    Serving (g)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={customServingG}
                    onChange={(e) => setCustomServingG(Number(e.target.value) || 100)}
                    className="w-full px-3 py-2 bg-surface-950 border border-surface-700 text-white rounded-xl text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                    Serving Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 1 bowl"
                    value={customServingLabel}
                    onChange={(e) => setCustomServingLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-950 border border-surface-700 text-white rounded-xl text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 uppercase mb-1">
                    Calories *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="kcal"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-surface-950 border border-surface-700 text-white rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 uppercase mb-1">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="g"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-surface-950 border border-surface-700 text-white rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 uppercase mb-1">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="g"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-surface-950 border border-surface-700 text-white rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-300 uppercase mb-1">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="g"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-surface-950 border border-surface-700 text-white rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-surface-800 bg-surface-950 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-gray-300 text-xs font-semibold rounded-xl transition-all"
          >
            Cancel
          </button>
          {activeTab === 'search' ? (
            <button
              type="button"
              disabled={!selectedFood || submitting}
              onClick={handleAddSearchMeal}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/20 transition-all cursor-pointer"
            >
              {submitting ? 'Adding...' : `Add to ${mealType.toLowerCase()}`}
            </button>
          ) : (
            <button
              type="submit"
              form="custom-food-form"
              disabled={submitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/20 transition-all cursor-pointer"
            >
              {submitting ? 'Saving...' : `Save & Log Food`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
