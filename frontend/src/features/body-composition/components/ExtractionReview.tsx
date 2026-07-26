import React, { useState, useEffect } from 'react';

export interface MeasurementItem {
  name: string;
  label: string;
  value: number | string;
  unit: string;
  confidence: number;
}

interface ExtractionReviewProps {
  data: any;
  onConfirm: (measurements: Record<string, any>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const DEFAULT_METRICS: MeasurementItem[] = [
  { name: 'weight', label: 'Body Weight', value: '', unit: 'kg', confidence: 0.9 },
  { name: 'body_fat_mass', label: 'Body Fat Mass', value: '', unit: 'kg', confidence: 0.85 },
  { name: 'body_fat_pct', label: 'Body Fat Percentage', value: '', unit: '%', confidence: 0.85 },
  { name: 'skeletal_muscle_mass', label: 'Skeletal Muscle Mass', value: '', unit: 'kg', confidence: 0.85 },
  { name: 'fat_free_mass', label: 'Fat-Free Mass / Remove Fat', value: '', unit: 'kg', confidence: 0.8 },
  { name: 'water_content', label: 'Water Content', value: '', unit: 'kg', confidence: 0.85 },
  { name: 'protein', label: 'Protein', value: '', unit: 'kg', confidence: 0.85 },
  { name: 'inorganic_salt', label: 'Inorganic Salt', value: '', unit: 'kg', confidence: 0.85 },
  { name: 'bmi', label: 'BMI (Body Mass Index)', value: '', unit: 'kg/m²', confidence: 0.9 },
  { name: 'visceral_fat_level', label: 'Visceral Fat Level', value: '', unit: 'level', confidence: 0.8 },
];

export const ExtractionReview: React.FC<ExtractionReviewProps> = ({ data, onConfirm, onCancel, isSaving }) => {
  const [items, setItems] = useState<MeasurementItem[]>([]);

  useEffect(() => {
    const parsedItems: MeasurementItem[] = [];
    const defaultConfidence: number = typeof data?.aiConfidence === 'number' ? data.aiConfidence : 0.85;

    if (data && data.measurements) {
      if (Array.isArray(data.measurements)) {
        // Backend returned List<MeasurementDto>
        for (const m of data.measurements) {
          if (!m) continue;
          const nameStr: string = String(m.metricName || m.name || 'metric');
          const labelStr: string = formatLabel(nameStr);
          const val: number | string = (m.metricValue ?? m.value ?? '') as (number | string);
          let unitStr: string = String(m.metricUnit || m.unit || 'kg');
          if (nameStr.includes('pct') || nameStr.includes('percent')) {
            unitStr = '%';
          } else if (nameStr === 'bmi') {
            unitStr = 'kg/m²';
          } else if (nameStr.includes('visceral')) {
            unitStr = 'level';
          }
          const confNum: number = typeof m.confidence === 'number' ? m.confidence : defaultConfidence;

          parsedItems.push({
            name: nameStr,
            label: labelStr,
            value: val,
            unit: unitStr,
            confidence: confNum,
          });
        }
      } else if (typeof data.measurements === 'object') {
        // Object format { weight: { value: 75.5, unit: 'kg' } } or { weight: 75.5 }
        for (const key of Object.keys(data.measurements)) {
          const val: any = data.measurements[key];
          const nameStr: string = String(key || 'metric');
          const labelStr: string = formatLabel(nameStr);

          if (val && typeof val === 'object') {
            const vNum: number | string = (val.value ?? '') as (number | string);
            let uStr: string = String(val.unit || 'kg');
            if (nameStr.includes('pct') || nameStr.includes('percent')) {
              uStr = '%';
            } else if (nameStr === 'bmi') {
              uStr = 'kg/m²';
            } else if (nameStr.includes('visceral')) {
              uStr = 'level';
            }
            const cNum: number = typeof val.confidence === 'number' ? val.confidence : defaultConfidence;
            parsedItems.push({
              name: nameStr,
              label: labelStr,
              value: vNum,
              unit: uStr,
              confidence: cNum,
            });
          } else {
            const vNum: number | string = (val ?? '') as (number | string);
            let uStr = 'kg';
            if (nameStr.includes('pct') || nameStr.includes('percent')) {
              uStr = '%';
            } else if (nameStr === 'bmi') {
              uStr = 'kg/m²';
            } else if (nameStr.includes('visceral')) {
              uStr = 'level';
            }
            parsedItems.push({
              name: nameStr,
              label: labelStr,
              value: vNum,
              unit: uStr,
              confidence: defaultConfidence,
            });
          }
        }
      }
    }

    // If no measurements extracted or empty, merge with standard defaults
    if (parsedItems.length === 0) {
      setItems([...DEFAULT_METRICS]);
    } else {
      setItems([...parsedItems]);
    }
  }, [data]);

  function formatLabel(key: string): string {
    return String(key || '')
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  const handleValueChange = (index: number, val: string) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      if (item) {
        updated[index] = { ...item, value: val };
      }
      return updated;
    });
  };

