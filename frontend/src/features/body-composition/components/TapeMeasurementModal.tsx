import React, { useState, useEffect } from 'react';
import { bodyCompApi } from '../../../api/bodycomp.api';

export interface TapeMeasurementData {
  id?: string;
  measuredAt?: string;
  weightKg?: number;
  neckCm?: number;
  chestCm?: number;
  waistCm?: number;
  bellyCm?: number;
  hipsCm?: number;
  leftBicepCm?: number;
  rightBicepCm?: number;
  leftThighCm?: number;
  rightThighCm?: number;
  leftCalfCm?: number;
  rightCalfCm?: number;
  notes?: string;
}

interface Props {
  initialData?: TapeMeasurementData | null;
  onClose: () => void;
  onSaved: () => void;
  unit: 'cm' | 'in';
}

type BodyPartKey = 
  | 'neck' 
  | 'chest' 
  | 'leftBicep' 
  | 'rightBicep' 
  | 'waist' 
  | 'belly' 
  | 'hips' 
  | 'leftThigh' 
  | 'rightThigh' 
  | 'leftCalf' 
  | 'rightCalf';

interface FieldState {
  val: string;
  unit: 'cm' | 'in';
}

export const TapeMeasurementModal: React.FC<Props> = ({ initialData, onClose, onSaved, unit: defaultUnit }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [weightKg, setWeightKg] = useState<string>('');
  const [activeGlobalUnit, setActiveGlobalUnit] = useState<'cm' | 'in'>(defaultUnit || 'cm');

  // Per-field states holding value and unit
  const [fields, setFields] = useState<Record<BodyPartKey, FieldState>>({
    neck: { val: '', unit: defaultUnit || 'cm' },
    chest: { val: '', unit: defaultUnit || 'cm' },
    leftBicep: { val: '', unit: defaultUnit || 'cm' },
    rightBicep: { val: '', unit: defaultUnit || 'cm' },
    waist: { val: '', unit: defaultUnit || 'cm' },
    belly: { val: '', unit: defaultUnit || 'cm' },
    hips: { val: '', unit: defaultUnit || 'cm' },
    leftThigh: { val: '', unit: defaultUnit || 'cm' },
    rightThigh: { val: '', unit: defaultUnit || 'cm' },
    leftCalf: { val: '', unit: defaultUnit || 'cm' },
    rightCalf: { val: '', unit: defaultUnit || 'cm' },
  });

  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Helper to format initial cm value into the specified unit
  const formatInitialValue = (valCm?: number, targetUnit: 'cm' | 'in' = 'cm'): string => {
    if (valCm == null) return '';
    if (targetUnit === 'in') return (valCm / 2.54).toFixed(1);
    return valCm.toString();
  };

  useEffect(() => {
    if (initialData) {
      if (initialData.measuredAt) {
        setDate(new Date(initialData.measuredAt).toISOString().slice(0, 10));
      }
      setWeightKg(initialData.weightKg != null ? initialData.weightKg.toString() : '');
      setNotes(initialData.notes || '');

      setFields({
        neck: { val: formatInitialValue(initialData.neckCm, defaultUnit), unit: defaultUnit },
        chest: { val: formatInitialValue(initialData.chestCm, defaultUnit), unit: defaultUnit },
        leftBicep: { val: formatInitialValue(initialData.leftBicepCm, defaultUnit), unit: defaultUnit },
        rightBicep: { val: formatInitialValue(initialData.rightBicepCm, defaultUnit), unit: defaultUnit },
        waist: { val: formatInitialValue(initialData.waistCm, defaultUnit), unit: defaultUnit },
        belly: { val: formatInitialValue(initialData.bellyCm, defaultUnit), unit: defaultUnit },
        hips: { val: formatInitialValue(initialData.hipsCm, defaultUnit), unit: defaultUnit },
        leftThigh: { val: formatInitialValue(initialData.leftThighCm, defaultUnit), unit: defaultUnit },
        rightThigh: { val: formatInitialValue(initialData.rightThighCm, defaultUnit), unit: defaultUnit },
        leftCalf: { val: formatInitialValue(initialData.leftCalfCm, defaultUnit), unit: defaultUnit },
        rightCalf: { val: formatInitialValue(initialData.rightCalfCm, defaultUnit), unit: defaultUnit },
      });
    }
  }, [initialData, defaultUnit]);

  // Convert individual field value when unit is toggled
  const toggleFieldUnit = (key: BodyPartKey, targetUnit: 'cm' | 'in') => {
    setFields((prev) => {
      const current = prev[key];
      if (current.unit === targetUnit) return prev;

      let newVal = current.val;
      if (current.val && current.val.trim() !== '') {
        const num = parseFloat(current.val);
        if (!isNaN(num)) {
          if (targetUnit === 'in') {
            // cm -> in
            newVal = (num / 2.54).toFixed(1);
          } else {
            // in -> cm
            newVal = (num * 2.54).toFixed(1);
          }
        }
      }

      return {
        ...prev,
        [key]: { val: newVal, unit: targetUnit },
      };
    });
  };

  // Set all fields unit globally
  const setAllUnits = (targetUnit: 'cm' | 'in') => {
    setActiveGlobalUnit(targetUnit);
    setFields((prev) => {
      const updated: Record<string, FieldState> = {};
      (Object.keys(prev) as BodyPartKey[]).forEach((key) => {
        const current = prev[key];
        let newVal = current.val;
        if (current.unit !== targetUnit && current.val && current.val.trim() !== '') {
          const num = parseFloat(current.val);
          if (!isNaN(num)) {
            newVal = targetUnit === 'in' ? (num / 2.54).toFixed(1) : (num * 2.54).toFixed(1);
          }
        }
        updated[key] = { val: newVal, unit: targetUnit };
      });
      return updated as Record<BodyPartKey, FieldState>;
    });
  };

  const updateFieldValue = (key: BodyPartKey, val: string) => {
    setFields((prev) => ({
      ...prev,
      [key]: { ...prev[key], val },
    }));
  };

  // Convert field state to cm for persistence
  const fieldToCm = (field: FieldState): number | null => {
    if (!field.val || field.val.trim() === '') return null;
    const num = parseFloat(field.val);
    if (isNaN(num)) return null;
    if (field.unit === 'in') return parseFloat((num * 2.54).toFixed(2));
    return parseFloat(num.toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: any = {
        measuredAt: new Date(date).toISOString(),
        weightKg: weightKg ? parseFloat(weightKg) : null,
        neckCm: fieldToCm(fields.neck),
        chestCm: fieldToCm(fields.chest),
        waistCm: fieldToCm(fields.waist),
        bellyCm: fieldToCm(fields.belly),
        hipsCm: fieldToCm(fields.hips),
        leftBicepCm: fieldToCm(fields.leftBicep),
        rightBicepCm: fieldToCm(fields.rightBicep),
        leftThighCm: fieldToCm(fields.leftThigh),
        rightThighCm: fieldToCm(fields.rightThigh),
        leftCalfCm: fieldToCm(fields.leftCalf),
        rightCalfCm: fieldToCm(fields.rightCalf),
        notes: notes || null,
      };

      if (initialData?.id) {
        await bodyCompApi.updateBodyMeasurement(initialData.id, payload);
      } else {
        await bodyCompApi.createBodyMeasurement(payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Failed to save tape measurement:', err);
      setError('Failed to save measurement. Please verify input values and try again.');
    } finally {
      setSaving(false);
    }
  };

  const fieldConfigs: { key: BodyPartKey; label: string }[] = [
    { key: 'neck', label: 'Neck' },
    { key: 'chest', label: 'Chest' },
    { key: 'leftBicep', label: 'Left Bicep' },
    { key: 'rightBicep', label: 'Right Bicep' },
    { key: 'waist', label: 'Waist' },
    { key: 'belly', label: 'Belly / Abdomen' },
    { key: 'hips', label: 'Hips' },
    { key: 'leftThigh', label: 'Left Thigh' },
    { key: 'rightThigh', label: 'Right Thigh' },
    { key: 'leftCalf', label: 'Left Calf' },
    { key: 'rightCalf', label: 'Right Calf' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs flex justify-center items-start p-3 sm:p-6"
      onClick={onClose}
    >
      <div 
        className="relative my-auto bg-surface-900 border border-surface-700/80 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Absolute Top-Right Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3.5 right-3.5 z-20 w-9 h-9 text-gray-400 hover:text-white bg-surface-800/90 hover:bg-surface-700 rounded-full border border-surface-600 transition-all flex items-center justify-center font-bold text-base shadow-lg cursor-pointer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 pr-14 border-b border-surface-800 bg-surface-900 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white">
              {initialData?.id ? 'Edit Tape Measurement' : 'Log Tape Measurement'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Record circumference measurements across all 11 body parts
            </p>
          </div>
        </div>

        {/* Scrollable Form Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between custom-scrollbar">
          <div className="p-4 sm:p-5 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Measurement Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Weight (kg, optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 72.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            {/* Body Parts Section with Global & Per-Field Unit Switchers */}
            <div>
              <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider">
                  Body Parts
                </h4>

                {/* Global Unit Switcher inside Modal */}
                <div className="flex items-center gap-2 bg-surface-950 px-2.5 py-1 rounded-xl border border-surface-800">
                  <span className="text-[11px] font-medium text-gray-400">Unit:</span>
                  <div className="flex bg-surface-900 border border-surface-700 rounded-lg p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setAllUnits('cm')}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        activeGlobalUnit === 'cm'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      cm
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllUnits('in')}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        activeGlobalUnit === 'in'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      inch (in)
                    </button>
                  </div>
                </div>
              </div>

              {/* 11-Part Grid with Individual Field Unit Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fieldConfigs.map(({ key, label }) => {
                  const field = fields[key];
                  return (
                    <div key={key} className="bg-surface-950 p-2.5 rounded-xl border border-surface-800 flex flex-col justify-between">
                      <div className="flex justify-between items-center mb-1.5 gap-1">
                        <label className="text-[11px] font-medium text-gray-300 truncate">
                          {label}
                        </label>
                        {/* Per-Field Unit Toggle */}
                        <div className="flex bg-surface-900 border border-surface-700 rounded p-0.5 text-[10px] shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleFieldUnit(key, 'cm')}
                            className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                              field.unit === 'cm'
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                          >
                            cm
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFieldUnit(key, 'in')}
                            className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                              field.unit === 'in'
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                          >
                            in
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={field.val}
                          onChange={(e) => updateFieldValue(key, e.target.value)}
                          className="w-full bg-surface-900 border border-surface-700 text-white text-sm rounded-lg pl-2.5 pr-8 py-1.5 focus:outline-none focus:border-brand-500 font-mono"
                        />
                        <span className="absolute right-2.5 top-2 text-[10px] text-gray-400 font-mono pointer-events-none uppercase">
                          {field.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Notes / Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Add optional notes (e.g., Morning measurement, post-workout pump)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-surface-950 border border-surface-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-3.5 px-5 border-t border-surface-800 bg-surface-900 shrink-0 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-gray-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-brand-600/20 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Measurements'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
