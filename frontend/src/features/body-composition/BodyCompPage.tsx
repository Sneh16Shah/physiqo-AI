import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bodyCompApi } from '../../api/bodycomp.api';
import { MeasurementGuideModal } from './components/MeasurementGuideModal';
import { TapeMeasurementModal, TapeMeasurementData } from './components/TapeMeasurementModal';
import { BodyCompTrendsTab } from './components/BodyCompTrendsTab';

interface Measurement {
  id?: string;
  metricName: string;
  metricValue: number;
  metricUnit: string;
  confidence?: number;
}

interface Report {
  id: string;
  reportDate: string;
  reportType: string;
  source: string;
  aiConfidence?: number;
  userReviewed?: boolean;
  measurements?: Measurement[];
  createdAt?: string;
}

const BodyCompPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'measurements' | 'trends'>('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Tape Measurements States
  const [tapeMeasurements, setTapeMeasurements] = useState<TapeMeasurementData[]>([]);
  const [tapeLoading, setTapeLoading] = useState<boolean>(false);
  const [selectedGuideKey, setSelectedGuideKey] = useState<string | null>(null);
  const [isTapeModalOpen, setIsTapeModalOpen] = useState<boolean>(false);
  const [editingTapeData, setEditingTapeData] = useState<TapeMeasurementData | null>(null);
  const [tapeUnit, setTapeUnit] = useState<'cm' | 'in'>('cm');
  const [tapeToDelete, setTapeToDelete] = useState<TapeMeasurementData | null>(null);
  const [deletingTapeId, setDeletingTapeId] = useState<string | null>(null);

  const fetchTapeMeasurements = async () => {
    setTapeLoading(true);
    try {
      const res = await bodyCompApi.getBodyMeasurements({ sort: 'measuredAt,desc' });
      const content = res.data?.content || res.data || [];
      setTapeMeasurements(Array.isArray(content) ? content : []);
    } catch (err) {
      console.error('Failed to fetch tape measurements:', err);
    } finally {
      setTapeLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'measurements') {
      fetchTapeMeasurements();
    }
  }, [activeTab]);

  const handleDeleteTape = async (id: string) => {
    setDeletingTapeId(id);
    try {
      await bodyCompApi.deleteBodyMeasurement(id);
      await fetchTapeMeasurements();
      setTapeToDelete(null);
    } catch (err) {
      console.error('Failed to delete tape measurement:', err);
    } finally {
      setDeletingTapeId(null);
    }
  };
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal states
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);

  // Edit modal states
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editType, setEditType] = useState<string>('INBODY');
  const [editItems, setEditItems] = useState<Array<{ metricName: string; metricValue: string | number; metricUnit: string }>>([]);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  const handleOpenEditModal = (report: Report) => {
    setEditingReport(report);
    const fallbackDate = new Date().toISOString().slice(0, 10);
    const dateStr: string = report.reportDate ? String(report.reportDate) : fallbackDate;
    setEditDate(dateStr);
    setEditType(report.reportType ? String(report.reportType) : 'INBODY');
    const items: Array<{ metricName: string; metricValue: string | number; metricUnit: string }> = (report.measurements || []).map(m => ({
      metricName: String(m.metricName || 'metric'),
      metricValue: m.metricValue ?? 0,
      metricUnit: String(m.metricUnit || 'kg'),
    }));
    setEditItems(items);
  };

  const handleAddEditItem = () => {
    setEditItems(prev => [
      ...prev,
      { metricName: `custom_metric_${prev.length + 1}`, metricValue: '', metricUnit: 'kg' }
    ]);
  };

  const handleRemoveEditItem = (index: number) => {
    setEditItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditItemChange = (index: number, field: 'metricName' | 'metricValue' | 'metricUnit', val: any) => {
    setEditItems(prev => {
      const copy = [...prev];
      const current = copy[index];
      if (!current) return prev;
      const updated: { metricName: string; metricValue: string | number; metricUnit: string } = {
        metricName: field === 'metricName' ? String(val) : current.metricName,
        metricValue: field === 'metricValue' ? val : current.metricValue,
        metricUnit: field === 'metricUnit' ? String(val) : current.metricUnit,
      };
      copy[index] = updated;
      return copy;
    });
  };

  const handleSaveEdit = async () => {
    if (!editingReport) return;
    try {
      setIsSavingEdit(true);
      const payload = {
        reportDate: editDate,
        reportType: editType,
        measurements: editItems
          .filter(item => item.metricName && item.metricValue !== '' && item.metricValue !== null && item.metricValue !== undefined)
          .map(item => ({
            metricName: item.metricName.toLowerCase().trim().replace(/\s+/g, '_'),
            metricValue: typeof item.metricValue === 'number' ? item.metricValue : parseFloat(String(item.metricValue)) || 0,
            metricUnit: item.metricUnit || 'kg'
          }))
      };

      await bodyCompApi.updateReport(editingReport.id, payload);
      setEditingReport(null);
      await fetchReports();
    } catch (err) {
      console.error('Failed to update report:', err);
      alert('Failed to update report. Please try again.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bodyCompApi.getReports({
        page: currentPage,
        size: pageSize,
        sort: 'reportDate,desc'
      });
      const data = res.data;
      if (data && Array.isArray(data.content)) {
        setReports(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || data.content.length);
      } else if (Array.isArray(data)) {
        setReports(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setReports([]);
        setTotalPages(1);
        setTotalElements(0);
      }
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Failed to load body composition reports:', err);
      setError('Failed to load reports. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, currentPage, pageSize]);

  const toggleSelectAll = () => {
    if (selectedIds.length === reports.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reports.map(r => r.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const confirmSingleDelete = async () => {
    if (!reportToDelete) return;
    const id = reportToDelete.id;
    
    try {
      setDeletingId(id);
      await bodyCompApi.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
      setReportToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError('Failed to delete report. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      setIsBulkDeleting(true);
      await Promise.all(selectedIds.map(id => bodyCompApi.deleteReport(id)));
      setReports(prev => prev.filter(r => !selectedIds.includes(r.id)));
      if (selectedReport && selectedIds.includes(selectedReport.id)) {
        setSelectedReport(null);
      }
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
    } catch (err: any) {
      console.error('Bulk delete error:', err);
      setError('Failed to delete selected reports. Please try again.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const getMetricDisplay = (report: Report, targetKeys: string[]): string => {
    if (!report.measurements || !Array.isArray(report.measurements)) return '--';
    const match = report.measurements.find(m =>
      targetKeys.some(k => m.metricName?.toLowerCase().includes(k.toLowerCase()))
    );
    if (match && match.metricValue != null) {
      return `${match.metricValue} ${match.metricUnit || ''}`;
    }
    return '--';
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Body Composition</h1>
          <p className="text-gray-400 text-sm mt-1">Track DEXA, InBody, and scale scan metrics over time</p>
        </div>
        <button 
          onClick={() => navigate('/body-composition/upload')}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-brand-600/20"
        >
          + Upload Scan
        </button>
      </div>

      <div className="flex space-x-4 border-b border-surface-800 pb-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-medium text-sm rounded-lg transition-all ${activeTab === 'reports' ? 'bg-surface-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('measurements')}
          className={`px-4 py-2 font-medium text-sm rounded-lg transition-all ${activeTab === 'measurements' ? 'bg-surface-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
        >
          Tape Measurements
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-2 font-medium text-sm rounded-lg transition-all ${activeTab === 'trends' ? 'bg-surface-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
        >
          Trends
        </button>
      </div>

      <div className="bg-surface-900 p-6 rounded-xl border border-surface-800 min-h-[400px]">
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">DEXA / InBody Reports</h2>
              <button 
                onClick={fetchReports}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                ↻ Refresh
              </button>
            </div>

            {/* Bulk Selection Action Bar */}
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between bg-surface-950 border border-brand-500/40 p-3.5 rounded-xl mb-4 animate-in fade-in shadow-lg">
                <span className="text-sm font-medium text-gray-200">
                  <span className="font-bold text-brand-400">{selectedIds.length}</span> of {reports.length} reports selected
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={() => setShowBulkDeleteModal(true)}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5"
                  >
                    🗑 Delete Selected ({selectedIds.length})
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-48 text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mr-3"></div>
                Loading reports...
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm text-center">
                {error}
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-surface-800 rounded-xl">
                <p className="text-gray-400 text-base font-medium">No body composition reports found</p>
                <p className="text-gray-500 text-sm mt-1">Upload an image of your scale display or DEXA report to track your metrics.</p>
                <button
                  onClick={() => navigate('/body-composition/upload')}
                  className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg"
                >
                  Upload First Scan
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                  <thead className="bg-surface-950 text-gray-300">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg w-10">
                        <input
                          type="checkbox"
                          checked={reports.length > 0 && selectedIds.length === reports.length}
                          onChange={toggleSelectAll}
                          title="Select / Deselect All"
                          className="w-4 h-4 rounded border-surface-700 bg-surface-900 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Weight</th>
                      <th className="px-4 py-3">Body Fat %</th>
                      <th className="px-4 py-3">Muscle Mass</th>
                      <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-800">
                    {reports.map((report) => (
                      <tr 
                        key={report.id} 
                        className={`transition-colors ${selectedIds.includes(report.id) ? 'bg-surface-800/80' : 'hover:bg-surface-800/50'}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(report.id)}
                            onChange={() => toggleSelectOne(report.id)}
                            className="w-4 h-4 rounded border-surface-700 bg-surface-900 text-brand-600 focus:ring-brand-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-white">{report.reportDate}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-surface-800 text-gray-300">
                            {report.reportType || 'INBODY'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white font-medium">
                          {getMetricDisplay(report, ['weight'])}
                        </td>
                        <td className="px-4 py-3 text-white font-medium">
                          {getMetricDisplay(report, ['body_fat_pct', 'body_fat_percentage', 'fat_pct'])}
                        </td>
                        <td className="px-4 py-3 text-white font-medium">
                          {getMetricDisplay(report, ['skeletal_muscle_mass', 'muscle_mass', 'fat_free_mass'])}
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => setSelectedReport(report)}
                            className="text-brand-400 hover:text-brand-300 font-semibold hover:underline mr-3 transition-colors"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleOpenEditModal(report)}
                            className="text-amber-400 hover:text-amber-300 font-semibold hover:underline mr-3 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => setReportToDelete(report)}
                            className="text-red-400 hover:text-red-300 font-semibold hover:underline transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-surface-800 text-sm text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="text-xs">Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(0);
                      }}
                      className="bg-surface-950 border border-surface-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                    <span className="text-xs text-gray-500">
                      Showing {reports.length > 0 ? currentPage * pageSize + 1 : 0} - {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0 || loading}
                      className="px-3 py-1.5 bg-surface-950 border border-surface-800 hover:bg-surface-800 text-gray-300 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      ← Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i).map((pageIdx) => (
                        <button
                          key={pageIdx}
                          onClick={() => setCurrentPage(pageIdx)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                            currentPage === pageIdx
                              ? 'bg-brand-600 text-white'
                              : 'bg-surface-950 text-gray-400 hover:bg-surface-800 hover:text-white'
                          }`}
                        >
                          {pageIdx + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage >= totalPages - 1 || loading}
                      className="px-3 py-1.5 bg-surface-950 border border-surface-800 hover:bg-surface-800 text-gray-300 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'measurements' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-950 p-5 rounded-2xl border border-surface-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>📏</span> Tape Measurements
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Track circumferential changes across 11 key body landmarks ({tapeUnit.toUpperCase()})
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Unit Switcher */}
                <div className="bg-surface-900 border border-surface-800 p-1 rounded-xl flex items-center gap-1">
                  <button
                    onClick={() => setTapeUnit('cm')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      tapeUnit === 'cm' ? 'bg-brand-600 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    cm
                  </button>
                  <button
                    onClick={() => setTapeUnit('in')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      tapeUnit === 'in' ? 'bg-brand-600 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    in
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingTapeData(null);
                    setIsTapeModalOpen(true);
                  }}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-600/20 transition-all flex items-center gap-1.5"
                >
                  + Log Tape Measurement
                </button>
              </div>
            </div>

            {/* 11 Body Parts Grid */}
            {tapeLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 11 }).map((_, i) => (
                  <div key={i} className="h-32 bg-surface-950 rounded-xl border border-surface-800 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(() => {
                  const latestTape: any = tapeMeasurements[0] || null;
                  const prevTape: any = tapeMeasurements[1] || null;

                  const bodyParts = [
                    { key: 'neck', name: 'Neck', guideKey: 'neck', field: 'neckCm', icon: '👤', category: 'Upper Body' },
                    { key: 'chest', name: 'Chest', guideKey: 'chest', field: 'chestCm', icon: '🎽', category: 'Upper Body' },
                    { key: 'leftBicep', name: 'Left Bicep', guideKey: 'leftBicep', field: 'leftBicepCm', icon: '💪', category: 'Arms' },
                    { key: 'rightBicep', name: 'Right Bicep', guideKey: 'rightBicep', field: 'rightBicepCm', icon: '💪', category: 'Arms' },
                    { key: 'waist', name: 'Waist', guideKey: 'waist', field: 'waistCm', icon: '📏', category: 'Core' },
                    { key: 'belly', name: 'Belly (Abdomen)', guideKey: 'belly', field: 'bellyCm', icon: '🎯', category: 'Core' },
                    { key: 'hips', name: 'Hips', guideKey: 'hips', field: 'hipsCm', icon: '👖', category: 'Lower Body' },
                    { key: 'leftThigh', name: 'Left Thigh', guideKey: 'leftThigh', field: 'leftThighCm', icon: '🦵', category: 'Legs' },
                    { key: 'rightThigh', name: 'Right Thigh', guideKey: 'rightThigh', field: 'rightThighCm', icon: '🦵', category: 'Legs' },
                    { key: 'leftCalf', name: 'Left Calf', guideKey: 'leftCalf', field: 'leftCalfCm', icon: '🦶', category: 'Legs' },
                    { key: 'rightCalf', name: 'Right Calf', guideKey: 'rightCalf', field: 'rightCalfCm', icon: '🦶', category: 'Legs' },
                  ];

                  return bodyParts.map((part) => {
                    const currCm = latestTape ? latestTape[part.field] : null;
                    const prevCm = prevTape ? prevTape[part.field] : null;

                    let displayValue = '--';
                    if (currCm != null) {
                      displayValue = tapeUnit === 'in' 
                        ? `${(currCm / 2.54).toFixed(1)} in` 
                        : `${currCm.toFixed(1)} cm`;
                    }

                    // Diff calculation
                    let diffText: string | null = null;
                    let diffColor = 'text-gray-400';
                    if (currCm != null && prevCm != null) {
                      const deltaCm = currCm - prevCm;
                      if (Math.abs(deltaCm) >= 0.05) {
                        if (tapeUnit === 'in') {
                          const deltaIn = deltaCm / 2.54;
                          diffText = `${deltaIn > 0 ? '+' : ''}${deltaIn.toFixed(1)} in`;
                        } else {
                          diffText = `${deltaCm > 0 ? '+' : ''}${deltaCm.toFixed(1)} cm`;
                        }
                        diffColor = deltaCm > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-indigo-400 bg-indigo-500/10';
                      }
                    }

                    return (
                      <div
                        key={part.key}
                        className="bg-surface-950 p-4 rounded-2xl border border-surface-800 hover:border-surface-700 transition-all flex flex-col justify-between space-y-3 group relative"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                              {part.category}
                            </span>
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                              <span>{part.icon}</span> {part.name}
                            </h4>
                          </div>
                          {diffText && (
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md font-mono ${diffColor}`}>
                              {diffText}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="text-2xl font-bold text-white font-mono">
                            {displayValue}
                          </div>
                          {latestTape?.measuredAt && currCm != null && (
                            <p className="text-[10px] text-gray-400 mt-1">
                              Logged on {new Date(latestTape.measuredAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-surface-800/80 flex justify-between items-center text-xs">
                          <button
                            onClick={() => setSelectedGuideKey(part.guideKey)}
                            className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline"
                          >
                            📷 How to Measure
                          </button>
                          {latestTape && (
                            <button
                              onClick={() => {
                                setEditingTapeData(latestTape);
                                setIsTapeModalOpen(true);
                              }}
                              className="text-gray-400 hover:text-white font-medium"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {/* Tape Measurement History Log */}
            <div className="bg-surface-950 rounded-2xl border border-surface-800 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Measurement History</h3>
                <span className="text-xs text-gray-400 font-mono">{tapeMeasurements.length} records</span>
              </div>

              {tapeMeasurements.length === 0 ? (
                <div className="text-center py-10 text-gray-400 space-y-2">
                  <p className="text-sm">No tape measurements recorded yet.</p>
                  <button
                    onClick={() => {
                      setEditingTapeData(null);
                      setIsTapeModalOpen(true);
                    }}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl"
                  >
                    + Log Your First Measurement
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-surface-900 text-gray-400 uppercase tracking-wider text-[10px] border-b border-surface-800">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Weight</th>
                        <th className="p-3">Chest</th>
                        <th className="p-3">Waist</th>
                        <th className="p-3">Belly</th>
                        <th className="p-3">Hips</th>
                        <th className="p-3">Biceps (L/R)</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-800/60 font-mono">
                      {tapeMeasurements.map((m) => {
                        const fmt = (v?: number) => {
                          if (v == null) return '--';
                          return tapeUnit === 'in' ? `${(v / 2.54).toFixed(1)}in` : `${v.toFixed(1)}cm`;
                        };

                        return (
                          <tr key={m.id} className="hover:bg-surface-900/50 transition-colors">
                            <td className="p-3 font-sans font-semibold text-white">
                              {m.measuredAt ? new Date(m.measuredAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-3 text-amber-400">
                              {m.weightKg ? `${m.weightKg} kg` : '--'}
                            </td>
                            <td className="p-3">{fmt(m.chestCm)}</td>
                            <td className="p-3">{fmt(m.waistCm)}</td>
                            <td className="p-3">{fmt(m.bellyCm)}</td>
                            <td className="p-3">{fmt(m.hipsCm)}</td>
                            <td className="p-3">
                              {fmt(m.leftBicepCm)} / {fmt(m.rightBicepCm)}
                            </td>
                            <td className="p-3 text-right font-sans">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingTapeData(m);
                                    setIsTapeModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 bg-surface-900 border border-surface-700 hover:bg-surface-800 text-gray-300 rounded-lg text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => setTapeToDelete(m)}
                                  className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg text-xs"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <BodyCompTrendsTab
            reports={reports}
            tapeMeasurements={tapeMeasurements}
            tapeUnit={tapeUnit}
          />
        )}
      </div>

      {/* View Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-surface-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Body Composition Details</h3>
                <p className="text-xs text-gray-400 mt-0.5">Date: {selectedReport.reportDate} • Source: {selectedReport.source || 'OCR'}</p>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-surface-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {!selectedReport.measurements || selectedReport.measurements.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No measurements recorded for this report.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const map: Record<string, { value: any; unit: string }> = {};
                    selectedReport.measurements.forEach(m => {
                      if (m && m.metricName) {
                        map[m.metricName] = { value: m.metricValue, unit: m.metricUnit || '' };
                      }
                    });

                    const cards: Array<{ label: string; displayValue: string }> = [];
                    const processed = new Set<string>();

                    // 1. Combine Fat Mass + Fat Pct
                    if (map['body_fat_mass'] || map['body_fat_pct']) {
                      const mass = map['body_fat_mass']?.value;
                      const pct = map['body_fat_pct']?.value;
                      let displayStr = '';
                      if (mass != null && pct != null) {
                        displayStr = `${mass} kg (${pct}%)`;
                      } else if (mass != null) {
                        displayStr = `${mass} kg`;
                      } else {
                        displayStr = `${pct}%`;
                      }
                      cards.push({ label: 'Body Fat', displayValue: displayStr });
                      processed.add('body_fat_mass');
                      processed.add('body_fat_pct');
                    }

                    // 2. Combine Water Content + Water Pct
                    if (map['water_content'] || map['water_pct']) {
                      const mass = map['water_content']?.value;
                      const pct = map['water_pct']?.value;
                      let displayStr = '';
                      if (mass != null && pct != null) {
                        displayStr = `${mass} kg (${pct}%)`;
                      } else if (mass != null) {
                        displayStr = `${mass} kg`;
                      } else {
                        displayStr = `${pct}%`;
                      }
                      cards.push({ label: 'Water Content', displayValue: displayStr });
                      processed.add('water_content');
                      processed.add('water_pct');
                    }

                    // 3. Render all other metrics
                    selectedReport.measurements.forEach(m => {
                      if (m && m.metricName && !processed.has(m.metricName)) {
                        const formattedLabel = m.metricName
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, c => c.toUpperCase());
                        cards.push({
                          label: formattedLabel,
                          displayValue: `${m.metricValue} ${m.metricUnit || ''}`.trim()
                        });
                        processed.add(m.metricName);
                      }
                    });

                    return cards.map((card, idx) => (
                      <div key={idx} className="bg-surface-950 p-3 rounded-xl border border-surface-800/80">
                        <div className="text-xs text-gray-400 font-medium">
                          {card.label}
                        </div>
                        <div className="text-lg font-bold text-white mt-0.5">
                          {card.displayValue}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-surface-800">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Report Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Report</h3>
                <p className="text-xs text-gray-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-gray-300">
              Are you sure you want to delete the body composition report from <span className="font-semibold text-white">{reportToDelete.reportDate}</span>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReportToDelete(null)}
                disabled={deletingId === reportToDelete.id}
                className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-gray-300 text-sm font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSingleDelete}
                disabled={deletingId === reportToDelete.id}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {deletingId === reportToDelete.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Report'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Selected Reports</h3>
                <p className="text-xs text-gray-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-gray-300">
              Are you sure you want to delete <span className="font-bold text-white">{selectedIds.length}</span> selected body composition reports?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isBulkDeleting}
                className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-gray-300 text-sm font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={isBulkDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {isBulkDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting {selectedIds.length} Reports...
                  </>
                ) : (
                  `Delete All (${selectedIds.length})`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Report Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-surface-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Edit Body Composition Report</h3>
                <p className="text-xs text-gray-400 mt-0.5">Modify parameters or update scan date</p>
              </div>
              <button 
                onClick={() => setEditingReport(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-surface-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Report Date
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Report Type
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full bg-surface-950 border border-surface-700 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
                >
                  <option value="INBODY">INBODY</option>
                  <option value="DEXA">DEXA</option>
                  <option value="TANITA">TANITA</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Measurements
                </label>
                <button
                  type="button"
                  onClick={handleAddEditItem}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  + Add Metric
                </button>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {editItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-surface-950 p-2.5 rounded-xl border border-surface-800">
                    <input
                      type="text"
                      value={item.metricName.replace(/_/g, ' ')}
                      placeholder="Metric Name"
                      onChange={(e) => handleEditItemChange(idx, 'metricName', e.target.value)}
                      className="bg-transparent border-b border-surface-700 focus:border-brand-400 text-xs font-medium text-surface-200 w-1/3 px-1 py-1 focus:outline-none capitalize"
                    />
                    <input
                      type="number"
                      step="any"
                      value={item.metricValue}
                      placeholder="Value"
                      onChange={(e) => handleEditItemChange(idx, 'metricValue', e.target.value)}
                      className="bg-surface-900 border border-surface-700 text-white text-xs rounded-lg px-2 py-1.5 w-1/3 focus:outline-none focus:border-brand-500 font-mono"
                    />
                    <select
                      value={item.metricUnit}
                      onChange={(e) => handleEditItemChange(idx, 'metricUnit', e.target.value)}
                      className="bg-surface-900 border border-surface-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-500"
                    >
                      <option value="kg">kg</option>
                      <option value="%">%</option>
                      <option value="kg/m²">kg/m²</option>
                      <option value="kcal">kcal</option>
                      <option value="ratio">ratio</option>
                      <option value="score">score</option>
                      <option value="level">level</option>
                      <option value="cm">cm</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveEditItem(idx)}
                      className="text-gray-500 hover:text-red-400 p-1 transition-colors ml-auto text-xs"
                      title="Remove metric"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-surface-800">
              <button
                type="button"
                onClick={() => setEditingReport(null)}
                disabled={isSavingEdit}
                className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-gray-300 text-sm font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-brand-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingEdit ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Measurement Guide Modal */}
      <MeasurementGuideModal
        guideKey={selectedGuideKey}
        onClose={() => setSelectedGuideKey(null)}
      />

      {/* Tape Measurement Add/Edit Modal */}
      {isTapeModalOpen && (
        <TapeMeasurementModal
          initialData={editingTapeData}
          unit={tapeUnit}
          onClose={() => {
            setIsTapeModalOpen(false);
            setEditingTapeData(null);
          }}
          onSaved={() => fetchTapeMeasurements()}
        />
      )}

      {/* Tape Delete Confirmation Modal */}
      {tapeToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Delete Tape Measurement</h3>
            <p className="text-xs text-gray-300">
              Are you sure you want to delete the tape measurement entry recorded on{' '}
              <strong className="text-white">
                {tapeToDelete.measuredAt ? new Date(tapeToDelete.measuredAt).toLocaleDateString() : 'N/A'}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-surface-800">
              <button
                onClick={() => setTapeToDelete(null)}
                disabled={deletingTapeId != null}
                className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-gray-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => tapeToDelete.id && handleDeleteTape(tapeToDelete.id)}
                disabled={deletingTapeId != null}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-red-600/20"
              >
                {deletingTapeId ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyCompPage;
