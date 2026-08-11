import React, { useState, useEffect } from 'react';
import { workoutApi } from '../../../api/workout.api';

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  targetFrequencyDays?: number;
  active?: boolean;
  days?: Array<{
    id?: string;
    dayName: string;
    dayNumber: number;
    exercises?: Array<{
      exerciseId: string;
      exerciseName?: string;
      targetSets?: number;
      targetRepsMin?: number;
      targetRepsMax?: number;
    }>;
  }>;
}

interface Props {
  onStartPlanSession: (plan: WorkoutPlan) => void;
}

export const WorkoutPlansTab: React.FC<Props> = ({ onStartPlanSession }) => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [targetFrequencyDays, setTargetFrequencyDays] = useState<number>(4);
  const [creating, setCreating] = useState<boolean>(false);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await workoutApi.getWorkoutPlans();
      const items = res.data.content || res.data || [];
      setPlans(items);
    } catch (err: any) {
      console.error('Failed to fetch workout plans:', err);
      setError('Could not load workout plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      await workoutApi.createWorkoutPlan({
        name,
        description,
        targetFrequencyDays,
        active: true,
      });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      fetchPlans();
    } catch (err: any) {
      console.error('Failed to create plan:', err);
      alert('Failed to save workout plan.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout plan?')) return;
    try {
      await workoutApi.deleteWorkoutPlan(id);
      fetchPlans();
    } catch (err: any) {
      console.error('Failed to delete plan:', err);
      alert('Failed to delete workout plan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center border-b border-surface-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Your Workout Routines</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Organize training splits, target rep ranges, and frequency schedules
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/20 transition-all cursor-pointer"
        >
          + New Plan
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
          <p className="text-xs text-gray-400">Loading workout plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-surface-950 rounded-2xl border border-surface-800">
          <span className="text-3xl">📋</span>
          <p className="text-sm font-medium text-gray-300">No workout plans created yet</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Create your first routine split (e.g. Push Pull Legs, Upper Lower) to kick off your sessions.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 px-4 py-2 bg-surface-900 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl border border-surface-700 hover:border-brand-500 transition-all cursor-pointer"
          >
            Create Workout Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-surface-950 p-5 rounded-2xl border border-surface-800 hover:border-surface-700 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
                    {plan.name}
                  </h4>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-gray-500 hover:text-red-400 text-xs p-1"
                    title="Delete plan"
                  >
                    🗑
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  {plan.description || 'Custom workout routine split'}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="px-2.5 py-1 bg-surface-900 text-gray-300 text-[11px] font-medium rounded-lg border border-surface-800">
                    ⏱ {plan.targetFrequencyDays || 4} days/week
                  </span>
                  {plan.active && (
                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-medium rounded-lg border border-emerald-500/30">
                      Active
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onStartPlanSession(plan)}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>▶</span> Start Session from Plan
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-white">Create Workout Plan</h3>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Push Pull Legs 6-Day Split"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Target Days Per Week
                </label>
                <select
                  value={targetFrequencyDays}
                  onChange={(e) => setTargetFrequencyDays(parseInt(e.target.value))}
                  className="w-full bg-surface-950 border border-surface-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
                >
                  <option value={2}>2 Days / Week</option>
                  <option value={3}>3 Days / Week</option>
                  <option value={4}>4 Days / Week</option>
                  <option value={5}>5 Days / Week</option>
                  <option value={6}>6 Days / Week</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Description / Focus
                </label>
                <textarea
                  rows={3}
                  placeholder="Hypertrophy focused split with progressive overload..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={creating}
                  className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-gray-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/20 disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
