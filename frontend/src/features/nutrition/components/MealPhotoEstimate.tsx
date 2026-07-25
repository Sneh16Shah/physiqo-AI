import React, { useState, useRef } from 'react';
import { aiApi } from '../../../api/ai.api';
import { toast } from '../../../stores/toastStore';

interface MealPhotoEstimateProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToLog: (estimatedData: any) => void;
}

export const MealPhotoEstimate: React.FC<MealPhotoEstimateProps> = ({ isOpen, onClose, onAddToLog }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setEstimate(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await aiApi.estimateMealPhoto(file);
      setEstimate(data);
    } catch (error) {
      console.error('Failed to estimate meal:', error);
      toast.error('Failed to analyze photo. Please try again.', 'Analysis Error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (estimate) {
      onAddToLog(estimate);
      onClose();
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setEstimate(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-surface-900 rounded-xl max-w-lg w-full p-6 border border-surface-800 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            AI Meal Estimation
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!estimate ? (
          <div className="space-y-4">
            {!preview ? (
              <div 
                className="border-2 border-dashed border-surface-700 rounded-xl p-8 text-center cursor-pointer hover:border-brand-500 transition-colors bg-surface-950"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-300 font-medium">Click to upload meal photo</p>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-surface-950 aspect-video flex items-center justify-center">
                  <img src={preview} alt="Meal preview" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleReset}
                    className="flex-1 py-2 px-4 bg-surface-800 hover:bg-surface-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Choose Another
                  </button>
                  <button 
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="flex-1 py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex justify-center items-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Photo'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-4 rounded-r">
              <p className="text-sm text-yellow-200">
                <strong>Disclaimer:</strong> AI estimates are approximate. Please verify portions and ingredients for accuracy.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-3 border-b border-surface-800 pb-2">Estimated Items</h3>
              <ul className="space-y-2">
                {estimate.items?.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-300 capitalize">{item.name} <span className="text-gray-500">({item.portion})</span></span>
                    <span className="text-white font-medium">{item.calories} kcal</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface-950 p-4 rounded-lg border border-surface-800">
              <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Total Macros</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Calories</div>
                  <div className="font-bold text-white">{estimate.totalCalories}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Protein</div>
                  <div className="font-bold text-blue-400">{estimate.macros?.protein}g</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Carbs</div>
                  <div className="font-bold text-green-400">{estimate.macros?.carbs}g</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Fat</div>
                  <div className="font-bold text-yellow-400">{estimate.macros?.fat}g</div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button 
                onClick={handleReset}
                className="flex-1 py-2 px-4 bg-surface-800 hover:bg-surface-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Retake
              </button>
              <button 
                onClick={handleAdd}
                className="flex-1 py-2 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Add to Meal Log
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
