'use client';

import React from 'react';

interface DailyBurnDataPoint {
  hour: number; // 0-23
  bmr: number;
  neat: number;
  exercise: number;
}

interface DailyBurnChartProps {
  data: DailyBurnDataPoint[];
  width?: number;
  height?: number;
}

// Mock data generation for 24 hours if not provided
const generateMockBurnData = (): DailyBurnDataPoint[] => {
  const data: DailyBurnDataPoint[] = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      hour: i,
      bmr: Math.floor(Math.random() * 20) + 60, // Base BMR per hour
      neat: Math.floor(Math.random() * 50) + 10, // NEAT varies
      exercise: (i >= 7 && i <= 8) || (i >= 17 && i <= 18) ? Math.floor(Math.random() * 150) + 50 : 0 // Exercise spikes
    });
  }
  return data;
};

const DailyBurnChart: React.FC<DailyBurnChartProps> = ({
  data,
  width = 580, // Adjusted for typical modal width
  height = 160,
}) => {
  const chartData = data && data.length > 0 ? data : generateMockBurnData();
  const numBars = chartData.length;
  if (numBars === 0) return <p>No data for daily burn chart.</p>;

  const barMargin = 2;
  const barWidth = (width - (numBars - 1) * barMargin) / numBars;

  const maxTotalBurn = Math.max(...chartData.map(d => d.bmr + d.neat + d.exercise), 0) || 100; // Ensure not 0

  const colors = {
    bmr: '#555555', // Gray
    neat: '#38BDF8', // Cyan (Tailwind sky-400)
    exercise: '#D100F5' // Magenta
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <g>
        {chartData.map((d, i) => {
          const totalHourBurn = d.bmr + d.neat + d.exercise;
          const bmrHeight = (d.bmr / maxTotalBurn) * height;
          const neatHeight = (d.neat / maxTotalBurn) * height;
          const exerciseHeight = (d.exercise / maxTotalBurn) * height;

          const x = i * (barWidth + barMargin);

          return (
            <g key={`bar-${i}`} transform={`translate(${x} 0)`}>
              <title>{`Hour ${d.hour}: BMR ${d.bmr}, NEAT ${d.neat}, Exercise ${d.exercise}`}</title>
              <rect
                y={height - bmrHeight}
                width={barWidth}
                height={bmrHeight}
                fill={colors.bmr}
              />
              <rect
                y={height - bmrHeight - neatHeight}
                width={barWidth}
                height={neatHeight}
                fill={colors.neat}
              />
              <rect
                y={height - bmrHeight - neatHeight - exerciseHeight}
                width={barWidth}
                height={exerciseHeight}
                fill={colors.exercise}
              />
            </g>
          );
        })}
      </g>
      {/* Optional: Add X-axis labels for hours, Y-axis for kcal if needed */}
    </svg>
  );
};

export default DailyBurnChart;