import React, { useState } from 'react';

const WorkoutsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'active' | 'history' | 'library'>('plans');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Workouts</h1>
        <button className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold">
          {activeTab === 'plans' ? '+ New Plan' : activeTab === 'library' ? '+ Custom Exercise' : 'Start Empty Session'}
        </button>
      </div>

      <div className="flex space-x-4 border-b border-surface-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 font-medium text-sm rounded-lg whitespace-nowrap ${activeTab === 'plans' ? 'bg-surface-800 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Workout Plans
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-medium text-sm rounded-lg whitespace-nowrap ${activeTab === 'active' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Active Session
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium text-sm rounded-lg whitespace-nowrap ${activeTab === 'history' ? 'bg-surface-800 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 font-medium text-sm rounded-lg whitespace-nowrap ${activeTab === 'library' ? 'bg-surface-800 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Exercise Library
        </button>
      </div>

      <div className="bg-surface-900 p-6 rounded-xl border border-surface-800 min-h-[500px]">
        
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock Plan Card */}
            <div className="bg-surface-950 p-5 rounded-lg border border-surface-800 hover:border-brand-500 transition-colors cursor-pointer group">
              <h3 className="text-xl font-bold text-white mb-2">Push Pull Legs</h3>
              <p className="text-sm text-gray-400 mb-4">6 days/week • Hypertrophy focused</p>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-surface-900 text-xs text-gray-300 rounded">Push</span>
                <span className="px-2 py-1 bg-surface-900 text-xs text-gray-300 rounded">Pull</span>
                <span className="px-2 py-1 bg-surface-900 text-xs text-gray-300 rounded">Legs</span>
              </div>
              <button className="w-full mt-6 py-2 bg-surface-800 group-hover:bg-brand-600 text-white rounded-lg font-semibold transition-colors">
                Start Next: Push Day
              </button>
            </div>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-surface-950 p-4 rounded-lg border border-surface-800">
              <div>
                <h2 className="text-xl font-bold text-white">Push Day</h2>
                <p className="text-sm text-brand-500 font-mono mt-1">Time: 00:12:45</p>
              </div>
              <button className="px-4 py-2 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg text-sm font-semibold transition-colors">
                Finish Session
              </button>
            </div>

            {/* Exercise Logger */}
            <div className="bg-surface-950 rounded-lg border border-surface-800 overflow-hidden">
              <div className="p-4 bg-surface-900 border-b border-surface-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Barbell Bench Press</h3>
                <button className="text-gray-400 hover:text-white">⋮</button>
              </div>
              <div className="p-4 space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-2">
                  <div>Set</div>
                  <div>kg</div>
                  <div>Reps</div>
                  <div>Done</div>
                </div>
                {[1, 2, 3].map(set => (
                  <div key={set} className="grid grid-cols-4 gap-2 items-center">
                    <div className="text-center text-gray-300 font-medium">{set}</div>
                    <input type="number" className="w-full bg-surface-900 border border-surface-800 rounded px-2 py-1 text-center text-white" defaultValue="80" />
                    <input type="number" className="w-full bg-surface-900 border border-surface-800 rounded px-2 py-1 text-center text-white" defaultValue="10" />
                    <div className="text-center">
                      <button className="w-8 h-8 rounded bg-surface-800 hover:bg-brand-500 flex items-center justify-center text-white mx-auto transition-colors">
                        ✓
                      </button>
                    </div>
                  </div>
                ))}
                <button className="w-full mt-4 py-1 border border-dashed border-surface-700 text-gray-400 hover:text-white hover:border-surface-600 rounded text-sm transition-colors">
                  + Add Set
                </button>
              </div>
            </div>
            
            <button className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-bold transition-colors">
              + Add Exercise
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <p className="text-gray-400">Workout history will be listed here.</p>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-6">
            <input 
              type="text" 
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-surface-950 border border-surface-800 rounded-lg text-white focus:ring-2 focus:ring-brand-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Mock Exercise Items */}
              {['Barbell Bench Press', 'Squat', 'Deadlift', 'Pull-up', 'Overhead Press'].map(ex => (
                <div key={ex} className="p-4 bg-surface-950 border border-surface-800 rounded-lg flex justify-between items-center hover:bg-surface-800/50 cursor-pointer transition-colors">
                  <span className="text-white font-medium">{ex}</span>
                  <span className="text-xs px-2 py-1 bg-surface-900 text-gray-400 rounded">Compound</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutsPage;
