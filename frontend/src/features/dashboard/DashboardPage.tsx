import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AIInsights } from './components/AIInsights';
import { bodyCompApi } from '../../api/bodycomp.api';
import { nutritionApi } from '../../api/nutrition.api';
import { workoutApi } from '../../api/workout.api';

interface Measurement {
  id?: string;
  metricName: string;
  metricValue: number;
  metricUnit: string;
}

interface BodyCompReport {
  id: string;
  reportDate: string;
  reportType?: string;
  source?: string;
  measurements?: Measurement[];
}

interface DailySummary {
  totalCalories?: number;
  totalProteinGrams?: number;
  totalCarbsGrams?: number;
  totalFatGrams?: number;
}

interface NutritionGoal {
  dailyCalorieTarget?: number;
  proteinTargetGrams?: number;
  carbsTargetGrams?: number;
  fatTargetGrams?: number;
}

interface MealItem {
  id?: string;
  foodName?: string;
  servingSize?: number;
  servingUnit?: string;
  calories?: number;
}

interface Meal {
  id: string;
  mealType: string;
  consumedAt?: string;
  totalCalories?: number;
  items?: MealItem[];
}

interface WorkoutSession {
  id: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  notes?: string;
  exerciseSets?: any[];
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [latestReport, setLatestReport] = useState<BodyCompReport | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [nutritionGoal, setNutritionGoal] = useState<NutritionGoal | null>(null);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Body Composition Reports
      try {
        const bodyCompRes = await bodyCompApi.getReports({ page: 0, size: 5, sort: 'reportDate,desc' });
        const data = bodyCompRes.data;
        const reportsList: BodyCompReport[] = Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
          ? data
          : [];
        if (reportsList.length > 0 && reportsList[0]) {
          setLatestReport(reportsList[0]);
        } else {
          setLatestReport(null);
        }
      } catch (err) {
        console.error('Failed to fetch body composition reports:', err);
      }

      // 2. Fetch Nutrition Daily Summary & Goal & Today's Meals
      const todayStr = new Date().toISOString().split('T')[0];
      try {
        const [summaryRes, goalRes, mealsRes] = await Promise.allSettled([
          nutritionApi.getDailySummary(todayStr),
          nutritionApi.getCurrentGoal(),
          nutritionApi.getMeals(todayStr),
        ]);

        if (summaryRes.status === 'fulfilled' && summaryRes.value?.data) {
          setDailySummary(summaryRes.value.data);
        }
        if (goalRes.status === 'fulfilled' && goalRes.value?.data) {
          setNutritionGoal(goalRes.value.data);
        }
        if (mealsRes.status === 'fulfilled' && mealsRes.value?.data) {
          const mealsData = mealsRes.value.data;
          const mealsList: Meal[] = Array.isArray(mealsData?.content)
            ? mealsData.content
            : Array.isArray(mealsData)
            ? mealsData
            : [];
          setTodayMeals(mealsList);
        }
      } catch (err) {
        console.error('Failed to fetch nutrition data:', err);
      }

