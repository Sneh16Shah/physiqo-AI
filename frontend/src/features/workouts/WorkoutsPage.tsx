import React, { useState } from 'react';
import { WorkoutPlansTab, WorkoutPlan } from './components/WorkoutPlansTab';
import { ActiveSessionTab, ActiveSessionData } from './components/ActiveSessionTab';
import { WorkoutHistoryTab } from './components/WorkoutHistoryTab';
import { ExerciseLibraryTab, Exercise } from './components/ExerciseLibraryTab';

const WorkoutsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'active' | 'history' | 'library'>('plans');
  const [activeSession, setActiveSession] = useState<ActiveSessionData | null>(null);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState<boolean>(false);

  const handleStartPlanSession = (plan: WorkoutPlan) => {
    setActiveSession({
      sessionName: `${plan.name} Session`,
      startedAt: new Date().toISOString(),
      exercises: [
        {
          exerciseId: 'plan-ex-1',
          exerciseName: 'Barbell Bench Press',
          sets: [
            { setNumber: 1, weightKg: 70, reps: 10, completed: false },
            { setNumber: 2, weightKg: 75, reps: 8, completed: false },
            { setNumber: 3, weightKg: 80, reps: 6, completed: false },
          ],
        },
        {
          exerciseId: 'plan-ex-2',
          exerciseName: 'Incline Dumbbell Press',
          sets: [
            { setNumber: 1, weightKg: 24, reps: 10, completed: false },
            { setNumber: 2, weightKg: 28, reps: 8, completed: false },
          ],
        },
      ],
    });
    setActiveTab('active');
  };

  const handleAddExerciseToActiveSession = (exercise: Exercise) => {
    if (!activeSession) {
      setActiveSession({
        sessionName: 'Live Workout',
        startedAt: new Date().toISOString(),
        exercises: [
          {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: [{ setNumber: 1, weightKg: 50, reps: 10, completed: false }],
          },
        ],
      });
    } else {
      setActiveSession({
        ...activeSession,
        exercises: [
          ...activeSession.exercises,
          {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: [{ setNumber: 1, weightKg: 50, reps: 10, completed: false }],
          },
        ],
      });
    }
    setIsExercisePickerOpen(false);
    setActiveTab('active');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Workout Tracker</h1>
          <p className="text-xs text-gray-400 mt-1">
            Build workout routines, track live sets, and review historical performance
          </p>
        </div>

        <button
          onClick={() => {
            if (!activeSession) {
              setActiveSession({
                sessionName: 'Live Workout',
                startedAt: new Date().toISOString(),
                exercises: [
                  {
                    exerciseId: 'default-ex',
                    exerciseName: 'Barbell Squat',
                    sets: [{ setNumber: 1, weightKg: 80, reps: 8, completed: false }],
                  },
                ],
              });
            }
            setActiveTab('active');
          }}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-600/20 cursor-pointer"
        >
          {activeSession ? '▶ View Active Session' : '+ Start Quick Session'}
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex space-x-2 border-b border-surface-800 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 font-semibold text-xs rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-surface-800 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📋 Workout Plans
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-semibold text-xs rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-brand-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>⏱ Active Session</span>
          {activeSession && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-semibold text-xs rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-surface-800 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📜 History
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 font-semibold text-xs rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'library'
              ? 'bg-surface-800 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🏋️‍♂️ Exercise Library
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="bg-surface-900 p-5 sm:p-6 rounded-2xl border border-surface-800 min-h-[500px] shadow-2xl">
        {activeTab === 'plans' && (
          <WorkoutPlansTab onStartPlanSession={handleStartPlanSession} />
        )}

        {activeTab === 'active' && (
          <ActiveSessionTab
            activeSession={activeSession}
            setActiveSession={setActiveSession}
            onSessionFinished={() => setActiveTab('history')}
            onOpenExercisePicker={() => setIsExercisePickerOpen(true)}
          />
        )}

        {activeTab === 'history' && <WorkoutHistoryTab />}

        {activeTab === 'library' && (
          <ExerciseLibraryTab
            onSelectForActiveSession={handleAddExerciseToActiveSession}
          />
        )}
      </div>

      {/* Modal Exercise Picker for Active Session */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsExercisePickerOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white">Select Exercise to Add</h3>
            <div className="flex-1 overflow-y-auto pr-1">
              <ExerciseLibraryTab
                onSelectForActiveSession={handleAddExerciseToActiveSession}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutsPage;
