import React, { useState, useEffect } from 'react';

export interface MeasurementItem {
  name: string;
  label: string;
  value: number | string;
  unit: string;
  confidence: number;
  isMandatory?: boolean;
  isDerived?: boolean;
}

interface ExtractionReviewProps {
  data: any;
  onConfirm: (measurements: Record<string, any>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

// Mandatory field keys — at least these must have values before confirm
const MANDATORY_KEYS = new Set(['weight', 'skeletal_muscle_mass']);
// At least one of these must be present (body fat in any form)
const MANDATORY_FAT_KEYS = new Set(['body_fat_mass', 'body_fat_pct']);

const DEFAULT_METRICS: MeasurementItem[] = [
  { name: 'weight', label: 'Body Weight', value: '', unit: 'kg', confidence: 0.9, isMandatory: true },
  { name: 'body_fat_mass', label: 'Body Fat Mass', value: '', unit: 'kg', confidence: 0.85, isMandatory: true },
  { name: 'body_fat_pct', label: 'Body Fat Percentage', value: '', unit: '%', confidence: 0.85, isMandatory: true },
  { name: 'skeletal_muscle_mass', label: 'Skeletal Muscle Mass', value: '', unit: 'kg', confidence: 0.85, isMandatory: true },
  { name: 'fat_free_mass', label: 'Fat-Free Mass', value: '', unit: 'kg', confidence: 0.8 },
  { name: 'water_content', label: 'Water Content', value: '', unit: 'kg', confidence: 0.85 },
  { name: 'protein', label: 'Protein', value: '', unit: 'kg', confidence: 0.85 },
  { name: 'inorganic_salt', label: 'Inorganic Salt', value: '', unit: 'kg', confidence: 0.85 },
  { name: 'bmi', label: 'BMI (Body Mass Index)', value: '', unit: 'kg/m²', confidence: 0.9 },
  { name: 'waist_hip_ratio', label: 'Waist-Hip Ratio', value: '', unit: 'ratio', confidence: 0.85 },
  { name: 'bmr', label: 'Basal Metabolic Rate (BMR)', value: '', unit: 'kcal', confidence: 0.85 },
  { name: 'visceral_fat_level', label: 'Visceral Fat Level', value: '', unit: 'level', confidence: 0.8 },
  { name: 'health_score', label: 'Health Assessment Score', value: '', unit: 'score', confidence: 0.85 },
  { name: 'target_weight', label: 'Target Weight', value: '', unit: 'kg', confidence: 0.85 },
  { name: 'weight_control', label: 'Weight Control Target', value: '', unit: 'kg', confidence: 0.85 },
  { name: 'fat_control', label: 'Fat Control Target', value: '', unit: 'kg', confidence: 0.85 },
  { name: 'muscle_control', label: 'Muscle Control Target', value: '', unit: 'kg', confidence: 0.85 },
];

function isMandatoryField(name: string): boolean {
  return MANDATORY_KEYS.has(name) || MANDATORY_FAT_KEYS.has(name);
}

export const ExtractionReview: React.FC<ExtractionReviewProps> = ({ data, onConfirm, onCancel, isSaving }) => {
  const [items, setItems] = useState<MeasurementItem[]>([]);

  const derivedFieldsSet = new Set<string>(
    Array.isArray(data?.derivedFields) ? data.derivedFields : []
  );

  useEffect(() => {
    const parsedItems: MeasurementItem[] = [];
    const defaultConfidence: number = typeof data?.aiConfidence === 'number' ? data.aiConfidence : 0.85;

    if (data && data.measurements) {
      if (Array.isArray(data.measurements)) {
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
            isMandatory: isMandatoryField(nameStr),
            isDerived: derivedFieldsSet.has(nameStr),
          });
        }
      } else if (typeof data.measurements === 'object') {
        for (const key of Object.keys(data.measurements)) {
          const val: any = data.measurements[key];
          const nameStr: string = String(key || 'metric');
          const labelStr: string = formatLabel(nameStr);

          if (val && typeof val === 'object') {
            const vNum: number | string = (val.value ?? '') as (number | string);
            let uStr: string = String(val.unit || 'kg');
            if (nameStr.includes('pct') || nameStr.includes('percent')) uStr = '%';
            else if (nameStr === 'bmi') uStr = 'kg/m²';
            else if (nameStr.includes('visceral')) uStr = 'level';
            const cNum: number = typeof val.confidence === 'number' ? val.confidence : defaultConfidence;
            parsedItems.push({
              name: nameStr, label: labelStr, value: vNum, unit: uStr, confidence: cNum,
              isMandatory: isMandatoryField(nameStr),
              isDerived: derivedFieldsSet.has(nameStr),
            });
          } else {
            const vNum: number | string = (val ?? '') as (number | string);
            let uStr = 'kg';
            if (nameStr.includes('pct') || nameStr.includes('percent')) uStr = '%';
            else if (nameStr === 'bmi') uStr = 'kg/m²';
            else if (nameStr.includes('visceral')) uStr = 'level';
            else if (nameStr.includes('bmr')) uStr = 'kcal';
            else if (nameStr.includes('score')) uStr = 'score';
            else if (nameStr.includes('ratio')) uStr = 'ratio';
            parsedItems.push({
              name: nameStr, label: labelStr, value: vNum, unit: uStr, confidence: defaultConfidence,
              isMandatory: isMandatoryField(nameStr),
              isDerived: derivedFieldsSet.has(nameStr),
            });
          }
        }
      }
    }

    // Ensure mandatory fields always appear even if not extracted
    const existingNames = new Set(parsedItems.map(p => p.name));
    for (const def of DEFAULT_METRICS) {
      if (def.isMandatory && !existingNames.has(def.name)) {
        parsedItems.unshift({ ...def });
      }
    }

    // Sort: mandatory first, then derived, then others
    parsedItems.sort((a, b) => {
      if (a.isMandatory && !b.isMandatory) return -1;
      if (!a.isMandatory && b.isMandatory) return 1;
      return 0;
    });

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
    const item = items[index];
    // Prevent removing mandatory fields
    if (item?.isMandatory) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLabelChange = (index: number, newLabel: string) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      if (item) {
        const sanitizedKey = newLabel.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        updated[index] = {
          ...item,
          label: newLabel,
          name: sanitizedKey || item.name,
        };
      }
      return updated;
    });
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

  // Check if all mandatory fields are filled
  const getMissingMandatory = (): string[] => {
    const missing: string[] = [];
    for (const item of items) {
      if (MANDATORY_KEYS.has(item.name)) {
        if (item.value === '' || item.value === null || item.value === undefined) {
          missing.push(item.label);
        }
      }
    }
    // Check body fat: at least one of mass or pct
    const fatMassItem = items.find(i => i.name === 'body_fat_mass');
    const fatPctItem = items.find(i => i.name === 'body_fat_pct');
    const hasFatMass = fatMassItem && fatMassItem.value !== '' && fatMassItem.value !== null;
    const hasFatPct = fatPctItem && fatPctItem.value !== '' && fatPctItem.value !== null;
    if (!hasFatMass && !hasFatPct) {
      missing.push('Body Fat (Mass or %)');
    }
    return missing;
  };

  const missingMandatory = getMissingMandatory();
  const canConfirm = missingMandatory.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canConfirm) return;
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

  const renderDerivedBadge = () => (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
      Derived
    </span>
  );

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
                Verify or edit the extracted metrics below. Fields marked with ★ are required.
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

      {/* Missing Mandatory Warning */}
      {!canConfirm && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 flex items-start gap-3 shadow-inner">
          <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <span className="font-semibold text-rose-300">Required fields missing:</span>{' '}
            {missingMandatory.join(', ')}. Please fill in all required fields (★) before confirming.
          </div>
        </div>
      )}

      {/* Form List */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {items.map((item, idx) => {
            const isEmpty = item.value === '' || item.value === null || item.value === undefined;
            const isMissingMandatory = item.isMandatory && isEmpty;

            return (
              <div
                key={idx}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                  isMissingMandatory
                    ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60'
                    : 'bg-surface-950 border-surface-800 hover:border-surface-700'
                }`}
              >
                {/* Metric Label */}
                <div className="flex items-center gap-2.5 sm:w-1/3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    isMissingMandatory ? 'bg-rose-400 animate-pulse' : item.isMandatory ? 'bg-amber-400' : 'bg-brand-400'
                  }`}></span>
                  {item.isMandatory ? (
                    <span className="text-sm font-medium text-surface-200">
                      <span className="text-amber-400 mr-1">★</span>
                      {item.label}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={item.label}
                      placeholder="Metric Name"
                      onChange={(e) => handleLabelChange(idx, e.target.value)}
                      className="bg-transparent border-b border-surface-700 hover:border-surface-500 focus:border-brand-400 focus:outline-none text-sm font-medium text-surface-200 w-full px-1 py-0.5 transition-colors"
                    />
                  )}
                </div>

                {/* Inputs & Badges */}
                <div className="flex items-center gap-3 sm:w-2/3 justify-end">
                  <div className="relative flex-1 max-w-[160px]">
                    <input
                      type="number"
                      step="any"
                      placeholder={isMissingMandatory ? 'Required' : '0.0'}
                      value={item.value}
                      onChange={(e) => handleValueChange(idx, e.target.value)}
                      className={`w-full px-3 py-2 bg-surface-900 border rounded-lg text-sm text-white placeholder-surface-500 focus:outline-none focus:ring-1 transition-all font-mono ${
                        isMissingMandatory
                          ? 'border-rose-500/50 focus:border-rose-400 focus:ring-rose-400 placeholder-rose-400/50'
                          : 'border-surface-700 focus:border-brand-500 focus:ring-brand-500'
                      }`}
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
                    <option value="kcal" className="bg-surface-950 text-white">kcal</option>
                    <option value="level" className="bg-surface-950 text-white">level</option>
                    <option value="score" className="bg-surface-950 text-white">score</option>
                    <option value="ratio" className="bg-surface-950 text-white">ratio</option>
                    <option value="cm" className="bg-surface-950 text-white">cm</option>
                  </select>

                  <div className="hidden md:block w-20 text-right">
                    {item.isDerived ? renderDerivedBadge() : renderConfidenceBadge(item.confidence)}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    disabled={item.isMandatory}
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.isMandatory
                        ? 'text-surface-700 cursor-not-allowed'
                        : 'text-surface-500 hover:text-rose-400 hover:bg-rose-500/10'
                    }`}
                    title={item.isMandatory ? 'Required field cannot be removed' : 'Remove metric'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
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
            disabled={isSaving || !canConfirm}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all focus:outline-none ${
              canConfirm
                ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/20 disabled:opacity-50'
                : 'bg-surface-700 text-surface-400 cursor-not-allowed shadow-none'
            }`}
            title={!canConfirm ? 'Fill in all required fields (★) first' : ''}
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
                {canConfirm ? 'Confirm and Save' : 'Fill Required Fields (★)'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
