'use client';

import React from 'react';
import { Button } from "@heroui/button";
import { ChevronDown, PlusCircle, Target, BookOpen, TrendingUp, MessageSquare, Info } from 'lucide-react';
import SparklineChart from '../SparklineChart'; // Assuming you have this for trends

// Re-using RingGauge from CaloriesBurnedDetail, or define it here if not shared
const RingGauge = ({ percentage, color = "#4CAF50", size = 100, strokeWidth = 10, label, valueText }: {
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

const MacroStackBar = ({ protein, carbs, fat, total, height = 20 }: { protein: number, carbs: number, fat: number, total: number, height?: number }) => {
  if (total === 0) return <div className="h-5 bg-gray-700 rounded" />;
  const pWidth = (protein / total) * 100;
  const cWidth = (carbs / total) * 100;
  const fWidth = (fat / total) * 100;

  return (
    <div className="flex w-full rounded overflow-hidden" style={{ height: `${height}px` }}>
      <div style={{ width: `${pWidth}%`, backgroundColor: '#22C55E' }} className="flex items-center justify-center text-xs text-white font-medium" title={`Protein: ${protein}g`}>P</div>
      <div style={{ width: `${cWidth}%`, backgroundColor: '#3B82F6' }} className="flex items-center justify-center text-xs text-white font-medium" title={`Carbs: ${carbs}g`}>C</div>
      <div style={{ width: `${fWidth}%`, backgroundColor: '#F59E0B' }} className="flex items-center justify-center text-xs text-white font-medium" title={`Fat: ${fat}g`}>F</div>
    </div>
  );
};

interface CaloriesConsumedDetailProps {
  todayConsumed?: number;
  targetConsumed?: number;
  // Mock data for now
}

const generateMockMealLog = () => {
  return [
    { time: '08:15', name: 'Protein Oatmeal & Berries', kcal: 420, macros: {p: 35, c: 50, f: 10} },
    { time: '12:30', name: 'Grilled Chicken Salad Wrap', kcal: 550, macros: {p: 45, c: 40, f: 20} },
    { time: '16:00', name: 'Greek Yogurt & Almonds', kcal: 280, macros: {p: 20, c: 15, f: 15} },
    { time: '19:45', name: 'Salmon with Quinoa & Asparagus', kcal: 650, macros: {p: 50, c: 55, f: 25} },
    { time: '21:30', name: 'Casein Protein Shake', kcal: 180, macros: {p: 30, c: 5, f: 3} },
  ];
};

const generateMockWeeklyTrend = () => {
  const data = [];
  for (let i = 0; i < 7; i++) {
    data.push(Math.floor(Math.random() * 500) + 2000); // Calories between 2000-2500
  }
  return data;
};

const CaloriesConsumedDetail: React.FC<CaloriesConsumedDetailProps> = ({
  todayConsumed = 2194,
  targetConsumed = 2200,
}) => {
  const sectionTitleClass = "text-sm uppercase tracking-wide text-gray-400 mb-3 font-semibold";
  const cardClass = "bg-[#1F2328] p-4 rounded-lg mb-4";

  const mealLog = generateMockMealLog();
  const weeklyTrend = generateMockWeeklyTrend();
  const totalMacrosToday = mealLog.reduce((acc, meal) => {
    acc.p += meal.macros.p;
    acc.c += meal.macros.c;
    acc.f += meal.macros.f;
    return acc;
  }, { p: 0, c: 0, f: 0 });
  const totalKcalMacros = (totalMacrosToday.p * 4) + (totalMacrosToday.c * 4) + (totalMacrosToday.f * 9);


  return (
    <div className="text-sm">
      {/* 1. Header Recap */}
      <div className={`${cardClass} flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center">
          <BookOpen className="text-green-500 mr-3" size={40} />
          <div>
            <p className="text-3xl font-bold">{todayConsumed.toLocaleString()} <span className="text-lg text-gray-400">kcal</span></p>
            <p className="text-xs text-gray-400">Consumed Today</p>
          </div>
        </div>
        <RingGauge
            percentage={(todayConsumed / targetConsumed) * 100}
            valueText={`${todayConsumed}`}
            label={`of ${targetConsumed} kcal`}
            color="#22C55E" // Green
        />
        <div>
          <Button variant="bordered" className="text-gray-300 border-gray-600">Today <ChevronDown size={16} className="ml-1" /></Button>
        </div>
      </div>

      {/* 2. Macro Split */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Macro Split (Today)</h3>
        <MacroStackBar protein={totalMacrosToday.p} carbs={totalMacrosToday.c} fat={totalMacrosToday.f} total={totalMacrosToday.p + totalMacrosToday.c + totalMacrosToday.f} />
        <div className="flex justify-around text-xs mt-2 text-gray-300">
            <p><span style={{color: '#22C55E'}}>●</span> P: {totalMacrosToday.p}g ({Math.round((totalMacrosToday.p*4/totalKcalMacros)*100)}%)</p>
            <p><span style={{color: '#3B82F6'}}>●</span> C: {totalMacrosToday.c}g ({Math.round((totalMacrosToday.c*4/totalKcalMacros)*100)}%)</p>
            <p><span style={{color: '#F59E0B'}}>●</span> F: {totalMacrosToday.f}g ({Math.round((totalMacrosToday.f*9/totalKcalMacros)*100)}%)</p>
        </div>
         {/* Placeholder for doughnut chart if preferred - for now, stacked bar + legend is used */}
      </div>

      {/* 3. Meal Log Timeline */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Meal Log</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {mealLog.map((meal, index) => (
            <div key={index} className="flex justify-between items-start p-2 bg-[#2a2e33] rounded">
              <div>
                <p className="text-gray-400 text-xs">{meal.time}</p>
                <p className="font-medium text-gray-100">{meal.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-100">{meal.kcal} kcal</p>
                <p className="text-xs text-gray-400">
                    P:{meal.macros.p} C:{meal.macros.c} F:{meal.macros.f}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 7-Day Trend */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>7-Day Consumption Trend (kcal)</h3>
        <SparklineChart data={weeklyTrend} height={60} color="#22C55E" />
        {/* Add goal band shading and hover tooltip if SparklineChart supports it or use a more complex chart */}
        <div className="flex justify-around text-xs mt-2 text-gray-400">
          <p>Avg: <span className="font-semibold">{Math.round(weeklyTrend.reduce((a,b) => a+b,0)/weeklyTrend.length)}</span> kcal</p>
          <p>Highest: <span className="font-semibold">{Math.max(...weeklyTrend)}</span> kcal</p>
          <p>Lowest: <span className="font-semibold">{Math.min(...weeklyTrend)}</span> kcal</p>
        </div>
      </div>

      {/* 5. Deficit / Surplus Bar */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Net Energy Balance (Today)</h3>
        {/* Assuming burn data is available - mock for now */}
        <div className="h-16 bg-[#2a2e33] rounded flex items-center justify-center text-gray-500 italic">
          Connect to Calories Burned data for Net Bar
        </div>
      </div>

      {/* 6. AI Insight */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}><MessageSquare size={16} className="inline mr-1 text-purple-400" /> AI Insight</h3>
        <p className="text-xs text-gray-300 italic">
          "You've averaged 2150 kcal this week, close to your target. Your protein intake is consistently good, averaging 150g. Keep it up!"
        </p>
      </div>

      {/* 7. Quick Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button className="bg-green-600 hover:bg-green-700 text-white flex-1"><PlusCircle size={16} className="mr-2"/> Add Meal / Food</Button>
        <Button variant="bordered" className="text-gray-300 border-gray-600 flex-1"><Target size={16} className="mr-2"/> Adjust Calorie Goal</Button>
      </div>
    </div>
  );
};

export default CaloriesConsumedDetail;