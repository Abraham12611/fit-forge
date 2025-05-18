'use client';

import React, { useState } from 'react';
import { Button } from "@heroui/button";
import { ChevronLeft, ChevronRight, CalendarRange, TrendingUp, Footprints, Zap, BarChart3, Award, Settings, MessageSquare, PlusCircle, UploadCloud, Share2, Eye, EyeOff } from 'lucide-react';
import SparklineChart from '../SparklineChart'; // Assuming reuse
import { Accordion, AccordionItem } from "@heroui/react"; // Assuming HeroUI Accordion

const WeekNavigator = ({ currentWeekLabel, onPrev, onNext }: { currentWeekLabel: string, onPrev: () => void, onNext: () => void }) => {
    return (
        <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onPress={onPrev} aria-label="Previous week"><ChevronLeft size={20} /></Button>
            <h2 className="text-lg font-semibold text-white whitespace-nowrap">{currentWeekLabel}</h2>
            <Button variant="ghost" size="sm" onPress={onNext} aria-label="Next week"><ChevronRight size={20} /></Button>
        </div>
    );
};

// Mock data generators
const generateMockSeries = (length = 7, min = 1800, max = 3000) => Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);

const mockLoggedWorkouts = [
    { name: "Morning Run", kcal: 350, duration: "30 min", rpe: 7, day: "Mon" },
    { name: "Full Body Strength", kcal: 450, duration: "60 min", rpe: 8, day: "Tue" },
    { name: "Evening Yoga", kcal: 150, duration: "45 min", rpe: 5, day: "Thu" },
    { name: "Weekend Hike", kcal: 600, duration: "90 min", rpe: 7, day: "Sat" },
];

const mockDailyBreakdownData = [
    { day: "Mon", burn: 2200, steps: 8500, workout: true, consumed: 2100, deficit: 100, hrv: 65, rhr: 58 },
    { day: "Tue", burn: 2500, steps: 7200, workout: true, consumed: 2300, deficit: 200, hrv: 70, rhr: 55 },
    { day: "Wed", burn: 1900, steps: 5100, workout: false, consumed: 2000, deficit: -100, hrv: 58, rhr: 60 },
    { day: "Thu", burn: 2300, steps: 9800, workout: true, consumed: 2250, deficit: 50, hrv: 62, rhr: 57 },
    { day: "Fri", burn: 2000, steps: 12500, workout: false, consumed: 2400, deficit: -400, hrv: 75, rhr: 52 },
    { day: "Sat", burn: 2800, steps: 14230, workout: true, consumed: 2600, deficit: 200, hrv: 60, rhr: 59 },
    { day: "Sun", burn: 1850, steps: 6100, workout: false, consumed: 1900, deficit: -50, hrv: 68, rhr: 56 },
];

interface WeeklyActivityDetailProps { }

