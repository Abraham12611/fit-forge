'use client';

import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/card';
import { Badge } from '@heroui/badge';
import { IconSvgProps } from '@/types'; // Assuming you have this for icon props

// Placeholder icons - replace with actual Lucide SVGs
const DumbbellIcon: React.FC<IconSvgProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4 9.6 9.6M9.6 14.4 14.4 9.6M21 9A6 6 0 0 0 9 9M3 15a6 6 0 0 0 12 0"/><path d="M12 12V6H6v债务人"/><path d="M12 12v6h6v债务人"/></svg>
);
const ForkKnifeIcon: React.FC<IconSvgProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-7a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v7"/><path d="M16 21h-8"/><path d="M15 2H9"/><path d="M12 11V2"/></svg>
);
const FlameIcon: React.FC<IconSvgProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9c0 .79.1 1.56.29 2.29"/><path d="m14.5 10.5-4.5-4.5"/><path d="m10.5 14.5 4.5 4.5"/></svg>
);

interface Exercise {
  name: string;
  sets: number;
  reps: string | number;
}

interface Meal {
  meal: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  item: string;
  kcal: number;
  macros: { p: number; c: number; f: number };
}

export interface DayPlan {
  day: string; // e.g., "Mon"
  dayFullName: string; // e.g., "Monday"
  kcal: number; // Total estimated kcal for the day (sum of meals + workouts)
  workouts: Array<{
    title: string;
    burn_kcal_est?: number;
    exercises: Exercise[];
  }>;
  meals: Meal[];
  macros: { p: number; c: number; f: number }; // Total macros for the day
  accentFrom: string;
  accentTo: string;
}

interface DayCardProps {
  plan: DayPlan;
}

const DayCard: React.FC<DayCardProps> = ({ plan }) => {
  const headerGradient = `bg-gradient-to-r ${plan.accentFrom} ${plan.accentTo}`;
  const totalWorkoutKcal = plan.workouts.reduce((sum, workout) => sum + (workout.burn_kcal_est || 0), 0);
  const totalMealKcal = plan.meals.reduce((sum, meal) => sum + meal.kcal, 0);

  // Determine the ring hover color based on the accentFrom prop
  // This is a workaround for Tailwind not supporting fully dynamic hover classes
  let ringHoverClass = 'hover:ring-magenta-500/40'; // Default
  if (plan.accentFrom.includes('violet')) ringHoverClass = 'hover:ring-violet-500/40';
  else if (plan.accentFrom.includes('blue')) ringHoverClass = 'hover:ring-blue-500/40';
  else if (plan.accentFrom.includes('cyan')) ringHoverClass = 'hover:ring-cyan-500/40';
  else if (plan.accentFrom.includes('emerald')) ringHoverClass = 'hover:ring-emerald-500/40';
  else if (plan.accentFrom.includes('amber')) ringHoverClass = 'hover:ring-amber-500/40';
  else if (plan.accentFrom.includes('rose')) ringHoverClass = 'hover:ring-rose-500/40';


  return (
    <Card
      radius="lg"
      className={`backdrop-blur-sm bg-white/5 ring-1 ring-white/10 transition-all duration-300 hover:scale-[1.02] shadow-[0_30px_60px_-10px_rgba(0,0,0,.6)] max-w-[360px] min-w-[280px] md:min-w-[320px] lg:min-w-[340px] ${ringHoverClass}`}
      classNames={{
        // base: `hover:ring-[${plan.accentFrom.replace("from-","")}]`, // Removed due to dynamic class issue
        header: `flex items-center gap-3 p-4 border-b border-white/10 ${headerGradient} bg-clip-text text-transparent animate-gradient-x`,
        body: "p-4 overflow-y-auto max-h-[60vh]",
        footer: "p-4 border-t border-white/10 flex flex-wrap justify-between items-center gap-2",
      }}
      role="group"
      aria-label={`Plan for ${plan.dayFullName}`}
    >
      <CardHeader>
        {plan.day === "Mon" || plan.day === "Fri" ? <DumbbellIcon className="w-6 h-6" /> : <FlameIcon className="w-6 h-6" />}
        <h3 className="text-2xl font-semibold tracking-tight">{plan.dayFullName}</h3>
      </CardHeader>

      <CardBody>
        {plan.workouts && plan.workouts.length > 0 && (
          <div className="mb-6">
            <h4 className={`text-lg font-semibold mb-2 ${headerGradient} bg-clip-text text-transparent`}>Workouts</h4>
            {plan.workouts.map((workout, index) => (
              <div key={index} className="mb-3">
                <p className="font-medium text-white">
                  {workout.title}
                  {workout.burn_kcal_est && (
                    <span className="text-sm text-gray-400 ml-2">
                      (Est. {workout.burn_kcal_est} kcal)
                    </span>
                  )}
                </p>
                <ul className="list-disc list-inside marker:text-white/70 text-sm text-gray-300 space-y-1 pl-2">
                  {workout.exercises.map((ex, exIndex) => (
                    <li key={exIndex} className="truncate" title={ex.name}>
                      {ex.name}: {ex.sets} sets x {ex.reps} reps
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {plan.meals && plan.meals.length > 0 && (
          <div>
            <h4 className={`text-lg font-semibold mb-2 ${headerGradient} bg-clip-text text-transparent`}>Meals</h4>
            <ul className="list-disc list-inside marker:text-white/70 text-sm text-gray-300 space-y-1 pl-2">
              {plan.meals.map((meal, index) => (
                <li key={index} className="mb-1 truncate" title={`${meal.item} - P:${meal.macros.p}g C:${meal.macros.c}g F:${meal.macros.f}g`}>
                  {meal.item} ({meal.kcal} kcal)
                  <span className="block text-xs text-gray-400">
                    P: {meal.macros.p}g, C: {meal.macros.c}g, F: {meal.macros.f}g
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>

      <CardFooter>
        <div className="flex gap-2">
          {/* Badge styling will need to be addressed similarly to ring hover or use predefined color props */}
          <Badge color="primary" variant="flat" size="sm" >P: {plan.macros.p}g</Badge>
          <Badge color="primary" variant="flat" size="sm" >C: {plan.macros.c}g</Badge>
          <Badge color="primary" variant="flat" size="sm" >F: {plan.macros.f}g</Badge>
        </div>
        <div className="text-sm text-gray-400 flex items-center gap-1">
          <FlameIcon className="w-4 h-4" />
          <span>Est. {totalWorkoutKcal + totalMealKcal} kcal</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DayCard;