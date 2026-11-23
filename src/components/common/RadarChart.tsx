/**
 * TRUSTGRID.AI - PSYCHOMETRIC & VIDEO ASSESSMENT PLATFORM
 * RadarChart.tsx - High-Performance Pure SVG Radar / Spider Chart
 */

import React from 'react';

export interface RadarDataPoint {
  label: string;
  value: number; // 0 to 100 or 1 to 10
  maxValue?: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  color?: string;
  fillOpacity?: number;
  compareData?: RadarDataPoint[];
  compareColor?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 320,
  color = '#001A9C',
  fillOpacity = 0.25,
  compareData,
  compareColor = '#10B981'
}) => {
  if (!data || data.length < 3) return null;

  const center = size / 2;
  const radius = (size / 2) - 40;
  const totalAxes = data.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (value: number, max: number, index: number) => {
    const ratio = Math.min(1, Math.max(0, value / max));
    const angle = angleSlice * index - Math.PI / 2;
    const x = center + radius * ratio * Math.cos(angle);
    const y = center + radius * ratio * Math.sin(angle);
    return { x, y };
  };

  // Build polygon path for primary dataset
  const points = data.map((d, i) => {
    const max = d.maxValue || 100;
    const { x, y } = getCoordinates(d.value, max, i);
    return `${x},${y}`;
  }).join(' ');

  // Build polygon path for comparison dataset if provided
  const comparePoints = compareData?.map((d, i) => {
    const max = d.maxValue || 100;
    const { x, y } = getCoordinates(d.value, max, i);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible select-none">
        {/* Background concentric polygons */}
        {levels.map((lvl, lvlIdx) => {
          const polyPoints = data.map((_, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const x = center + radius * lvl * Math.cos(angle);
            const y = center + radius * lvl * Math.sin(angle);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={`lvl-${lvlIdx}`}
              points={polyPoints}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={lvlIdx === levels.length - 1 ? 'none' : '3 3'}
            />
          );
        })}

        {/* Axes lines and text labels */}
        {data.map((d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const endX = center + radius * Math.cos(angle);
          const endY = center + radius * Math.sin(angle);

          // Position text slightly outside
          const textDistance = radius + 22;
          const textX = center + textDistance * Math.cos(angle);
          const textY = center + textDistance * Math.sin(angle) + 4;

          return (
            <g key={`axis-${i}`}>
              <line
                x1={center}
                y1={center}
                x2={endX}
                y2={endY}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <text
                x={textX}
                y={textY}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#475569"
                className="font-sans"
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Primary Polygon */}
        <polygon
          points={points}
          fill={color}
          fillOpacity={fillOpacity}
          stroke={color}
          strokeWidth="2.5"
        />

        {/* Primary Data Points */}
        {data.map((d, i) => {
          const max = d.maxValue || 100;
          const { x, y } = getCoordinates(d.value, max, i);
          return (
            <circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r="4.5"
              fill={color}
              stroke="#ffffff"
              strokeWidth="2"
            />
          );
        })}

        {/* Compare Polygon if active */}
        {comparePoints && (
          <>
            <polygon
              points={comparePoints}
              fill={compareColor}
              fillOpacity={0.2}
              stroke={compareColor}
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            {compareData?.map((d, i) => {
              const max = d.maxValue || 100;
              const { x, y } = getCoordinates(d.value, max, i);
              return (
                <circle
                  key={`cmp-dot-${i}`}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill={compareColor}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              );
            })}
          </>
        )}
      </svg>
    </div>
  );
};
