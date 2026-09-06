import React, { useState, useEffect } from 'react';
import { nutritionApi } from '../../../api/nutrition.api';
import { toast } from '../../../stores/toastStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: {
    caloriesKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  onGoalUpdated: () => void;
}

export const NutritionGoalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentGoal,
  onGoalUpdated,
}) => {
  const [calories, setCalories] = useState<number>(currentGoal.caloriesKcal || 2200);
  const [protein, setProtein] = useState<number>(currentGoal.proteinG || 160);
  const [carbs, setCarbs] = useState<number>(currentGoal.carbsG || 220);
  const [fat, setFat] = useState<number>(currentGoal.fatG || 65);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCalories(currentGoal.caloriesKcal || 2200);
      setProtein(currentGoal.proteinG || 160);
      setCarbs(currentGoal.carbsG || 220);
      setFat(currentGoal.fatG || 65);
    }
  }, [isOpen, currentGoal]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: 'balanced' | 'high-protein' | 'keto') => {
    if (preset === 'balanced') {
      setProtein(Math.round((calories * 0.25) / 4));
      setCarbs(Math.round((calories * 0.5) / 4));
      setFat(Math.round((calories * 0.25) / 9));
    } else if (preset === 'high-protein') {
      setProtein(Math.round((calories * 0.35) / 4));
      setCarbs(Math.round((calories * 0.4) / 4));
      setFat(Math.round((calories * 0.25) / 9));
    } else if (preset === 'keto') {
      setProtein(Math.round((calories * 0.25) / 4));
      setCarbs(Math.round((calories * 0.05) / 4));
      setFat(Math.round((calories * 0.7) / 9));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await nutritionApi.setGoal({
        caloriesKcal: calories,
        proteinG: protein,
        carbsG: carbs,
        fatG: fat,
      });
      toast.success('Daily nutrition targets updated!', 'Goals Saved');
      onGoalUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to save nutrition goal:', err);
      toast.error('Failed to update nutrition goal.', 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-surface-900 border border-surface-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-surface-800 flex justify-between items-center bg-surface-950/50">
          <div>
            <h3 className="text-lg font-bold text-white">Daily Nutrition Goals</h3>
            <p className="text-xs text-gray-400 mt-0.5">Customize your daily calories and macro targets</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-surface-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
              Target Calories (kcal)
            </label>
            <input
              type="number"
              required
              min="800"
              max="10000"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface-950 border border-surface-700 text-white rounded-xl text-sm focus:outline-none focus:border-brand-500 font-bold"
            />
          </div>

          <div>
            <span className="text-[11px] text-gray-400 mb-1.5 block">Quick Macro Splits:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('high-protein')}
                className="flex-1 py-1 bg-surface-800 hover:bg-surface-700 text-blue-400 text-xs rounded-lg font-medium border border-surface-700"
              >
                High Protein
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('balanced')}
                className="flex-1 py-1 bg-surface-800 hover:bg-surface-700 text-emerald-400 text-xs rounded-lg font-medium border border-surface-700"
              >
                Balanced
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('keto')}
                className="flex-1 py-1 bg-surface-800 hover:bg-surface-700 text-amber-400 text-xs rounded-lg font-medium border border-surface-700"
              >
                Low Carb
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-blue-400 uppercase mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                required
                min="0"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className="w-full px-3 py-2 bg-surface-950 border border-surface-700 text-white rounded-xl text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 uppercase mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                required
                min="0"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                className="w-full px-3 py-2 bg-surface-950 border border-surface-700 text-white rounded-xl text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-amber-400 uppercase mb-1">
                Fat (g)
              </label>
              <input
                type="number"
                required
                min="0"
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                className="w-full px-3 py-2 bg-surface-950 border border-surface-700 text-white rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-surface-950 rounded-xl border border-surface-800 text-[11px] text-gray-400 flex justify-between">
            <span>Macro sum:</span>
            <span className="font-semibold text-white">
              {protein * 4 + carbs * 4 + fat * 9} kcal total
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-gray-300 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/20"
            >
              {saving ? 'Saving...' : 'Save Goals'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
