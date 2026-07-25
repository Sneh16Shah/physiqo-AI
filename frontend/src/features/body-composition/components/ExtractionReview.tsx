import React, { useState } from 'react';

interface ExtractionReviewProps {
  data: any;
  onConfirm: (measurements: Record<string, any>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const ExtractionReview: React.FC<ExtractionReviewProps> = ({ data, onConfirm, onCancel, isSaving }) => {
  const [measurements, setMeasurements] = useState<Record<string, any>>(data.measurements || {});

  const handleChange = (key: string, value: string) => {
    setMeasurements((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: parseFloat(value) || 0,
      },
    }));
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.85) return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">High</span>;
    if (confidence >= 0.60) return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Low</span>;
  };

  const overallConfidence = data.overallConfidence || 0;

  return (
    <div className="extraction-review p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Review Extracted Data</h2>
      
      {overallConfidence < 0.60 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Low confidence in extraction. Please review the values carefully.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(measurements).map(([key, item]: [string, any]) => (
          <div key={key} className="flex items-center justify-between border-b pb-2">
            <div className="flex flex-col w-1/3">
              <label className="text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
              {item.unit && <span className="text-xs text-gray-500">({item.unit})</span>}
            </div>
            <div className="flex items-center space-x-4 w-2/3 justify-end">
              <input
                type="number"
                value={item.value}
                onChange={(e) => handleChange(key, e.target.value)}
                className="mt-1 block w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <div className="w-16 flex justify-end">
                {getConfidenceBadge(item.confidence || overallConfidence)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirm(measurements)}
          disabled={isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Confirm and Save'}
        </button>
      </div>
    </div>
  );
};
