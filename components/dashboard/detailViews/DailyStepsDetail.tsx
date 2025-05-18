'use client';

import React from 'react';
import { Button } from "@heroui/button";
import { ChevronDown, Footprints, TrendingUp, MapPin, BarChartHorizontalBig, Award, MessageSquare, PlusCircle, Settings2 } from 'lucide-react';
import SparklineChart from '../SparklineChart'; // Assuming reuse

// Re-using RingGauge or define locally
const RingGauge = ({ percentage, color = "#EC4899", size = 100, strokeWidth = 10, label, valueText }: {
    percentage: number; color?: string; size?: number; strokeWidth?: number; label?: string; valueText?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return (
      <div className="relative flex flex-col items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="#333" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-bold">{valueText || `${Math.round(percentage)}%`}</span>
          {label && <span className="text-xs text-gray-400">{label}</span>}
        </div>
      </div>
    );
  };

// Mock Hourly Heatmap (simple strip chart)
const HourlyHeatmapChart = ({ data, height = 40, colorScale = ['#374151', '#be185d', '#ec4899'] }: { data: { hour: number, steps: number }[], height?: number, colorScale?: string[] }) => {
    if (!data || data.length === 0) return <p className="text-gray-500">No step data for heatmap.</p>;
    const maxSteps = Math.max(...data.map(d => d.steps), 0) || 1000;
    const barWidthPercentage = 100 / data.length;

    const getColor = (steps: number) => {
        if (steps === 0) return colorScale[0];
        const intensity = Math.min(steps / (maxSteps * 0.75), 1); // Cap intensity for color scaling
        if (intensity < 0.5) return colorScale[1];
        return colorScale[2];
    };

    return (
        <div className="flex w-full items-end" style={{ height: `${height}px` }}>
            {data.map((item, index) => (
                <div key={index} style={{ width: `${barWidthPercentage}%`, height: `100%`, backgroundColor: getColor(item.steps) }}
                     className="transition-all ease-in-out duration-300 hover:opacity-80 group relative">
                    <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-1 py-0.5 rounded transition-opacity duration-200">
                        {item.hour}:00 - {item.steps} steps
                    </span>
                </div>
            ))}
        </div>
    );
};

interface DailyStepsDetailProps {
  todaySteps?: number;
  targetSteps?: number;
}

const generateMockHourlySteps = () => {
    const data = [];
    for (let i = 0; i < 24; i++) {
        let steps = 0;
        if (i >= 7 && i <= 21) { // Active hours 7am to 9pm
            if (i === 7 || i === 8 || i === 12 || i === 13 || i === 18 || i ===19 ) { // Commute/lunch/evening walk times
                steps = Math.floor(Math.random() * 1000) + 500; // Higher steps
            } else if (Math.random() < 0.5) {
                steps = Math.floor(Math.random() * 300) + 50;
            }
        }
        data.push({ hour: i, steps });
    }
    return data;
};

const generateMockWeeklySteps = () => {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 8000) + 4000); // 4k to 12k steps
};

