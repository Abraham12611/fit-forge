'use client';

import React, { useState } from 'react';
import { Button } from "@heroui/button";
import { ChevronDown, Droplet, Zap, Bell, AlertTriangle, Info, MessageSquare, PlusCircle } from 'lucide-react';
import { Switch } from "@heroui/react"; // Assuming HeroUI has a Switch component

// Re-using RingGauge or define locally
const RingGauge = ({ percentage, color = "#3B82F6", size = 100, strokeWidth = 10, label, valueText }: {
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

// Mock Hourly Intake Chart (simple bar chart)
const HourlyIntakeChart = ({ data, height = 100, barColor = "#3B82F6" }: { data: { hour: number, intake: number }[], height?: number, barColor?: string }) => {
    if (!data || data.length === 0) return <p className="text-gray-500">No intake data for chart.</p>;
    const maxIntake = Math.max(...data.map(d => d.intake), 0) || 100;
    const barWidthPercentage = 100 / data.length;

    return (
        <div className="flex w-full items-end border-b border-gray-700" style={{ height: `${height}px` }}>
            {data.map((item, index) => (
                <div key={index} style={{ width: `${barWidthPercentage}%`, height: `${(item.intake / maxIntake) * 100}%`, backgroundColor: item.intake > 0 ? barColor : '#374151' }}
                     className="transition-all ease-in-out duration-300 hover:opacity-80 group relative">
                    <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-1 py-0.5 rounded transition-opacity duration-200">
                        {item.hour}:00 - {item.intake}ml
                    </span>
                </div>
            ))}
        </div>
    );
};

interface HydrationDetailProps {
  todayIntake?: number;
  targetIntake?: number;
}

const generateMockHourlyIntake = () => {
    const data = [];
    for (let i = 0; i < 24; i++) {
        // Simulate more intake during waking hours, less at night
        let intake = 0;
        if (i >= 7 && i <= 22) { // Active hours 7am to 10pm
            if (Math.random() < 0.6) { // 60% chance of drinking something in an active hour
                intake = Math.floor(Math.random() * 200) + 50; // 50-250ml
            }
        }
        data.push({ hour: i, intake });
    }
    return data;
};

const HydrationDetail: React.FC<HydrationDetailProps> = ({
  todayIntake = 2072,
  targetIntake = 3000,
}) => {
  const sectionTitleClass = "text-sm uppercase tracking-wide text-gray-400 mb-3 font-semibold";
  const cardClass = "bg-[#1F2328] p-4 rounded-lg mb-4";
  const [remindersEnabled, setRemindersEnabled] = useState(false);

  const hourlyIntakeData = generateMockHourlyIntake();
  const mockStreak = 4; // days

  return (
    <div className="text-sm">
      {/* 1. Header Recap */}
      <div className={`${cardClass} flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center">
          <Droplet className="text-blue-500 mr-3" size={40} />
          <div>
            <p className="text-3xl font-bold">{todayIntake.toLocaleString()} <span className="text-lg text-gray-400">ml</span></p>
            <p className="text-xs text-gray-400">Hydrated Today</p>
          </div>
        </div>
        <RingGauge
            percentage={(todayIntake / targetIntake) * 100}
            valueText={`${todayIntake}`}
            label={`of ${targetIntake} ml`}
            color="#3B82F6" // Blue
        />
        <div>
          <Button variant="bordered" className="text-gray-300 border-gray-600">Today <ChevronDown size={16} className="ml-1" /></Button>
        </div>
      </div>

      {/* 2. Hourly Intake Chart */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Hourly Intake (24h)</h3>
        <HourlyIntakeChart data={hourlyIntakeData} barColor="#3B82F6" />
        <div className="text-xs text-gray-500 mt-1 text-center">Hover over bars for details. Darker bars indicate intake.</div>
      </div>

      {/* 3. Streak Tracker */}
      <div className={`${cardClass} flex items-center justify-between`}>
        <div className="flex items-center">
            <Zap className="text-yellow-400 mr-2" />
            <p>Streak: <span className="font-bold text-white">{mockStreak} days</span> hitting {targetIntake/1000}L goal!</p>
        </div>
        {/* Optionally add a small visual like dots for streak days */}
      </div>

      {/* 4. Electrolytes (Placeholder) */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Electrolytes (Na/K/Mg)</h3>
        <div className="h-20 bg-[#2a2e33] rounded flex items-center justify-center text-gray-500 italic">
          Log sodium, potassium, magnesium to see totals here.
        </div>
      </div>

      {/* 5. Hydration & Performance Insight */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}><MessageSquare size={16} className="inline mr-1 text-purple-400" /> Hydration & Performance</h3>
        <p className="text-xs text-gray-300 italic">
          "Staying well-hydrated, like you did yesterday with {todayIntake}ml, can improve workout performance and recovery. You're doing great!"
        </p>
      </div>

      {/* 6. Reminder Toggle */}
      <div className={`${cardClass} flex items-center justify-between`}>
        <div className="flex items-center">
            <Bell size={18} className="mr-2 text-blue-400"/>
            <p className="font-medium text-gray-100">Hydration Reminders</p>
        </div>
        <Switch
            isSelected={remindersEnabled}
            onChange={setRemindersEnabled}
            aria-label="Hydration Reminders"
            // Styling might need to be adapted for HeroUI Switch if it differs from NextUI/Radix
            // className="group relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none"
        >
            {/* Basic visual representation if Switch component is simple */}
            {/* <span aria-hidden="true" className={`${remindersEnabled ? 'bg-blue-600' : 'bg-gray-600'} pointer-events-none absolute h-full w-full rounded-md`} />
            <span aria-hidden="true" className={`${remindersEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-700 bg-white shadow ring-0 transition-transform duration-200 ease-in-out`} /> */}
        </Switch>
      </div>
       <p className="text-xs text-gray-500 mt-1 px-1">
         {remindersEnabled ? "You'll receive a toast notification to drink 250ml every 90 minutes." : "Enable to get reminders."}
        </p>

      {/* Quick Actions (Optional for Hydration, e.g. Log Custom Amount) */}
       <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1"><PlusCircle size={16} className="mr-2"/> Log Water Intake</Button>
        {/* <Button variant="bordered" className="text-gray-300 border-gray-600 flex-1"><Target size={16} className="mr-2"/> Adjust Hydration Goal</Button> */}
      </div>

    </div>
  );
};

export default HydrationDetail;