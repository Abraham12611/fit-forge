'use client';

import React from 'react';
import { Button } from "@heroui/button";
import { ChevronDown, CalendarDays, TrendingUp, PieChartIcon, Sparkles, MessageSquare, PlusCircle, Moon, UploadCloud } from 'lucide-react';

// Re-using RingGauge or define locally
const RingGauge = ({ percentage, color = "#14B8A6", size = 100, strokeWidth = 10, label, valueText }: {
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

const WeekCalendar = ({ data }: { data: { day: string, status: 'done' | 'rest' | 'missed' | 'upcoming' }[] }) => {
    const statusColors = {
        done: 'bg-teal-500',
        rest: 'bg-gray-600',
        missed: 'bg-red-500',
        upcoming: 'bg-gray-700 animate-pulse'
    };
    return (
        <div className="grid grid-cols-7 gap-2">
            {data.map(item => (
                <button key={item.day} className={`p-2 rounded text-center text-xs font-medium h-12 flex flex-col justify-center items-center ${statusColors[item.status]} text-white hover:opacity-80 transition-opacity`}>
                    <span>{item.day.substring(0,3)}</span>
                    {item.status !== 'upcoming' && item.status !== 'rest' && <span className="text-lg">{item.status === 'done' ? '✔' : '✖'}</span>}
                    {item.status === 'rest' && <Moon size={14} className="mt-1"/>}
                </button>
            ))}
        </div>
    );
}

interface WorkoutsDetailProps {
  workoutsCompleted?: number;
  workoutsTarget?: number;
}

const mockWeekData = [
    { day: 'Mon', status: 'done' as const },
    { day: 'Tue', status: 'done' as const },
    { day: 'Wed', status: 'missed' as const },
    { day: 'Thu', status: 'done' as const },
    { day: 'Fri', status: 'rest' as const },
    { day: 'Sat', status: 'done' as const },
    { day: 'Sun', status: 'upcoming' as const },
];

const mockPRs = [
    { exercise: 'Squat', value: '100kg x 5' },
    { exercise: 'Run', value: '5km in 23:15' },
    { exercise: 'Bench Press', value: '70kg x 8' },
];

const WorkoutsDetail: React.FC<WorkoutsDetailProps> = ({
  workoutsCompleted = 4, // Mon, Tue, Thu, Sat from mockWeekData (excluding rest/missed/upcoming)
  workoutsTarget = 5,
}) => {
  const sectionTitleClass = "text-sm uppercase tracking-wide text-gray-400 mb-3 font-semibold";
  const cardClass = "bg-[#1F2328] p-4 rounded-lg mb-4";

  const actualCompleted = mockWeekData.filter(d => d.status === 'done').length;
  const remainingDays = mockWeekData.filter(d => d.status === 'upcoming' || d.status === 'rest' ).length;

  return (
    <div className="text-sm">
      {/* 1. Header Recap */}
      <div className={`${cardClass} flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center">
          <CalendarDays className="text-teal-500 mr-3" size={40} />
          <div>
            <p className="text-3xl font-bold">{actualCompleted} <span className="text-lg text-gray-400">Workouts</span></p>
            <p className="text-xs text-gray-400">This Week ({remainingDays} days remaining)</p>
          </div>
        </div>
        <RingGauge
            percentage={(actualCompleted / workoutsTarget) * 100}
            valueText={`${actualCompleted}/${workoutsTarget}`}
            label={`Goal: ${workoutsTarget}`}
            color="#14B8A6" // Teal
        />
        <div>
          <Button variant="bordered" className="text-gray-300 border-gray-600">This Week <ChevronDown size={16} className="ml-1" /></Button>
        </div>
      </div>

      {/* 2. Week Calendar */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Week at a Glance</h3>
        <WeekCalendar data={mockWeekData} />
      </div>

      {/* 3. Volume Trend (Placeholder) */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Volume Trend (Tonnage/Cardio Mins)</h3>
        <div className="h-24 bg-[#2a2e33] rounded flex items-center justify-center text-gray-500 italic">
          Chart: Bar per session (total tonnage or cardio minutes)
        </div>
      </div>

      {/* 4. Intensity Distribution (Placeholder) */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Intensity Distribution</h3>
        <div className="h-32 bg-[#2a2e33] rounded flex items-center justify-center text-gray-500 italic">
          Pie Chart: % HIIT, Strength, Cardio, Mobility
        </div>
      </div>

      {/* 5. PR Highlights */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}><Sparkles size={16} className="inline mr-1 text-yellow-400"/> Personal Records</h3>
        {mockPRs.length > 0 ? (
            <ul className="space-y-1 text-xs list-disc list-inside pl-1 text-gray-300">
                {mockPRs.map((pr, i) => <li key={i}><span className="font-medium text-white">{pr.exercise}:</span> {pr.value}</li>)}
            </ul>
        ) : (
            <p className="text-xs text-gray-500 italic">No recent PRs logged.</p>
        )}
      </div>

      {/* 6. AI Suggestion */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}><MessageSquare size={16} className="inline mr-1 text-purple-400" /> AI Coach Suggestion</h3>
        <p className="text-xs text-gray-300 italic">
          "You've completed {actualCompleted} of {workoutsTarget} workouts. One session left! Consider a 30-min lower-body mobility flow tomorrow to aid recovery from Thursday's heavy squats."
        </p>
      </div>

      {/* 7. Quick Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button className="bg-teal-600 hover:bg-teal-700 text-white flex-1"><PlusCircle size={16} className="mr-2"/> Log Workout</Button>
        <Button variant="bordered" className="text-gray-300 border-gray-600 flex-1"><Moon size={16} className="mr-2"/> Mark Rest Day</Button>
        <Button variant="bordered" className="text-gray-300 border-gray-600 flex-1"><UploadCloud size={16} className="mr-2"/> Import Activity</Button>
      </div>
    </div>
  );
};

export default WorkoutsDetail;