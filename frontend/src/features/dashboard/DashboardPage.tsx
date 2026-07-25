import React from 'react';
import { Link } from 'react-router-dom';
import { AIInsights } from './components/AIInsights';

const DashboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      </div>

      <AIInsights />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats Cards */}
        <div className="bg-surface-900 p-6 rounded-xl border border-surface-800">
          <h2 className="text-gray-400 text-sm font-medium">Latest Weight</h2>
          <p className="text-3xl font-bold text-white mt-2">-- kg</p>
        </div>
        <div className="bg-surface-900 p-6 rounded-xl border border-surface-800">
          <h2 className="text-gray-400 text-sm font-medium">Body Fat %</h2>
          <p className="text-3xl font-bold text-white mt-2">-- %</p>
        </div>
        <div className="bg-surface-900 p-6 rounded-xl border border-surface-800">
          <h2 className="text-gray-400 text-sm font-medium">Today's Calories</h2>
          <p className="text-3xl font-bold text-white mt-2">-- / -- kcal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Workouts */}
        <div className="bg-surface-900 p-6 rounded-xl border border-surface-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Workouts</h2>
            <Link to="/workouts" className="text-brand-500 text-sm hover:underline">View All</Link>
          </div>
          <div className="text-gray-400 text-sm py-4 text-center">
            No recent workouts found.
          </div>
        </div>

        {/* Recent Nutrition */}
        <div className="bg-surface-900 p-6 rounded-xl border border-surface-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Today's Nutrition</h2>
            <Link to="/nutrition" className="text-brand-500 text-sm hover:underline">Log Meal</Link>
          </div>
          <div className="text-gray-400 text-sm py-4 text-center">
            No meals logged today.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