const WeeklyActivityDetail: React.FC<WeeklyActivityDetailProps> = ({ }) => {
    const sectionTitleClass = "text-sm uppercase tracking-wide text-gray-400 mb-2 font-semibold";
    const cardClass = "bg-[#1F2328] p-4 rounded-lg mb-4";
    const [weekOffset, setWeekOffset] = useState(0); // 0 for current week, -1 for last, 1 for next
    const [showReadiness, setShowReadiness] = useState(true);

    // This would typically involve more complex date logic
    const getWeekLabel = (offset: number): string => {
        if (offset === 0) return "This Week (Aug 5 - Aug 11)";
        if (offset === -1) return "Last Week (Jul 29 - Aug 4)";
        return `Week ${32 + offset} (Future Date)`;
    };

    const caloriesData = generateMockSeries(7, 2000, 2800);
    const stepsData = generateMockSeries(7, 5000, 15000);
    const calorieGoal = 2300;
    const stepGoal = 10000;

    return (
        <div className="text-sm">
            {/* 1. Header (Week Navigator) */}
            <div className={`${cardClass} sticky top-0 z-10 bg-[#161A1E]`}> {/* Added sticky for nav */}
                <WeekNavigator
                    currentWeekLabel={getWeekLabel(weekOffset)}
                    onPrev={() => setWeekOffset(weekOffset - 1)}
                    onNext={() => setWeekOffset(weekOffset + 1)}
                />
            </div>

            <Accordion type="multiple" defaultValue={["calories", "steps"]} className="space-y-3">
                <AccordionItem value="calories" title="Calories Burned" classNames={{trigger: "data-[hover=true]:bg-[#2a2e33]", content:"pt-0"}}>
                    <div className={`${cardClass} mb-0`}> {/* Remove mb-4 from inner card if Accordion handles spacing */}
                        <h3 className={`${sectionTitleClass} flex justify-between items-center`}>Weekly Burn Trend
                            <span className="text-xs text-gray-500 font-normal">Goal: {calorieGoal} kcal/day</span>
                        </h3>
                        {/* Ideally, a bar chart with goal band */}
                        <SparklineChart data={caloriesData} height={70} color="#D100F5" goalValue={calorieGoal} goalColor="#555" />
                         <div className="text-xs text-gray-400 mt-1">Avg: {Math.round(caloriesData.reduce((a,b)=>a+b,0)/7)} kcal</div>
                    </div>
                </AccordionItem>

                <AccordionItem value="steps" title="Daily Steps" classNames={{trigger: "data-[hover=true]:bg-[#2a2e33]", content:"pt-0"}}>
                    <div className={`${cardClass} mb-0`}>
                        <h3 className={`${sectionTitleClass} flex justify-between items-center`}>Weekly Steps Trend
                             <span className="text-xs text-gray-500 font-normal">Goal: {stepGoal.toLocaleString()} steps/day</span>
                        </h3>
                        {/* Ideally, a bar chart with goal line */}
                        <SparklineChart data={stepsData} height={70} color="#EC4899" goalValue={stepGoal} goalColor="#555" />
                        <div className="text-xs text-gray-400 mt-1">Avg: {Math.round(stepsData.reduce((a,b)=>a+b,0)/7).toLocaleString()} steps</div>
                    </div>
                </AccordionItem>
            </Accordion>

            {/* 4. Workout Contributions */}
            <div className={cardClass}>
                <h3 className={sectionTitleClass}>Workout Contributions This Week</h3>
                {mockLoggedWorkouts.length > 0 ? (
                    <div className="space-y-2 text-xs">
                        {mockLoggedWorkouts.map(wo => (
                            <div key={wo.name} className="p-2 bg-[#2a2e33] rounded flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-white">{wo.name} <span className="text-gray-500">({wo.day})</span></p>
                                    <p className="text-gray-400">{wo.duration} - RPE {wo.rpe}</p>
                                </div>
                                <p className="font-semibold text-orange-400">{wo.kcal} kcal</p>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-xs text-gray-500 italic">No workouts logged this week.</p>}
            </div>

            {/* 5. Daily Breakdown Grid */}
            <div className={cardClass}>
                <h3 className={`${sectionTitleClass} mb-2 flex justify-between items-center`}>
                    Daily Snapshot
                    <Button size="sm" variant="light" onPress={() => setShowReadiness(!showReadiness)} className="text-xs text-gray-400 hover:text-white">
                        {showReadiness ? <EyeOff size={14}/> : <Eye size={14}/>} {showReadiness ? "Hide" : "Show"} Readiness
                    </Button>
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left min-w-[600px]">
                        <thead>
                            <tr className="text-gray-400">
                                <th className="pb-1 font-normal">Day</th>
                                <th className="pb-1 font-normal text-right">Burn</th>
                                <th className="pb-1 font-normal text-right">Steps</th>
                                <th className="pb-1 font-normal text-center">Workout</th>
                                <th className="pb-1 font-normal text-right">Intake</th>
                                <th className="pb-1 font-normal text-right">Net</th>
                                {showReadiness && <th className="pb-1 font-normal text-right">HRV</th>}
                                {showReadiness && <th className="pb-1 font-normal text-right">RHR</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {mockDailyBreakdownData.map(d => (
                                <tr key={d.day} className="hover:bg-[#2a2e33]">
                                    <td className="py-1.5 text-white font-medium">{d.day}</td>
                                    <td className="py-1.5 text-right text-orange-400">{d.burn.toLocaleString()}</td>
                                    <td className="py-1.5 text-right text-pink-400">{d.steps.toLocaleString()}</td>
                                    <td className="py-1.5 text-center">{d.workout ? <Zap size={14} className="text-teal-500 inline"/> : '-'}</td>
                                    <td className="py-1.5 text-right text-green-400">{d.consumed.toLocaleString()}</td>
                                    <td className={`py-1.5 text-right font-medium ${d.deficit > 0 ? 'text-green-500' : 'text-red-500'}`}>{d.deficit > 0 ? '+': ''}{d.deficit.toLocaleString()}</td>
                                    {showReadiness && <td className={`py-1.5 text-right ${d.hrv > 60 ? 'text-sky-400' : 'text-sky-600'}`}>{d.hrv}</td>}
                                    {showReadiness && <td className={`py-1.5 text-right ${d.rhr < 60 ? 'text-sky-400' : 'text-sky-600'}`}>{d.rhr}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 6. Best & Worst Callouts */}
            <div className={`${cardClass} grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs`}>
                <div className="bg-[#2a2e33] p-2 rounded">
                    <p className="text-gray-400"><Award size={14} className="inline mr-1 text-yellow-400"/> Best Burn Day</p>
                    <p className="text-white font-semibold">Tuesday: 2,850 kcal</p>
                </div>
                <div className="bg-[#2a2e33] p-2 rounded">
                    <p className="text-gray-400"><Footprints size={14} className="inline mr-1 text-pink-400"/> Step PR</p>
                    <p className="text-white font-semibold">Saturday: 14,230 steps</p>
                </div>
            </div>

            {/* 8. Projected Time-to-Goal (Placeholder) */}
            <div className={cardClass}>
                <h3 className={sectionTitleClass}>Progress Outlook</h3>
                <p className="text-xs text-gray-300 italic">
                  "At your current average weekly deficit of 350 kcal/day, you're on track to reach your weight goal in approximately <span class="text-white font-semibold">6 weeks</span>."
                </p>
            </div>

            {/* 9. AI Commentary */}
            <div className={cardClass}>
                <h3 className={sectionTitleClass}><MessageSquare size={16} className="inline mr-1 text-purple-400" /> AI Weekly Summary</h3>
                <p className="text-xs text-gray-300 italic">
                  "Solid week! Your calorie burn peaked on Saturday with that hike. Sunday's activity was lower, but your HRV suggests good recovery. Consider a light walk or mobility session to maintain momentum."
                </p>
                 <p aria-live="polite" className="sr-only">Week switched to {getWeekLabel(weekOffset)}</p>
            </div>

            {/* 10. Quick Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button className="bg-sky-600 hover:bg-sky-700 text-white flex-1"><PlusCircle size={16} className="mr-2"/> Log Activity</Button>
                <Button variant="bordered" className="text-gray-300 border-gray-600 flex-1"><UploadCloud size={16} className="mr-2"/> Import Data</Button>
                <Button variant="bordered" className="text-gray-300 border-gray-600 flex-1"><Share2 size={16} className="mr-2"/> Share Summary</Button>
            </div>
        </div>
    );
};

export default WeeklyActivityDetail;