  const handleUnitChange = (index: number, unit: string) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      if (item) {
        updated[index] = { ...item, unit };
      }
      return updated;
    });
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMetric = () => {
    const newItem: MeasurementItem = {
      name: `custom_metric_${items.length + 1}`,
      label: 'New Metric',
      value: '',
      unit: 'kg',
      confidence: 1.0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resultObj: Record<string, any> = {};
    items.forEach((item) => {
      if (item.value !== '' && item.value !== null && item.value !== undefined) {
        resultObj[item.name] = typeof item.value === 'number' ? item.value : parseFloat(String(item.value)) || 0;
      }
    });
    onConfirm(resultObj);
  };

  const overallConfidence: number = typeof data?.aiConfidence === 'number' ? data.aiConfidence : 0.85;

  const renderConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.85) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          High
        </span>
      );
    }
    if (confidence >= 0.60) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <svg className="w-3.5 h-3.5 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        Low
      </span>
    );
  };

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-white transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-surface-800 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Review Extracted Data</h2>
              <p className="text-xs text-surface-400 mt-0.5">
                Verify or edit the extracted metrics below before confirming.
              </p>
            </div>
          </div>
        </div>

        <div className="hidden sm:block">
          {renderConfidenceBadge(overallConfidence)}
        </div>
      </div>

      {/* Low Confidence Warning Alert */}
      {overallConfidence < 0.70 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 flex items-start gap-3 shadow-inner">
          <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <span className="font-semibold text-amber-300">Review Carefully:</span> AI confidence is low. Please review and update the values below carefully.
          </div>
        </div>
      )}

      {/* Form List */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-950 border border-surface-800 hover:border-surface-700 transition-all"
            >
              {/* Metric Label */}
              <div className="flex items-center gap-2.5 sm:w-1/3">
                <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0"></span>
                <span className="text-sm font-medium text-surface-200">{item.label}</span>
              </div>

              {/* Inputs & Confidence */}
              <div className="flex items-center gap-3 sm:w-2/3 justify-end">
                <div className="relative flex-1 max-w-[160px]">
                  <input
                    type="number"
                    step="any"
                    placeholder="0.0"
                    value={item.value}
                    onChange={(e) => handleValueChange(idx, e.target.value)}
                    className="w-full px-3 py-2 bg-surface-900 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-mono"
                  />
                </div>

                {/* Unit Selector */}
                <select
                  value={item.unit}
                  onChange={(e) => handleUnitChange(idx, e.target.value)}
                  className="px-2.5 py-2 bg-surface-900 border border-surface-700 rounded-lg text-xs font-semibold text-surface-300 focus:outline-none focus:border-brand-500"
                >
                  <option value="kg" className="bg-surface-950 text-white">kg</option>
                  <option value="%" className="bg-surface-950 text-white">%</option>
                  <option value="lbs" className="bg-surface-950 text-white">lbs</option>
                  <option value="kg/m²" className="bg-surface-950 text-white">kg/m²</option>
                  <option value="level" className="bg-surface-950 text-white">level</option>
                </select>

                <div className="hidden md:block w-20 text-right">
                  {renderConfidenceBadge(item.confidence)}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 text-surface-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Remove metric"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add custom metric button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleAddMetric}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors px-3 py-1.5 rounded-lg border border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/10"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Additional Metric
          </button>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-surface-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl border border-surface-700 bg-surface-800 hover:bg-surface-700 text-surface-200 text-sm font-medium transition-all focus:outline-none"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-lg shadow-brand-600/20 transition-all disabled:opacity-50 focus:outline-none"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
                Confirm and Save
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
