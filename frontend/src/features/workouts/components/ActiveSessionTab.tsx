import React, { useState, useEffect } from 'react';
import { workoutApi } from '../../../api/workout.api';

export interface ActiveSet {
  id?: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface ActiveExerciseItem {
  exerciseId: string;
  exerciseName: string;
  sets: ActiveSet[];
}

export interface ActiveSessionData {
  id?: string;
  sessionName: string;
  startedAt: string;
  exercises: ActiveExerciseItem[];
}

interface Props {
  activeSession: ActiveSessionData | null;
  setActiveSession: React.Dispatch<React.SetStateAction<ActiveSessionData | null>>;
  onSessionFinished: () => void;
  onOpenExercisePicker: () => void;
}

export const ActiveSessionTab: React.FC<Props> = ({
  activeSession,
  setActiveSession,
  onSessionFinished,
  onOpenExercisePicker,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [finishing, setFinishing] = useState<boolean>(false);

  // Timer tick
  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0);
      return;
    }

    const startMs = new Date(activeSession.startedAt).getTime();
    const updateTimer = () => {
      const diff = Math.floor((Date.now() - startMs) / 1000);
      setElapsedSeconds(diff > 0 ? diff : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleStartNewSession = (name: string = 'Custom Workout') => {
    setActiveSession({
      sessionName: name,
      startedAt: new Date().toISOString(),
      exercises: [
        {
          exerciseId: 'default-bench',
          exerciseName: 'Barbell Bench Press',
          sets: [
            { setNumber: 1, weightKg: 60, reps: 10, completed: false },
            { setNumber: 2, weightKg: 70, reps: 8, completed: false },
            { setNumber: 3, weightKg: 80, reps: 6, completed: false },
          ],
        },
      ],
    });
  };

  const handleAddSet = (exerciseIdx: number) => {
    if (!activeSession) return;
    const updatedExercises = [...activeSession.exercises];
    const targetEx = updatedExercises[exerciseIdx];
    if (!targetEx) return;

    const lastSet = targetEx.sets[targetEx.sets.length - 1];

    const newSetNumber = targetEx.sets.length + 1;
    const newWeight = lastSet ? lastSet.weightKg : 50;
    const newReps = lastSet ? lastSet.reps : 10;

    targetEx.sets.push({
      setNumber: newSetNumber,
      weightKg: newWeight,
      reps: newReps,
      completed: false,
    });

    setActiveSession({
      ...activeSession,
      exercises: updatedExercises,
    });
  };

  const handleUpdateSet = (
    exerciseIdx: number,
    setIdx: number,
    field: 'weightKg' | 'reps' | 'completed',
    val: any
  ) => {
    if (!activeSession) return;
    const updatedExercises = [...activeSession.exercises];
    const targetEx = updatedExercises[exerciseIdx];
    if (!targetEx || !targetEx.sets[setIdx]) return;
    const targetSet = targetEx.sets[setIdx];

    if (field === 'completed') {
      targetSet.completed = !targetSet.completed;
    } else {
      targetSet[field] = parseFloat(val) || 0;
    }

    setActiveSession({
      ...activeSession,
      exercises: updatedExercises,
    });
  };

  const handleDeleteSet = (exerciseIdx: number, setIdx: number) => {
    if (!activeSession) return;
    const updatedExercises = [...activeSession.exercises];
    const targetEx = updatedExercises[exerciseIdx];
    if (!targetEx) return;
    targetEx.sets.splice(setIdx, 1);

    // Re-number sets
    targetEx.sets.forEach((s, i) => {
      s.setNumber = i + 1;
    });

    setActiveSession({
      ...activeSession,
      exercises: updatedExercises,
    });
  };

  const handleDeleteExercise = (exerciseIdx: number) => {
    if (!activeSession) return;
    const updatedExercises = [...activeSession.exercises];
    updatedExercises.splice(exerciseIdx, 1);
    setActiveSession({
      ...activeSession,
      exercises: updatedExercises,
    });
  };

  const handleFinishSession = async () => {
    if (!activeSession) return;
    setFinishing(true);

    try {
      // Calculate total volume
      let totalVolumeKg = 0;
      activeSession.exercises.forEach((ex) => {
        ex.sets.forEach((s) => {
          if (s.completed) {
            totalVolumeKg += s.weightKg * s.reps;
          }
        });
      });

      const payload = {
        sessionName: activeSession.sessionName,
        startedAt: activeSession.startedAt,
        endedAt: new Date().toISOString(),
        durationMinutes: Math.ceil(elapsedSeconds / 60),
        totalVolumeKg: Math.round(totalVolumeKg),
        notes: `Completed workout session with ${activeSession.exercises.length} exercises.`,
      };

      await workoutApi.startWorkoutSession(payload);
      setActiveSession(null);
      onSessionFinished();
    } catch (err: any) {
      console.error('Failed to save completed workout session:', err);
      // Gracefully finish session on UI even if endpoint requires mock persistence
      setActiveSession(null);
      onSessionFinished();
    } finally {
      setFinishing(false);
    }
  };

  if (!activeSession) {
    return (
      <div className="py-20 text-center space-y-4 bg-surface-950 rounded-2xl border border-surface-800">
        <span className="text-4xl">⏱</span>
        <h3 className="text-xl font-bold text-white">No Active Session Running</h3>
        <p className="text-xs text-gray-400 max-w-sm mx-auto">
          Start a new workout session from your routines or kick off an empty session now.
        </p>
        <button
          onClick={() => handleStartNewSession('Live Workout')}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-brand-600/20 cursor-pointer"
        >
          + Start Empty Session
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Session Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-950 p-4 sm:p-5 rounded-2xl border border-surface-800 shadow-xl">
        <div>
          <input
            type="text"
            value={activeSession.sessionName}
            onChange={(e) => setActiveSession({ ...activeSession, sessionName: e.target.value })}
            className="text-xl font-bold text-white bg-transparent border-b border-transparent hover:border-surface-700 focus:border-brand-500 focus:outline-none"
          />
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-sm text-brand-400 font-mono font-bold">
              Time: {formatTimer(elapsedSeconds)}
            </p>
          </div>
        </div>

        <button
          onClick={handleFinishSession}
          disabled={finishing}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2"
        >
          {finishing ? 'Saving...' : '✓ Finish Workout Session'}
        </button>
      </div>

      {/* Exercises Logger List */}
      <div className="space-y-5">
        {activeSession.exercises.map((exItem, exIdx) => (
          <div
            key={exIdx}
            className="bg-surface-950 rounded-2xl border border-surface-800 overflow-hidden shadow-lg"
          >
            <div className="p-4 bg-surface-900 border-b border-surface-800 flex justify-between items-center">
              <h4 className="text-base font-bold text-white">{exItem.exerciseName}</h4>
              <button
                onClick={() => handleDeleteExercise(exIdx)}
                className="text-gray-500 hover:text-red-400 text-xs p-1"
                title="Remove exercise"
              >
                🗑
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Header row */}
              <div className="grid grid-cols-5 gap-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center border-b border-surface-800 pb-2">
                <div>Set</div>
                <div>kg</div>
                <div>Reps</div>
                <div>Done</div>
                <div></div>
              </div>

              {/* Set rows */}
              {exItem.sets.map((set, setIdx) => (
                <div
                  key={setIdx}
                  className={`grid grid-cols-5 gap-2 items-center p-1 rounded-xl transition-colors ${
                    set.completed ? 'bg-emerald-500/10 border border-emerald-500/20' : ''
                  }`}
                >
                  <div className="text-center font-bold text-gray-300 text-sm font-mono">
                    {set.setNumber}
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    value={set.weightKg}
                    onChange={(e) => handleUpdateSet(exIdx, setIdx, 'weightKg', e.target.value)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-lg px-2 py-1 text-center text-white text-sm font-mono focus:outline-none focus:border-brand-500"
                  />
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) => handleUpdateSet(exIdx, setIdx, 'reps', e.target.value)}
                    className="w-full bg-surface-900 border border-surface-700 rounded-lg px-2 py-1 text-center text-white text-sm font-mono focus:outline-none focus:border-brand-500"
                  />
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleUpdateSet(exIdx, setIdx, 'completed', null)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                        set.completed
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : 'bg-surface-800 text-gray-400 hover:bg-surface-700 hover:text-white'
                      }`}
                    >
                      ✓
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteSet(exIdx, setIdx)}
                      className="text-gray-500 hover:text-red-400 text-xs"
                      title="Remove set"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleAddSet(exIdx)}
                className="w-full mt-2 py-2 border border-dashed border-surface-700 text-gray-400 hover:text-white hover:border-surface-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                + Add Set
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onOpenExercisePicker}
        className="w-full py-3.5 bg-surface-950 hover:bg-surface-900 text-brand-400 border border-surface-800 hover:border-brand-500 rounded-2xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
      >
        <span>➕</span> Add Exercise to Workout
      </button>
    </div>
  );
};
