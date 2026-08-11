import React, { useState, useRef } from 'react';
import { toast } from '../../../stores/toastStore';
import { bodyCompApi } from '../../../api/bodycomp.api';

interface ScanUploadProps {
  onUploadSuccess: (data: any) => void;
  uploading: boolean;
  setUploading: (val: boolean) => void;
  onUpload: (file: File, reportType: string) => Promise<any>;
}

export const ScanUpload: React.FC<ScanUploadProps> = ({ onUploadSuccess, uploading, setUploading, onUpload }) => {
  const [reportType, setReportType] = useState('dexa');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = "image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const valid = newFiles.filter(file => {
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 50MB size limit.`, 'File Too Large');
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...valid]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setUploadProgress({ current: 0, total: selectedFiles.length });

    const results: any[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const fileToUpload = selectedFiles[i];
      if (!fileToUpload) continue;

      setUploadProgress({ current: i + 1, total: selectedFiles.length });
      try {
        const res = await onUpload(fileToUpload, reportType);
        if (res) {
          results.push(res);
        }
      } catch (error) {
        console.error(`Upload failed for ${fileToUpload.name}:`, error);
        toast.error(`Failed to process ${fileToUpload.name}`, 'Upload Error');
      }
    }

    setUploading(false);
    setUploadProgress(null);

    if (results.length > 0) {
      // Merge all extracted measurements into ONE primary report payload
      const primaryReport = { ...results[0] };
      const mergedMap: Record<string, any> = {};

      for (const r of results) {
        const meas = r?.measurements;
        if (Array.isArray(meas)) {
          for (const m of meas) {
            if (m) {
              const nameKey = m.metricName || m.name;
              if (nameKey && m.metricValue != null) {
                mergedMap[nameKey] = m;
              }
            }
          }
        } else if (meas && typeof meas === 'object') {
          for (const [k, v] of Object.entries(meas)) {
            if (v != null) {
              mergedMap[k] = v;
            }
          }
        }
      }

      // Assign merged measurements array to primary report
      primaryReport.measurements = Object.values(mergedMap);

      // Clean up temporary extra reports created for files 2..N
      const primaryId = primaryReport.id || primaryReport.scanId;
      for (let i = 1; i < results.length; i++) {
        const extraId = results[i]?.id || results[i]?.scanId;
        if (extraId && extraId !== primaryId) {
          try {
            await bodyCompApi.deleteReport(extraId);
          } catch (e) {
            console.warn('Failed to clean up temporary duplicate report:', extraId, e);
          }
        }
      }

      toast.success(
        results.length > 1
          ? `Merged metrics from ${results.length} scan pages into 1 consolidated report!`
          : `Successfully processed scan document!`,
        'Scan Upload Complete'
      );
      onUploadSuccess(primaryReport);
      setSelectedFiles([]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) {
      return <span className="p-2 bg-red-500/10 text-red-400 rounded-lg font-bold text-xs">PDF</span>;
    }
    if (['doc', 'docx'].includes(ext || '')) {
      return <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg font-bold text-xs">DOC</span>;
    }
    return <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg font-bold text-xs">IMG</span>;
  };

  return (
    <div className="p-6 bg-surface-900 border border-surface-800 rounded-xl shadow-xl space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Upload Body Composition Scan</h2>
        <span className="text-xs bg-surface-800 text-surface-300 px-3 py-1 rounded-full border border-surface-700">
          Supports PNG, JPG, PDF, DOC, DOCX
        </span>
      </div>

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

      {/* Drag and Drop Zone */}
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
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="flex text-sm text-surface-300 justify-center">
            <span className="font-semibold text-brand-400 hover:text-brand-300">
              Upload file(s)
            </span>
            <span className="pl-1 text-surface-400">or drag and drop</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              multiple
              className="sr-only"
              ref={fileInputRef}
              onChange={handleChange}
              accept={acceptedFormats}
            />
          </div>
          <p className="text-xs text-surface-400">Select one or multiple images, PDF reports, or DOC files (up to 15MB each)</p>
        </div>
      </div>

      {/* Selected Files Queue */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-surface-200">Selected Files ({selectedFiles.length})</h3>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-xs text-surface-400 hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-surface-950 border border-surface-800 rounded-lg text-sm">
                <div className="flex items-center gap-3 truncate">
                  {getFileIcon(file.name)}
                  <div className="truncate">
                    <p className="text-white font-medium truncate">{file.name}</p>
                    <p className="text-xs text-surface-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="text-surface-400 hover:text-red-400 p-1.5 rounded-md hover:bg-surface-800 transition-colors"
                  title="Remove File"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleUploadAll}
            disabled={uploading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-semibold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing File {uploadProgress?.current} of {uploadProgress?.total}...
              </>
            ) : (
              `Process ${selectedFiles.length} Scan Document${selectedFiles.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  );
};
