import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BodyCompPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'measurements' | 'trends'>('reports');
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Body Composition</h1>
        <button 
          onClick={() => navigate('/body-composition/upload')}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold"
        >
          + Upload Scan
        </button>
      </div>

      <div className="flex space-x-4 border-b border-surface-800 pb-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-medium text-sm rounded-lg ${activeTab === 'reports' ? 'bg-surface-800 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('measurements')}
          className={`px-4 py-2 font-medium text-sm rounded-lg ${activeTab === 'measurements' ? 'bg-surface-800 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Tape Measurements
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-2 font-medium text-sm rounded-lg ${activeTab === 'trends' ? 'bg-surface-800 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Trends
        </button>
      </div>

      <div className="bg-surface-900 p-6 rounded-xl border border-surface-800 min-h-[400px]">
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">DEXA / InBody Reports</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-surface-950 text-gray-300">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Date</th>
                    <th className="px-4 py-3">Weight</th>
                    <th className="px-4 py-3">Body Fat %</th>
                    <th className="px-4 py-3">Muscle Mass</th>
                    <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-surface-800 hover:bg-surface-800/50">
                    <td className="px-4 py-3">2026-07-24</td>
                    <td className="px-4 py-3 text-white">82.5 kg</td>
                    <td className="px-4 py-3 text-white">14.2 %</td>
                    <td className="px-4 py-3 text-white">38.1 kg</td>
                    <td className="px-4 py-3">
                      <button className="text-brand-500 hover:underline mr-3">View</button>
                      <button className="text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'measurements' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Tape Measurements (cm)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Chest', 'Waist', 'Hips', 'Bicep', 'Thigh', 'Calf'].map(part => (
                <div key={part} className="bg-surface-950 p-4 rounded-lg border border-surface-800 text-center">
                  <div className="text-gray-400 text-xs uppercase tracking-wider">{part}</div>
                  <div className="text-xl font-bold text-white mt-1">--</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Progress Trends</h2>
            <div className="w-full h-64 bg-surface-950 rounded-lg border border-surface-800 flex items-center justify-center flex-col">
              <svg className="w-12 h-12 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <p className="text-gray-500">Chart visualization will render here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BodyCompPage;
