import React, { useState } from 'react';
import { MealPhotoEstimate } from './components/MealPhotoEstimate';

type Meal = { id: string; name: string; calories: number; protein: number; carbs: number; fat: number; type: string };

const NutritionPage: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [mealType, setMealType] = useState('Breakfast');
  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', name: 'Oatmeal', calories: 300, protein: 10, carbs: 50, fat: 5, type: 'Breakfast' },
  ]);

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

  const goalCalories = 2500;
  const goalProtein = 180;
  const goalCarbs = 250;
  const goalFat = 70;

  const handleAIAdd = (estimatedData: any) => {
    // Add estimated items to meals
    const newMeals = estimatedData.items.map((item: any, idx: number) => ({
      id: Date.now().toString() + idx,
      name: item.name,
      calories: item.calories,
      protein: estimatedData.macros.protein / estimatedData.items.length,
      carbs: estimatedData.macros.carbs / estimatedData.items.length,
      fat: estimatedData.macros.fat / estimatedData.items.length,
      type: mealType
    }));
    setMeals([...meals, ...newMeals]);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-3xl font-bold text-white">Nutrition</h1>
        <div className="flex items-center space-x-4">
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 bg-surface-900 border border-surface-800 rounded-lg text-white"
          />
          <button 
            onClick={() => setIsAIModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            AI Estimate
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold"
          >
            + Log Meal
          </button>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-900 p-4 rounded-xl border border-surface-800">
          <h3 className="text-gray-400 text-sm">Calories</h3>
          <p className="text-xl font-bold text-white">{totalCalories} / {goalCalories} kcal</p>
          <div className="w-full bg-surface-800 h-2 mt-2 rounded-full overflow-hidden">
            <div className="bg-brand-500 h-full" style={{ width: `${Math.min(100, (totalCalories / goalCalories) * 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-surface-900 p-4 rounded-xl border border-surface-800">
          <h3 className="text-gray-400 text-sm">Protein</h3>
          <p className="text-xl font-bold text-white">{totalProtein} / {goalProtein} g</p>
          <div className="w-full bg-surface-800 h-2 mt-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, (totalProtein / goalProtein) * 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-surface-900 p-4 rounded-xl border border-surface-800">
          <h3 className="text-gray-400 text-sm">Carbs</h3>
          <p className="text-xl font-bold text-white">{totalCarbs} / {goalCarbs} g</p>
          <div className="w-full bg-surface-800 h-2 mt-2 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full" style={{ width: `${Math.min(100, (totalCarbs / goalCarbs) * 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-surface-900 p-4 rounded-xl border border-surface-800">
          <h3 className="text-gray-400 text-sm">Fat</h3>
          <p className="text-xl font-bold text-white">{totalFat} / {goalFat} g</p>
          <div className="w-full bg-surface-800 h-2 mt-2 rounded-full overflow-hidden">
            <div className="bg-yellow-500 h-full" style={{ width: `${Math.min(100, (totalFat / goalFat) * 100)}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-surface-900 p-6 rounded-xl border border-surface-800">
        <h2 className="text-xl font-bold text-white mb-6">Meals Breakdown</h2>
        {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(type => {
          const typeMeals = meals.filter(m => m.type === type);
          return (
            <div key={type} className="mb-6 last:mb-0">
              <div className="flex justify-between items-center border-b border-surface-800 pb-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-200">{type}</h3>
                <div className="space-x-3">
                  <button 
                    onClick={() => { setMealType(type); setIsAIModalOpen(true); }}
                    className="text-indigo-400 text-sm hover:underline"
                  >
                    AI Estimate
                  </button>
                  <button 
                    onClick={() => { setMealType(type); setIsModalOpen(true); }}
                    className="text-brand-500 text-sm hover:underline"
                  >
                    + Add
                  </button>
                </div>
              </div>
              {typeMeals.length === 0 ? (
                <p className="text-sm text-gray-500">No entries yet.</p>
              ) : (
                <ul className="space-y-3">
                  {typeMeals.map(meal => (
                    <li key={meal.id} className="flex justify-between items-center bg-surface-950 p-3 rounded-lg border border-surface-800">
                      <div>
                        <p className="text-white font-medium">{meal.name}</p>
                        <p className="text-xs text-gray-400">{Math.round(meal.protein)}g P • {Math.round(meal.carbs)}g C • {Math.round(meal.fat)}g F</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{Math.round(meal.calories)} kcal</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-900 rounded-xl max-w-md w-full border border-surface-800 overflow-hidden">
            <div className="p-4 border-b border-surface-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Log {mealType}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <input type="text" placeholder="Search food..." className="w-full px-4 py-2 bg-surface-950 border border-surface-800 rounded-lg text-white focus:ring-2 focus:ring-brand-500" />
              <div className="text-center py-8 text-gray-400 text-sm">
                Search for a food or create a custom entry.
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <MealPhotoEstimate 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        onAddToLog={handleAIAdd} 
      />
    </div>
  );
};

export default NutritionPage;