const DailyStepsDetail: React.FC<DailyStepsDetailProps> = ({
  todaySteps = 5805,
  targetSteps = 10000,
}) => {
  const sectionTitleClass = "text-sm uppercase tracking-wide text-gray-400 mb-3 font-semibold";
  const cardClass = "bg-[#1F2328] p-4 rounded-lg mb-4";

  const hourlyStepsData = generateMockHourlySteps();
  const weeklyStepsData = generateMockWeeklySteps();
  const avgWeeklySteps = Math.round(weeklyStepsData.reduce((a,b) => a+b, 0) / weeklyStepsData.length);
  const bestDaySteps = Math.max(...weeklyStepsData);

  const distanceKm = (todaySteps * 0.000762).toFixed(1); // Avg step length 0.762m
  const floorsClimbed = Math.round(todaySteps / 200); // Rough estimate, 200 steps per 10 floors

  return (
    <div className="text-sm">
      {/* 1. Header Recap */}
      <div className={`${cardClass} flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center">
          <Footprints className="text-pink-500 mr-3" size={40} />
          <div>
            <p className="text-3xl font-bold">{todaySteps.toLocaleString()} <span className="text-lg text-gray-400">steps</span></p>
            <p className="text-xs text-gray-400">Today's Progress</p>
          </div>
        </div>
        <RingGauge
            percentage={(todaySteps / targetSteps) * 100}
            valueText={`${todaySteps}`}
            label={`of ${targetSteps} steps`}
            color="#EC4899" // Pink/Magenta
        />
        <div>
          <Button variant="bordered" className="text-gray-300 border-gray-600">Today <ChevronDown size={16} className="ml-1" /></Button>
        </div>
      </div>

      {/* 2. Hourly Heatmap */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Hourly Activity Heatmap (Steps)</h3>
        <HourlyHeatmapChart data={hourlyStepsData} />
         <div className="text-xs text-gray-500 mt-1 text-center">Darker means more steps. Hover for details.</div>
      </div>

      {/* 3. 7-Day Bar Chart (using Sparkline as placeholder for now) */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>7-Day Step Trend</h3>
        {/* Replace with a proper Bar Chart component if available */}
        <SparklineChart data={weeklyStepsData} height={60} color="#EC4899" />
        <div className="flex justify-around text-xs mt-2 text-gray-400">
          <p>Avg: <span className="font-semibold">{avgWeeklySteps.toLocaleString()}</span></p>
          <p>Best Day: <span className="font-semibold">{bestDaySteps.toLocaleString()}</span></p>
        </div>
      </div>

      {/* 4. Distance + Floors */}
      <div className={`${cardClass} grid grid-cols-2 gap-4 text-center`}>
        <div>
            <MapPin className="mx-auto text-pink-400 mb-1" size={20}/>
            <p className="text-lg font-semibold text-white">{distanceKm} <span className="text-sm text-gray-400">km</span></p>
            <p className="text-xs text-gray-500">Distance Covered</p>
        </div>
        <div>
            <BarChartHorizontalBig className="mx-auto text-pink-400 mb-1" size={20}/>
            <p className="text-lg font-semibold text-white">{floorsClimbed} <span className="text-sm text-gray-400">floors</span></p>
            <p className="text-xs text-gray-500">Floors Climbed (Est.)</p>
        </div>
      </div>

      {/* 5. Correlation Card (Placeholder) */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Steps vs. Calories Burned</h3>
        <div className="h-24 bg-[#2a2e33] rounded flex items-center justify-center text-gray-500 italic">
          Chart: Steps vs Calories Burned (Scatter/Overlay)
        </div>
      </div>

      {/* 6. Streak & Badges */}
      <div className={`${cardClass} flex items-center`}>
        <Award className="text-yellow-400 mr-2" />
        <p>Streak: <span className="font-bold text-white">3 days</span> &gt; {targetSteps/1000}k steps! <span className="ml-2">🏆</span></p>
      </div>

      {/* AI Insight */}
       <div className={cardClass}>
        <h3 className={sectionTitleClass}><MessageSquare size={16} className="inline mr-1 text-purple-400" /> AI Tip</h3>
        <p className="text-xs text-gray-300 italic">
          "You hit {todaySteps.toLocaleString()} steps today. Try a 15-min evening walk to reach your {targetSteps/1000}k goal and boost your NEAT!"
        </p>
      </div>

      {/* 7. Quick Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button className="bg-pink-600 hover:bg-pink-700 text-white flex-1"><PlusCircle size={16} className="mr-2"/> Add Walk / Activity</Button>
        <Button variant="bordered" className="text-gray-300 border-gray-600 flex-1"><Settings2 size={16} className="mr-2"/> Connect Tracker</Button>
      </div>
    </div>
  );
};

export default DailyStepsDetail;