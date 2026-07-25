import React, { useState, useEffect } from 'react';
import { aiApi } from '../../../api/ai.api';

interface Insight {
  id: string;
  type: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

export const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const data = await aiApi.getAIInsights();
      setInsights(data.insights || []);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await aiApi.dismissAIInsight(id);
      setInsights((prev) => prev.filter((insight) => insight.id !== id));
    } catch (error) {
      console.error('Failed to dismiss insight:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface-900 rounded-xl p-6 border border-surface-800 animate-pulse">
        <div className="h-6 bg-surface-800 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-surface-800 rounded mb-2"></div>
      </div>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="ai-insights bg-gradient-to-r from-indigo-900 to-brand-900 rounded-xl p-6 border border-indigo-500 shadow-lg mb-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <svg className="w-6 h-6 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        AI Insights
      </h2>
      <div className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="flex justify-between items-start bg-black/20 p-4 rounded-lg">
            <div>
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1 block">
                {insight.type.replace(/_/g, ' ')}
              </span>
              <p className="text-white text-sm">{insight.message}</p>
              {insight.actionUrl && (
                <a href={insight.actionUrl} className="mt-2 inline-block text-indigo-400 text-sm hover:text-indigo-300 font-medium">
                  {insight.actionText || 'Take Action'} &rarr;
                </a>
              )}
            </div>
            <button
              onClick={() => handleDismiss(insight.id)}
              className="text-gray-400 hover:text-white p-1"
              title="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
