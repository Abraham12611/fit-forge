'use client';

import React from 'react';
import { Button } from "@heroui/button";
import { Flame, TrendingUp, PieChart, BarChart2, CheckCircle, AlertTriangle, Edit3, PlusCircle } from 'lucide-react';
import DailyBurnChart from '../charts/DailyBurnChart';
import SparklineChart from '../SparklineChart';

interface CaloriesBurnedDetailProps {
  todayBurned: number;
  targetBurned: number;
  // For actual implementation, pass dailyMetrics from mockUserData here
  // dailyMetrics: Array<{ date: string; caloriesBurned: number; /* ... other metrics */ }>;
}

// Mock data generation specific to this detail view for now
const generateMockDailyBreakdown = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      hour: i,
      bmr: Math.floor(Math.random() * 20) + 60,
      neat: Math.floor(Math.random() * ((i >= 6 && i <= 9) || (i >= 12 && i <= 14) || (i >=18 && i <= 21) ? 80 : 30)) + 10, // More NEAT during typical active hours
      exercise: (i === 7 || i === 18) ? Math.floor(Math.random() * 200) + 100 : 0 // Exercise at 7am and 6pm
    });
  }
  return data;
};

const generateMockWeeklyTrend = () => {
  const data = [];
  for (let i = 0; i < 7; i++) {
    data.push(Math.floor(Math.random() * 600) + 2000); // Calories between 2000-2600
  }
  return data;
};

const RingGauge = ({ percentage, color = "#D100F5", size = 100, strokeWidth = 10, label }: {
  percentage: number; color?: string; size?: number; strokeWidth?: number; label?: string;
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
        <span className="text-xl font-bold">{`${Math.round(percentage)}%`}</span>
        {label && <span className="text-xs text-gray-400">{label}</span>}
      </div>
    </div>
  );
};

const CaloriesBurnedDetail: React.FC<CaloriesBurnedDetailProps> = ({
    todayBurned = 2350,
    targetBurned = 2500
}) => {
  const sectionTitleClass = "text-sm uppercase tracking-wide text-gray-400 mb-2 font-semibold";
  const cardClass = "bg-[#1F2328] p-4 rounded-lg mb-4";

  const mockDailyData = generateMockDailyBreakdown();
  const mockWeeklyData = generateMockWeeklyTrend();
  const avgWeekly = mockWeeklyData.reduce((a,b) => a+b, 0) / mockWeeklyData.length;

  return (
    <div className="text-sm">
      {/* 1. Header Recap */}
      <div className={`${cardClass} flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center">
            <Flame className="text-[#D100F5] mr-3" size={40} />
            <div>
                <p className="text-3xl font-bold">{todayBurned.toLocaleString()} <span className="text-lg text-gray-400">kcal</span></p>
                <p className="text-xs text-gray-400">Burned Today</p>
            </div>
        </div>
        <RingGauge percentage={(todayBurned/targetBurned)*100} label={`of ${targetBurned} kcal`} color="#D100F5" />
        <div>
          <Button variant="bordered" className="text-gray-300 border-gray-600">Today ⌄</Button>
        </div>
      </div>

      {/* 2. Daily Breakdown Timeline */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Daily Breakdown (24h)</h3>
        <DailyBurnChart data={mockDailyData} />
      </div>

      {/* 3. 7-Day Trend */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>7-Day Trend (Calories Burned)</h3>
        <SparklineChart data={mockWeeklyData} height={60} color="#A78BFA" />
        <div className="flex justify-around text-xs mt-2">
          <p>Avg: <span className="font-semibold">{Math.round(avgWeekly)}</span> kcal</p>
          <p>Highest: <span className="font-semibold">{Math.max(...mockWeeklyData)}</span> kcal</p>
          <p>Lowest: <span className="font-semibold">{Math.min(...mockWeeklyData)}</span> kcal</p>
        </div>
      </div>

      {/* 4. Source Pie */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Burn by Activity Type</h3>
        <div className="h-32 bg-[#2a2e33] rounded flex items-center justify-center text-gray-500">
          Placeholder for Doughnut Chart (Running, Strength, Walking)
        </div>
      </div>

      {/* 5. Surplus/Deficit Tracker */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Surplus / Deficit (Last 7 days)</h3>
        <div className="h-24 bg-[#2a2e33] rounded flex items-center justify-center text-gray-500">
          Placeholder for Green/Red Bars & Projected Fat Loss
        </div>
      </div>

      {/* 6. Goal Streak Widget */}
      <div className={`${cardClass} flex items-center`}>
        <Flame className="text-orange-400 mr-2" />
        <p>Streak: <span className="font-bold">5 days</span> hitting burn goal!</p>
      </div>

      {/* 7. Insights & Tips */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Insights & Tips</h3>
        <p className="text-xs text-gray-300 italic">
          "Yesterday you hit 2650 kcal—highest in 3 weeks, primarily from a 7km run. Consider a rest-day walk today to stay in deficit while recovering."
        </p>
      </div>

      {/* 8. Quick Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button className="bg-[#D100F5] text-white flex-1"><PlusCircle size={16} className="mr-2"/> Log Workout</Button>
        <Button variant="bordered" className="text-gray-300 border-gray-600 flex-1"><Edit3 size={16} className="mr-2"/> Set New Goal</Button>
      </div>

    </div>
  );
};

export default CaloriesBurnedDetail;