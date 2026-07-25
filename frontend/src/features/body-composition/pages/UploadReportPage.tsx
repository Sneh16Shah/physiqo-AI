import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanUpload } from '../components/ScanUpload';
import { ExtractionReview } from '../components/ExtractionReview';
import { aiApi } from '../../../api/ai.api';
import { toast } from '../../../stores/toastStore';

export const UploadReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [uploading, setUploading] = useState(false);
  const [extractionData, setExtractionData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUploadSuccess = (data: any) => {
    setExtractionData(data);
    setStep(2);
  };

  const handleConfirm = async (measurements: Record<string, any>) => {
    const reportId = extractionData?.scanId || extractionData?.id;
    if (!reportId) return;
    setIsSaving(true);
    try {
      await aiApi.confirmBodyCompScan(reportId, measurements);
      toast.success('Body composition report saved successfully!', 'Report Saved');
      navigate('/body-composition');
    } catch (error) {
      console.error('Failed to confirm scan:', error);
      toast.error('Failed to save measurements. Please try again.', 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/body-composition');
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center">
            <li className={`relative pr-8 sm:pr-20 ${step >= 1 ? 'text-brand-500' : 'text-surface-600'}`}>
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className={`h-0.5 w-full ${step >= 2 ? 'bg-brand-500' : 'bg-surface-800'}`}></div>
              </div>
              <span className={`relative flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-surface-900 border-2 border-surface-700 text-surface-400'} ring-8 ring-surface-950`}>
                {step >= 2 ? (
                  <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="font-medium">1</span>
                )}
              </span>
              <span className="mt-2 block text-xs font-medium absolute w-32 text-center -ml-12 text-surface-200">Upload Scan</span>
            </li>

            <li className={`relative ${step === 2 ? 'text-brand-500' : 'text-surface-600'}`}>
              <span className={`relative flex h-8 w-8 items-center justify-center rounded-full ${step === 2 ? 'bg-brand-600 text-white' : 'bg-surface-900 border-2 border-surface-700 text-surface-400'} ring-8 ring-surface-950`}>
                <span className="font-medium">2</span>
              </span>
              <span className="mt-2 block text-xs font-medium absolute w-32 text-center -ml-12 text-surface-200">Review & Confirm</span>
            </li>
          </ol>
        </nav>
      </div>

      {step === 1 && (
        <ScanUpload 
          onUploadSuccess={handleUploadSuccess} 
          uploading={uploading} 
          setUploading={setUploading} 
          onUpload={aiApi.uploadBodyCompScan} 
        />
      )}

      {step === 2 && extractionData && (
        <ExtractionReview 
          data={extractionData} 
          onConfirm={handleConfirm} 
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};
