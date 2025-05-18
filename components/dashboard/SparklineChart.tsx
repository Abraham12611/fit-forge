'use client';

import React from 'react';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
}

const SparklineChart: React.FC<SparklineChartProps> = ({
  data = [],
  width = 100,
  height = 30,
  color = '#D100F5',
  strokeWidth = 2
}) => {
  if (!data || data.length === 0) {
    return <div style={{ width, height, border: '1px dashed #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{fontSize: '10px', color: '#555'}}>No data</span></div>;
  }

  const padding = 5;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const maxVal = Math.max(...data, 0); // Ensure maxVal is at least 0
  const minVal = Math.min(...data);
  const valRange = maxVal - minVal === 0 ? 1 : maxVal - minVal; // Avoid division by zero if all values are same

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1 || 1)) * chartWidth + padding;
      const y = chartHeight - ((val - minVal) / valRange) * chartHeight + padding;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export default SparklineChart;