import React, { useState, useMemo } from 'react';
import { TapeMeasurementData } from './TapeMeasurementModal';

interface MetricPoint {
  dateStr: string;
  dateObj: Date;
  value: number;
  unit: string;
}

interface Props {
  reports: Array<{
    id: string;
    reportDate: string;
    measurements?: Array<{
      metricName: string;
      metricValue: number;
      metricUnit?: string;
    }>;
  }>;
  tapeMeasurements: TapeMeasurementData[];
  tapeUnit: 'cm' | 'in';
}

export const BodyCompTrendsTab: React.FC<Props> = ({ reports, tapeMeasurements, tapeUnit }) => {
  const [sourceType, setSourceType] = useState<'scans' | 'tape'>('scans');
  const [selectedScanMetric, setSelectedScanMetric] = useState<string>('weight');
  const [selectedTapeMetric, setSelectedTapeMetric] = useState<string>('bellyCm');
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('ALL');
  const [hoveredPoint, setHoveredPoint] = useState<MetricPoint | null>(null);

  // Scan metrics available
  const scanMetricOptions = [
    { key: 'weight', label: 'Body Weight', aliases: ['weight', 'body_weight'], unit: 'kg' },
    { key: 'body_fat_pct', label: 'Body Fat %', aliases: ['body_fat_pct', 'fat_pct', 'fat_percent'], unit: '%' },
    { key: 'body_fat_mass', label: 'Body Fat Mass', aliases: ['body_fat_mass', 'fat_mass'], unit: 'kg' },
    { key: 'skeletal_muscle_mass', label: 'Skeletal Muscle Mass', aliases: ['skeletal_muscle_mass', 'muscle_mass', 'smm'], unit: 'kg' },
    { key: 'water_content', label: 'Water Content', aliases: ['water_content', 'tbw', 'total_body_water'], unit: 'kg' },
  ];

  // Tape metrics available
  const tapeMetricOptions = [
    { key: 'bellyCm', label: 'Belly / Abdomen', cmProp: 'bellyCm' },
    { key: 'waistCm', label: 'Waist', cmProp: 'waistCm' },
    { key: 'chestCm', label: 'Chest', cmProp: 'chestCm' },
    { key: 'leftBicepCm', label: 'Left Bicep', cmProp: 'leftBicepCm' },
    { key: 'rightBicepCm', label: 'Right Bicep', cmProp: 'rightBicepCm' },
    { key: 'hipsCm', label: 'Hips', cmProp: 'hipsCm' },
    { key: 'leftThighCm', label: 'Left Thigh', cmProp: 'leftThighCm' },
    { key: 'rightThighCm', label: 'Right Thigh', cmProp: 'rightThighCm' },
    { key: 'leftCalfCm', label: 'Left Calf', cmProp: 'leftCalfCm' },
    { key: 'rightCalfCm', label: 'Right Calf', cmProp: 'rightCalfCm' },
    { key: 'neckCm', label: 'Neck', cmProp: 'neckCm' },
  ];

  // Extract raw data points based on source and selected metric
  const rawPoints = useMemo(() => {
    const points: MetricPoint[] = [];

    if (sourceType === 'scans') {
      const option = scanMetricOptions.find((o) => o.key === selectedScanMetric);
      if (!option) return [];

      reports.forEach((rep) => {
        if (!rep.reportDate || !rep.measurements) return;
        const matchingMeas = rep.measurements.find((m) =>
          option.aliases.some((alias) => m.metricName?.toLowerCase().includes(alias))
        );

        if (matchingMeas && matchingMeas.metricValue != null && !isNaN(matchingMeas.metricValue)) {
          points.push({
            dateStr: rep.reportDate,
            dateObj: new Date(rep.reportDate),
            value: matchingMeas.metricValue,
            unit: matchingMeas.metricUnit || option.unit,
          });
        }
      });
    } else {
      const option = tapeMetricOptions.find((o) => o.key === selectedTapeMetric);
      if (!option) return [];

      tapeMeasurements.forEach((tm) => {
        if (!tm.measuredAt) return;
        const valCm = (tm as any)[option.cmProp];
        if (valCm != null && !isNaN(valCm)) {
          let displayVal = valCm;
          let displayUnit = 'cm';

          if (tapeUnit === 'in') {
            displayVal = parseFloat((valCm / 2.54).toFixed(1));
            displayUnit = 'in';
          }

          points.push({
            dateStr: new Date(tm.measuredAt).toISOString().slice(0, 10),
            dateObj: new Date(tm.measuredAt),
            value: displayVal,
            unit: displayUnit,
          });
        }
      });
    }

    // Sort ascending by date
    return points.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [sourceType, selectedScanMetric, selectedTapeMetric, reports, tapeMeasurements, tapeUnit]);

  // Filter points by timeframe
  const filteredPoints = useMemo(() => {
    if (timeframe === 'ALL' || rawPoints.length === 0) return rawPoints;

    const now = new Date();
    const cutoff = new Date();

    if (timeframe === '1M') cutoff.setMonth(now.getMonth() - 1);
    else if (timeframe === '3M') cutoff.setMonth(now.getMonth() - 3);
    else if (timeframe === '6M') cutoff.setMonth(now.getMonth() - 6);
    else if (timeframe === '1Y') cutoff.setFullYear(now.getFullYear() - 1);

    return rawPoints.filter((p) => p.dateObj >= cutoff);
  }, [rawPoints, timeframe]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredPoints.length === 0) return null;

    const values = filteredPoints.map((p) => p.value);
    const startVal = values[0] ?? 0;
    const latestVal = values[values.length - 1] ?? 0;
    const diff = latestVal - startVal;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((acc, v) => acc + v, 0) / values.length;
    const unit = filteredPoints[0]?.unit || '';

    return {
      startVal,
      latestVal,
      diff,
      min,
      max,
      avg,
      unit,
      count: filteredPoints.length,
    };
  }, [filteredPoints]);

  // SVG Chart Dimensions & Calculation
  const chartHeight = 240;
  const chartWidth = 700;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };

  const svgCoords = useMemo(() => {
    if (filteredPoints.length === 0) return [];

    const values = filteredPoints.map((p) => p.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    // Padding Y scale slightly
    const valSpan = maxVal - minVal || 1;
    const yMin = Math.max(0, minVal - valSpan * 0.1);
    const yMax = maxVal + valSpan * 0.1;

    const drawWidth = chartWidth - padding.left - padding.right;
    const drawHeight = chartHeight - padding.top - padding.bottom;

    return filteredPoints.map((p, idx) => {
      const x =
        filteredPoints.length === 1
          ? padding.left + drawWidth / 2
          : padding.left + (idx / (filteredPoints.length - 1)) * drawWidth;

      const yRatio = (p.value - yMin) / (yMax - yMin || 1);
      const y = padding.top + drawHeight - yRatio * drawHeight;

      return { x, y, point: p };
    });
  }, [filteredPoints]);

  // Generate SVG path d string
  const pathD = useMemo(() => {
    if (svgCoords.length === 0) return '';
    return svgCoords.reduce((acc, coord, idx) => {
      return idx === 0 ? `M ${coord.x} ${coord.y}` : `${acc} L ${coord.x} ${coord.y}`;
    }, '');
  }, [svgCoords]);

  // Generate Area Fill d string
  const areaD = useMemo(() => {
    if (svgCoords.length === 0) return '';
    const firstX = svgCoords[0]?.x || 0;
    const lastX = svgCoords[svgCoords.length - 1]?.x || 0;
    const bottomY = chartHeight - padding.bottom;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [svgCoords, pathD]);

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-surface-800 pb-5">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📈</span> Progress Trends & Analytics
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Visualize body composition changes over time across scans and tape measurements
          </p>
        </div>

        {/* Source Toggle (Scans vs Tape) */}
        <div className="flex bg-surface-950 p-1 rounded-xl border border-surface-800 text-xs">
          <button
            onClick={() => setSourceType('scans')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              sourceType === 'scans'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Body Comp Scans
          </button>
          <button
            onClick={() => setSourceType('tape')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              sourceType === 'tape'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Tape Measurements
          </button>
        </div>
      </div>

      {/* Selector & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Metric Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Select Metric:
          </span>
          {sourceType === 'scans' ? (
            <select
              value={selectedScanMetric}
              onChange={(e) => setSelectedScanMetric(e.target.value)}
              className="bg-surface-950 border border-surface-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 font-medium"
            >
              {scanMetricOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label} ({opt.unit})
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedTapeMetric}
              onChange={(e) => setSelectedTapeMetric(e.target.value)}
              className="bg-surface-950 border border-surface-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 font-medium"
            >
              {tapeMetricOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label} ({tapeUnit})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1.5 bg-surface-950 p-1 rounded-xl border border-surface-800">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-surface-800 text-brand-400 border border-surface-700'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-surface-950 p-3.5 rounded-xl border border-surface-800">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Latest Recorded
            </span>
            <div className="text-xl font-bold text-white mt-0.5">
              {stats.latestVal.toFixed(1)}{' '}
              <span className="text-xs text-brand-400 font-normal">{stats.unit}</span>
            </div>
          </div>

          <div className="bg-surface-950 p-3.5 rounded-xl border border-surface-800">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Total Change
            </span>
            <div
              className={`text-xl font-bold mt-0.5 ${
                stats.diff === 0
                  ? 'text-gray-300'
                  : stats.diff > 0
                  ? 'text-emerald-400'
                  : 'text-emerald-400'
              }`}
            >
              {stats.diff > 0 ? `+${stats.diff.toFixed(1)}` : stats.diff.toFixed(1)}{' '}
              <span className="text-xs font-normal">{stats.unit}</span>
            </div>
          </div>

          <div className="bg-surface-950 p-3.5 rounded-xl border border-surface-800">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Min / Max Range
            </span>
            <div className="text-sm font-bold text-white mt-1">
              {stats.min.toFixed(1)} - {stats.max.toFixed(1)}{' '}
              <span className="text-xs text-gray-400 font-normal">{stats.unit}</span>
            </div>
          </div>

          <div className="bg-surface-950 p-3.5 rounded-xl border border-surface-800">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Period Average
            </span>
            <div className="text-sm font-bold text-white mt-1">
              {stats.avg.toFixed(1)}{' '}
              <span className="text-xs text-gray-400 font-normal">{stats.unit}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Chart Canvas */}
      <div className="bg-surface-950 border border-surface-800 rounded-xl p-4 relative overflow-hidden">
        {filteredPoints.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface-900 border border-surface-800 flex items-center justify-center mx-auto text-xl">
              📉
            </div>
            <p className="text-sm font-medium text-gray-300">No trend data available for this metric</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Add report logs or tape measurements to start tracking your progress over time.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px] relative">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto overflow-visible"
              >
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0.2, 0.5, 0.8].map((ratio, idx) => {
                  const y = padding.top + (chartHeight - padding.top - padding.bottom) * ratio;
                  return (
                    <line
                      key={idx}
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="#374151"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Area Fill */}
                <path d={areaD} fill="url(#trendGradient)" />

                {/* Line Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {svgCoords.map((coord, idx) => {
                  const isHovered = hoveredPoint === coord.point;
                  return (
                    <g key={idx} className="cursor-pointer">
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={isHovered ? 7 : 5}
                        className="fill-indigo-500 stroke-white transition-all duration-150"
                        strokeWidth={isHovered ? 3 : 2}
                        onMouseEnter={() => setHoveredPoint(coord.point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* X-Axis Date Labels */}
              <div
                className="flex justify-between text-[10px] text-gray-400 font-mono mt-2"
                style={{ paddingLeft: `${padding.left}px`, paddingRight: `${padding.right}px` }}
              >
                <span>{filteredPoints[0]?.dateStr}</span>
                {filteredPoints.length > 2 && (
                  <span>
                    {
                      filteredPoints[Math.floor(filteredPoints.length / 2)]?.dateStr
                    }
                  </span>
                )}
                {filteredPoints.length > 1 && (
                  <span>{filteredPoints[filteredPoints.length - 1]?.dateStr}</span>
                )}
              </div>

              {/* Hover Tooltip Overlay */}
              {hoveredPoint && (
                <div className="absolute top-2 right-4 bg-surface-900 border border-indigo-500/50 p-2.5 rounded-xl shadow-xl text-xs space-y-0.5">
                  <div className="text-[10px] text-gray-400">{hoveredPoint.dateStr}</div>
                  <div className="text-sm font-bold text-white">
                    {hoveredPoint.value.toFixed(1)} {hoveredPoint.unit}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
