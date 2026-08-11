import React, { useState, useEffect } from 'react';
import { workoutApi } from '../../../api/workout.api';

export interface CompletedSession {
  id: string;
  sessionName?: string;
  startedAt?: string;
  endedAt?: string;
  durationMinutes?: number;
  totalVolumeKg?: number;
  notes?: string;
}

export const WorkoutHistoryTab: React.FC = () => {
  const [sessions, setSessions] = useState<CompletedSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await workoutApi.getWorkoutSessions();
      const items = res.data.content || res.data || [];
      setSessions(items);
    } catch (err: any) {
      console.error('Failed to fetch workout history:', err);
      setError('Could not load workout history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Are you sure you want to delete this completed workout session record?')) return;
    try {
      await workoutApi.deleteSession(id);
      fetchHistory();
    } catch (err: any) {
      console.error('Failed to delete session:', err);
      alert('Failed to delete workout session record.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-surface-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Workout Session History</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Review completed training sessions, duration, and total volume metrics
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
          <p className="text-xs text-gray-400">Loading workout history...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-surface-950 rounded-2xl border border-surface-800">
          <span className="text-3xl">📜</span>
          <p className="text-sm font-medium text-gray-300">No workout history logged yet</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Complete your active workout sessions to build up your training history timeline.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((sess) => {
            const dateStr = sess.startedAt
              ? new Date(sess.startedAt).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recorded Session';

            return (
              <div
                key={sess.id}
                className="bg-surface-950 p-5 rounded-2xl border border-surface-800 hover:border-surface-700 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-bold text-white group-hover:text-brand-400 transition-colors">
                      {sess.sessionName || 'Workout Session'}
                    </h4>
                    <span className="text-xs text-gray-400 font-mono">{dateStr}</span>
                  </div>
                  {sess.notes && <p className="text-xs text-gray-400">{sess.notes}</p>}
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-surface-800 pt-3 md:pt-0">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                      Duration
                    </span>
                    <span className="text-sm font-bold text-white font-mono">
                      {sess.durationMinutes || 0} mins
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                      Total Volume
                    </span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {sess.totalVolumeKg ? `${sess.totalVolumeKg.toLocaleString()} kg` : 'N/A'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteSession(sess.id)}
                    className="text-gray-500 hover:text-red-400 text-xs p-1.5 ml-2"
                    title="Delete session record"
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