      // 3. Fetch Recent Workouts
      try {
        const workoutsRes = await workoutApi.getWorkoutSessions();
        const workoutsData = workoutsRes?.data;
        const workoutsList: WorkoutSession[] = Array.isArray(workoutsData?.content)
          ? workoutsData.content
          : Array.isArray(workoutsData)
          ? workoutsData
          : [];
        setRecentWorkouts(workoutsList.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch workout sessions:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Metric extraction helper
  const getMetric = (report: BodyCompReport | null, targetKeys: string[]) => {
    if (!report || !report.measurements || !Array.isArray(report.measurements)) {
      return null;
    }
    const match = report.measurements.find(m =>
      targetKeys.some(k => m.metricName?.toLowerCase().includes(k.toLowerCase()))
    );
    if (match && match.metricValue != null) {
      return {
        value: match.metricValue,
        unit: match.metricUnit || ''
      };
    }
    return null;
  };

  const weightObj = getMetric(latestReport, ['weight', 'body_weight']);
  const bodyFatObj = getMetric(latestReport, ['body_fat_pct', 'body_fat_percentage', 'fat_pct', 'body_fat']);
  const muscleObj = getMetric(latestReport, ['skeletal_muscle_mass', 'muscle_mass', 'fat_free_mass']);

  const caloriesConsumed = Math.round(dailySummary?.totalCalories || 0);
  const caloriesGoal = nutritionGoal?.dailyCalorieTarget || 2000;
  const caloriePct = Math.min(Math.round((caloriesConsumed / caloriesGoal) * 100), 100);

  const formattedTodayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">{formattedTodayDate} • Fitness & Health Summary</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-3.5 py-2 bg-surface-900 border border-surface-800 hover:bg-surface-800 text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <span className={loading ? 'animate-spin' : ''}>↻</span> Refresh
          </button>
          <button
            onClick={() => navigate('/body-composition/upload')}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-brand-600/20 transition-all"
          >
            + Upload Scan
          </button>
        </div>
      </div>

      <AIInsights />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Latest Weight Card */}
        <div className="bg-surface-900 p-6 rounded-xl border border-surface-800 relative overflow-hidden group hover:border-surface-700 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Latest Weight</span>
            <span className="p-2 bg-brand-500/10 text-brand-400 rounded-lg text-xs">⚖️</span>
          </div>
          {loading ? (
            <div className="h-8 bg-surface-800 animate-pulse rounded mt-3 w-2/3"></div>
          ) : weightObj ? (
            <div>
              <p className="text-3xl font-bold text-white mt-2 font-mono">
                {weightObj.value} <span className="text-lg font-normal text-gray-400">{weightObj.unit || 'kg'}</span>
              </p>
              {latestReport?.reportDate && (
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 font-medium">
                  <span>📅</span> Scan on {latestReport.reportDate}
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-3xl font-bold text-gray-500 mt-2">-- kg</p>
              <p className="text-xs text-gray-500 mt-2">No scan data logged yet</p>
            </div>
          )}
          <Link to="/body-composition" className="absolute inset-0 z-10" aria-label="View Body Composition" />
        </div>

        {/* Body Fat % Card */}
        <div className="bg-surface-900 p-6 rounded-xl border border-surface-800 relative overflow-hidden group hover:border-surface-700 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Body Fat %</span>
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs">📊</span>
          </div>
          {loading ? (
            <div className="h-8 bg-surface-800 animate-pulse rounded mt-3 w-2/3"></div>
          ) : bodyFatObj ? (
            <div>
              <p className="text-3xl font-bold text-white mt-2 font-mono">
                {bodyFatObj.value} <span className="text-lg font-normal text-gray-400">%</span>
              </p>
              {latestReport?.reportType && (
                <p className="text-xs text-indigo-400 mt-2 font-medium">
                  {latestReport.reportType} Report
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-3xl font-bold text-gray-500 mt-2">-- %</p>
              <p className="text-xs text-gray-500 mt-2">No scan data logged yet</p>
            </div>
          )}
          <Link to="/body-composition" className="absolute inset-0 z-10" aria-label="View Body Composition" />
        </div>

        {/* Muscle Mass Card */}
        <div className="bg-surface-900 p-6 rounded-xl border border-surface-800 relative overflow-hidden group hover:border-surface-700 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Muscle Mass</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs">💪</span>
          </div>
          {loading ? (
            <div className="h-8 bg-surface-800 animate-pulse rounded mt-3 w-2/3"></div>
          ) : muscleObj ? (
            <div>
              <p className="text-3xl font-bold text-white mt-2 font-mono">
                {muscleObj.value} <span className="text-lg font-normal text-gray-400">{muscleObj.unit || 'kg'}</span>
              </p>
              <p className="text-xs text-emerald-400 mt-2 font-medium">Skeletal Muscle</p>
            </div>
          ) : (
            <div>
              <p className="text-3xl font-bold text-gray-500 mt-2">-- kg</p>
              <p className="text-xs text-gray-500 mt-2">No scan data logged yet</p>
            </div>
          )}
          <Link to="/body-composition" className="absolute inset-0 z-10" aria-label="View Body Composition" />
        </div>

        {/* Today's Calories Card */}
        <div className="bg-surface-900 p-6 rounded-xl border border-surface-800 relative overflow-hidden group hover:border-surface-700 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Today's Calories</span>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg text-xs">🔥</span>
          </div>
          {loading ? (
            <div className="h-8 bg-surface-800 animate-pulse rounded mt-3 w-2/3"></div>
          ) : (
            <div>
              <p className="text-3xl font-bold text-white mt-2 font-mono">
                {caloriesConsumed} <span className="text-base font-normal text-gray-400">/ {caloriesGoal} kcal</span>
              </p>
              <div className="w-full bg-surface-950 rounded-full h-1.5 mt-3 overflow-hidden border border-surface-800">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-brand-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${caloriePct}%` }}
                />
              </div>
            </div>
          )}
          <Link to="/nutrition" className="absolute inset-0 z-10" aria-label="View Nutrition" />
        </div>
      </div>

      {/* Body Composition Banner Preview (if report exists) */}
      {latestReport && (
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold rounded bg-brand-500/20 text-brand-400 uppercase tracking-wide">
                Latest Scan Breakdown
              </span>
              <span className="text-xs text-gray-400">({latestReport.reportDate})</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {latestReport.reportType || 'Body Scan'} Report ({latestReport.source || 'OCR'})
            </h3>
            <p className="text-xs text-gray-400">
              Synced from your latest DEXA / InBody report upload.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {weightObj && (
              <div className="bg-surface-950 px-4 py-2.5 rounded-lg border border-surface-800 text-center flex-1 md:flex-initial">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Weight</span>
                <span className="text-sm font-bold text-white font-mono">{weightObj.value} {weightObj.unit}</span>
              </div>
            )}
            {bodyFatObj && (
              <div className="bg-surface-950 px-4 py-2.5 rounded-lg border border-surface-800 text-center flex-1 md:flex-initial">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Body Fat</span>
                <span className="text-sm font-bold text-white font-mono">{bodyFatObj.value}%</span>
              </div>
            )}
            {muscleObj && (
              <div className="bg-surface-950 px-4 py-2.5 rounded-lg border border-surface-800 text-center flex-1 md:flex-initial">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Muscle</span>
                <span className="text-sm font-bold text-white font-mono">{muscleObj.value} {muscleObj.unit}</span>
              </div>
            )}
            <button
              onClick={() => navigate('/body-composition')}
              className="px-4 py-2.5 bg-surface-800 hover:bg-surface-700 text-white text-xs font-semibold rounded-lg transition-colors flex-1 md:flex-initial"
            >
              View Full Report →
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Workouts Card */}
        <div className="bg-surface-900 p-6 rounded-xl border border-surface-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <span>🏋️‍♂️</span> Recent Workouts
              </h2>
              <Link to="/workouts" className="text-brand-400 text-xs font-semibold hover:underline">View All →</Link>
            </div>

            {loading ? (
              <div className="space-y-3 py-2">
                <div className="h-12 bg-surface-800 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-surface-800 rounded-lg animate-pulse"></div>
              </div>
            ) : recentWorkouts.length > 0 ? (
              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <div key={workout.id} className="bg-surface-950 p-3.5 rounded-lg border border-surface-800 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Workout Session</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {workout.startTime ? new Date(workout.startTime).toLocaleDateString() : 'Recent'} 
                        {workout.durationMinutes ? ` • ${workout.durationMinutes} mins` : ''}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-medium bg-brand-500/10 text-brand-400 rounded-lg">
                      {workout.exerciseSets?.length || 0} sets
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm py-8 text-center border border-dashed border-surface-800 rounded-xl my-2">
                <p>No recent workouts found.</p>
                <p className="text-xs text-gray-500 mt-1">Track your fitness sessions to view progress here.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-surface-800/60 flex justify-end">
            <Link 
              to="/workouts" 
              className="px-3.5 py-1.5 bg-surface-800 hover:bg-surface-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              + Log Workout
            </Link>
          </div>
        </div>

        {/* Today's Nutrition Card */}
        <div className="bg-surface-900 p-6 rounded-xl border border-surface-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <span>🥗</span> Today's Nutrition
              </h2>
              <Link to="/nutrition" className="text-brand-400 text-xs font-semibold hover:underline">Log Meal →</Link>
            </div>

            {loading ? (
              <div className="space-y-3 py-2">
                <div className="h-12 bg-surface-800 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-surface-800 rounded-lg animate-pulse"></div>
              </div>
            ) : todayMeals.length > 0 ? (
              <div className="space-y-3">
                {todayMeals.map((meal) => (
                  <div key={meal.id} className="bg-surface-950 p-3.5 rounded-lg border border-surface-800 flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-semibold text-white capitalize">{meal.mealType?.toLowerCase() || 'Meal'}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {meal.items?.length || 0} items logged
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-400 rounded-lg font-mono">
                      {meal.totalCalories || 0} kcal
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm py-8 text-center border border-dashed border-surface-800 rounded-xl my-2">
                <p>No meals logged today.</p>
                <p className="text-xs text-gray-500 mt-1">Keep track of your daily calories and macros.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-surface-800/60 flex justify-end">
            <Link 
              to="/nutrition" 
              className="px-3.5 py-1.5 bg-surface-800 hover:bg-surface-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              + Log Meal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
