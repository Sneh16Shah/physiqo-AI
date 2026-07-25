import React, { useState, useRef } from 'react';
import { toast } from '../../../stores/toastStore';

interface ScanUploadProps {
  onUploadSuccess: (data: any) => void;
  uploading: boolean;
  setUploading: (val: boolean) => void;
  onUpload: (file: File, reportType: string) => Promise<any>;
}

export const ScanUpload: React.FC<ScanUploadProps> = ({ onUploadSuccess, uploading, setUploading, onUpload }) => {
  const [reportType, setReportType] = useState('dexa');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setUploading(true);
    try {
      const result = await onUpload(file, reportType);
      onUploadSuccess(result);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please check the file format and try again.', 'Scan Upload Failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-surface-900 border border-surface-800 rounded-xl shadow-xl space-y-6">
      <h2 className="text-xl font-bold text-white">Upload Body Composition Scan</h2>
      
      <div>
        <label className="block text-sm font-medium text-surface-300 mb-2">Report Type</label>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="w-full px-4 py-2.5 bg-surface-950 border border-surface-800 rounded-lg text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer"
        >
          <option value="dexa" className="bg-surface-900 text-white">DEXA Scan</option>
          <option value="inbody" className="bg-surface-900 text-white">InBody Scan</option>
        </select>
      </div>

      <div
        className={`flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
          dragActive 
            ? 'border-brand-500 bg-brand-500/10' 
            : 'border-surface-700 bg-surface-950/60 hover:border-surface-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-surface-800 flex items-center justify-center text-brand-400">
            <svg
              className="h-6 w-6"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div className="flex text-sm text-surface-300 justify-center">
            <span className="font-semibold text-brand-400 hover:text-brand-300">
              Upload a file
            </span>
            <span className="pl-1 text-surface-400">or drag and drop</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              ref={fileInputRef}
              onChange={handleChange}
              accept="image/*,application/pdf"
            />
          </div>
          <p className="text-xs text-surface-400">PNG, JPG, PDF up to 10MB</p>
        </div>
      </div>

      {uploading && (
        <div className="flex items-center justify-center p-4 bg-brand-500/10 border border-brand-500/20 rounded-lg text-brand-300 font-medium text-sm gap-3">
          <svg className="animate-spin h-5 w-5 text-brand-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing scan with AI OCR...
        </div>
      )}
    </div>
  );
};
