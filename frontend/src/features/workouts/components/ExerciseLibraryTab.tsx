import React, { useState, useEffect } from 'react';
import { workoutApi } from '../../../api/workout.api';

export interface Exercise {
  id: string;
  name: string;
  category?: string;
  equipment?: string;
  instructions?: string;
  isCustom?: boolean;
}

interface Props {
  onSelectForActiveSession?: (exercise: Exercise) => void;
}

export const ExerciseLibraryTab: React.FC<Props> = ({ onSelectForActiveSession }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('BARBELL');
  const [newEquipment, setNewEquipment] = useState<string>('BARBELL');
  const [newInstructions, setNewInstructions] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await workoutApi.getExercises({
        search: search || undefined,
        category: categoryFilter || undefined,
      });
      const items = res.data.content || res.data || [];
      setExercises(items);
    } catch (err: any) {
      console.error('Failed to fetch exercises:', err);
      setError('Could not load exercise library. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [search, categoryFilter]);

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    try {
      await workoutApi.createCustomExercise({
        name: newName,
        category: newCategory,
        equipment: newEquipment,
        instructions: newInstructions,
        isCustom: true,
      });
      setIsModalOpen(false);
      setNewName('');
      setNewInstructions('');
      fetchExercises();
    } catch (err: any) {
      console.error('Failed to create custom exercise:', err);
      alert('Failed to save custom exercise.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="Search exercises by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-md px-4 py-2.5 bg-surface-950 border border-surface-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-surface-950 border border-surface-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Categories</option>
            <option value="BARBELL">Barbell</option>
            <option value="DUMBBELL">Dumbbell</option>
            <option value="MACHINE">Machine</option>
            <option value="BODYWEIGHT">Bodyweight</option>
            <option value="CABLE">Cable</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/20 transition-all cursor-pointer whitespace-nowrap"
        >
          + Custom Exercise
        </button>
      </div>

      {/* Error / Loading State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
          <p className="text-xs text-gray-400">Loading exercise library...</p>
        </div>
      ) : exercises.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-surface-950 rounded-2xl border border-surface-800">
          <span className="text-3xl">🏋️‍♂️</span>
          <p className="text-sm font-medium text-gray-300">No exercises found</p>
          <p className="text-xs text-gray-500">
            Try adjusting your search query or add a custom exercise.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="bg-surface-950 p-4 rounded-xl border border-surface-800 hover:border-surface-700 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-white text-base group-hover:text-brand-400 transition-colors">
                    {ex.name}
                  </h4>
                  {ex.isCustom && (
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold rounded-full border border-indigo-500/30 shrink-0">
                      Custom
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {ex.category && (
                    <span className="px-2 py-0.5 bg-surface-900 text-gray-300 text-[11px] font-medium rounded-md border border-surface-800">
                      {ex.category}
                    </span>
                  )}
                  {ex.equipment && (
                    <span className="px-2 py-0.5 bg-surface-900 text-gray-400 text-[11px] rounded-md border border-surface-800">
                      {ex.equipment}
                    </span>
                  )}
                </div>
                {ex.instructions && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{ex.instructions}</p>
                )}
              </div>

              {onSelectForActiveSession && (
                <button
                  onClick={() => onSelectForActiveSession(ex)}
                  className="w-full py-2 bg-surface-900 hover:bg-brand-600 text-gray-300 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer border border-surface-800 hover:border-brand-500"
                >
                  + Add to Active Session
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal to Create Custom Exercise */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3.5 right-3.5 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-white">Create Custom Exercise</h3>

            <form onSubmit={handleCreateExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Cable Flyes"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-surface-950 border border-surface-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
                  >
                    <option value="BARBELL">Barbell</option>
                    <option value="DUMBBELL">Dumbbell</option>
                    <option value="MACHINE">Machine</option>
                    <option value="BODYWEIGHT">Bodyweight</option>
                    <option value="CABLE">Cable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Equipment
                  </label>
                  <select
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                    className="w-full bg-surface-950 border border-surface-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
                  >
                    <option value="BARBELL">Barbell</option>
                    <option value="DUMBBELL">Dumbbell</option>
                    <option value="BENCH">Bench</option>
                    <option value="CABLE">Cable</option>
                    <option value="NONE">None</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Instructions / Tips
                </label>
                <textarea
                  rows={3}
                  placeholder="Form guidance or setup notes..."
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
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
                  {creating ? 'Saving...' : 'Save Exercise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
