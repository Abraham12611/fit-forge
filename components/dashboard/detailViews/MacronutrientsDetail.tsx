'use client';

import React from 'react';
import { Button } from "@heroui/button";
import { PieChart, ListChecks, Target, MessageSquare, PlusCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react'; // Replaced BarChart3 with ListChecks for food list
import { Tabs, Tab } from "@heroui/react"; // Assuming HeroUI Tabs

// Re-using RingGauge, or define it here if not shared
const RingGauge = ({ percentage, color = "#A855F7", size = 100, strokeWidth = 10, label, valueText }: {
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

const FullWidthMacroBar = ({ protein, carbs, fat, proteinGoal, carbGoal, fatGoal, height = 25 }: {
    protein: number, carbs: number, fat: number,
    proteinGoal: number, carbGoal: number, fatGoal: number,
    height?: number
}) => {
    const totalGoalGrams = proteinGoal + carbGoal + fatGoal;
    if (totalGoalGrams === 0) return <div className="h-6 bg-gray-700 rounded" />;

    const proteinKcal = protein * 4;
    const carbsKcal = carbs * 4;
    const fatKcal = fat * 9;
    const totalKcalConsumed = proteinKcal + carbsKcal + fatKcal;
    if (totalKcalConsumed === 0) return <div className="h-6 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-400">No macros logged</div>;

    const pWidth = (proteinKcal / totalKcalConsumed) * 100;
    const cWidth = (carbsKcal / totalKcalConsumed) * 100;
    const fWidth = (fatKcal / totalKcalConsumed) * 100;

    return (
        <div className="w-full">
            <div className="flex w-full rounded overflow-hidden shadow" style={{ height: `${height}px` }}>
                <div style={{ width: `${pWidth}%`, backgroundColor: '#22C55E' }} className="flex items-center justify-center text-xs text-white font-semibold" title={`Protein: ${protein}g (${Math.round(pWidth)}% kcal)`}>P</div>
                <div style={{ width: `${cWidth}%`, backgroundColor: '#3B82F6' }} className="flex items-center justify-center text-xs text-white font-semibold" title={`Carbs: ${carbs}g (${Math.round(cWidth)}% kcal)`}>C</div>
                <div style={{ width: `${fWidth}%`, backgroundColor: '#F59E0B' }} className="flex items-center justify-center text-xs text-white font-semibold" title={`Fat: ${fat}g (${Math.round(fWidth)}% kcal)`}>F</div>
            </div>
            <div className="flex justify-between text-xs mt-1.5 px-1 text-gray-400">
                <span><span className="font-bold text-green-400">P:</span> {protein}g / {proteinGoal}g</span>
                <span><span className="font-bold text-blue-400">C:</span> {carbs}g / {carbGoal}g</span>
                <span><span className="font-bold text-amber-400">F:</span> {fat}g / {fatGoal}g</span>
            </div>
        </div>
    );
};

const mockFoodLog = {
    protein: [{ name: 'Chicken Breast', amount: '150g', value: 45 }, { name: 'Greek Yogurt', amount: '200g', value: 20 }, { name: 'Protein Shake', amount: '1 scoop', value: 24 }],
    carbs: [{ name: 'Oats', amount: '80g', value: 50 }, { name: 'Banana', amount: '1 medium', value: 27 }, { name: 'Sweet Potato', amount: '200g', value: 40 }],
    fat: [{ name: 'Avocado', amount: '1/2 medium', value: 15 }, { name: 'Almonds', amount: '30g', value: 14 }, { name: 'Olive Oil', amount: '1 tbsp', value: 14 }],
};

interface MacronutrientsDetailProps {
  consumedKcal?: number;
  targetKcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  proteinGoal?: number;
  carbGoal?: number;
  fatGoal?: number;
}

const MacronutrientsDetail: React.FC<MacronutrientsDetailProps> = ({
  consumedKcal = 1850,
  targetKcal = 2200,
  protein = 135, carbs = 200, fat = 55,
  proteinGoal = 140, carbGoal = 250, fatGoal = 60
}) => {
  const sectionTitleClass = "text-sm uppercase tracking-wide text-gray-400 mb-3 font-semibold";
  const cardClass = "bg-[#1F2328] p-4 rounded-lg mb-4";

  return (
    <div className="text-sm">
        <Tabs aria-label="Macronutrient timeframe" color="secondary" variant="underlined" fullWidth>
            <Tab key="today" title="Today">
                <div className={cardClass}>
                    {/* 1. Header Recap */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                        <div className="flex items-center">
                        <PieChart className="text-purple-500 mr-3" size={36} />
                        <div>
                            <p className="text-2xl font-bold">{protein}g <span className="text-base text-gray-400">Protein ({Math.round(protein/proteinGoal*100)}%)</span></p>
                            <p className="text-gray-400 text-xs">Target: {proteinGoal}g</p>
                        </div>
                        </div>
                         <RingGauge
                            percentage={(consumedKcal / targetKcal) * 100}
                            valueText={`${Math.round((consumedKcal / targetKcal) * 100)}%`}
                            label={`of ${targetKcal} kcal`}
                            color="#A855F7"
                            size={80}
                        />
                    </div>
                     <FullWidthMacroBar protein={protein} carbs={carbs} fat={fat} proteinGoal={proteinGoal} carbGoal={carbGoal} fatGoal={fatGoal} />
                </div>

                {/* 3. Foods Contributing Most */}
                <div className={cardClass}>
                    <h3 className={sectionTitleClass}>Key Food Sources (Today)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                            <h4 className="font-semibold text-green-400 mb-1">Protein</h4>
                            {mockFoodLog.protein.map(f => <p key={f.name} className="text-gray-300">{f.name} <span className="text-gray-500">({f.value}g)</span></p>)}
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-400 mb-1">Carbohydrates</h4>
                            {mockFoodLog.carbs.map(f => <p key={f.name} className="text-gray-300">{f.name} <span className="text-gray-500">({f.value}g)</span></p>)}
                        </div>
                        <div>
                            <h4 className="font-semibold text-amber-400 mb-1">Fats</h4>
                            {mockFoodLog.fat.map(f => <p key={f.name} className="text-gray-300">{f.name} <span className="text-gray-500">({f.value}g)</span></p>)}
                        </div>
                    </div>
                </div>

                {/* 4. Distribution Timeline (Placeholder) */}
                <div className={cardClass}>
                    <h3 className={sectionTitleClass}>Macro Distribution Timeline</h3>
                    <div className="h-32 bg-[#2a2e33] rounded flex items-center justify-center text-gray-500 italic">
                    Placeholder: Multi-line area chart (P/C/F by meal time)
                    </div>
                </div>

                {/* 6. Fiber & Sugar Bonus (Placeholder) */}
                <div className={cardClass}>
                    <h3 className={sectionTitleClass}>Bonus: Fiber & Sugar Intake</h3>
                    <div className="h-20 bg-[#2a2e33] rounded flex items-center justify-center text-gray-500 italic">
                    Placeholder: Mini bars for fiber & added sugar vs guidelines
                    </div>
                </div>
            </Tab>
            <Tab key="week" title="Week Avg.">
                <div className={cardClass}>
                    <h3 className={sectionTitleClass}>7-Day Macronutrient Averages</h3>
                    <div className="h-40 bg-[#2a2e33] rounded flex items-center justify-center text-gray-500 italic">
                        Placeholder: Table with Avg Gram & % vs Target (color-coded)
                    </div>
                </div>
            </Tab>
            {/* <Tab key="month" title="Month Avg."> ... </Tab> */}
        </Tabs>

      {/* 7. AI Tip */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}><MessageSquare size={16} className="inline mr-1 text-purple-400" /> AI Nutrition Tip</h3>
        <p className="text-xs text-gray-300 italic">
          "Your carbohydrate intake tends to be higher in the evenings. Consider shifting about 30g of carbs to your breakfast for more sustained energy throughout the day."
        </p>
      </div>

      {/* 8. Quick Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button className="bg-purple-600 hover:bg-purple-700 text-white flex-1"><PlusCircle size={16} className="mr-2"/> Add Food / Meal</Button>
        <Button variant="bordered" className="text-gray-300 border-gray-600 flex-1"><Target size={16} className="mr-2"/> Adjust Macro Targets</Button>
      </div>
    </div>
  );
};

export default MacronutrientsDetail;