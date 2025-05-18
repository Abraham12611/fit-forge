'use client';

import React, { useState } from 'react';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Flame, Droplet, Utensils, Zap, Activity, CheckCircle2, TrendingUp, Brain, Weight, BarChart, CalendarDays, Target } from 'lucide-react'; // Common icons
import KpiCard from './KpiCard';
import SparklineChart from './SparklineChart';
import MetricDetailModal from './MetricDetailModal';
import CaloriesBurnedDetail from './detailViews/CaloriesBurnedDetail';

// Mock data generation (simplified)
const generateLast7DaysData = () => {
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      caloriesBurned: Math.floor(Math.random() * 500) + 2000, // 2000-2500
      caloriesConsumed: Math.floor(Math.random() * 500) + 1800, // 1800-2300
      protein: Math.floor(Math.random() * 30) + 120, // 120-150g
      carbs: Math.floor(Math.random() * 50) + 200, // 200-250g
      fat: Math.floor(Math.random() * 20) + 50, // 50-70g
      waterIntake: Math.floor(Math.random() * 1000) + 2000, // 2000-3000ml
      workoutsCompleted: Math.random() > 0.3 ? 1 : 0,
      workoutsPlanned: 1,
      steps: Math.floor(Math.random() * 5000) + 5000, // 5000-10000
    });
  }
  return data;
};

const mockUserData = {
  name: "Alex Fit",
  targetWater: 3000, // ml
  targetCalories: 2200,
  targetProtein: 140,
  targetCarbs: 230,
  targetFat: 60,
  dailyMetrics: generateLast7DaysData(),
};

// Helper for simple donut chart (SVG)
const DonutChart = ({ percentage, color = "#D100F5", size = 60, strokeWidth = 8 }: { percentage: number, color?: string, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="#333" // background track color
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
};


const DashboardSection = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const todayMetrics = mockUserData.dailyMetrics[mockUserData.dailyMetrics.length - 1];
  const weeklyWorkoutsCompleted = mockUserData.dailyMetrics.reduce((sum, day) => sum + day.workoutsCompleted, 0);
  const weeklyWorkoutsPlanned = mockUserData.dailyMetrics.length; // Assuming 1 planned per day for mock

  const openModal = (modalName: string) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  return (
    <section className="py-12 md:py-16 px-4 bg-[#0E0E12] text-white">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Your Dashboard</h2>

        {/* Top KPI Tiles Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
          <KpiCard
            title="Calories Burned"
            value={`${todayMetrics.caloriesBurned} kcal`}
            icon={<Flame className="text-[#D100F5]" size={28} />}
            trendData={mockUserData.dailyMetrics.map(d => d.caloriesBurned)}
            subValue={`Target: ${mockUserData.targetCalories} kcal`}
            onClick={() => openModal('caloriesBurned')}
            className="cursor-pointer hover:border-[#D100F5]/50 transition-colors"
          />
          <KpiCard
            title="Calories Consumed"
            value={`${todayMetrics.caloriesConsumed} kcal`}
            icon={<Utensils className="text-green-400" size={28} />}
            chartElement={<DonutChart percentage={(todayMetrics.caloriesConsumed / todayMetrics.caloriesBurned) * 100} color="rgb(52, 211, 153)" />}
            subValue={`${Math.round((todayMetrics.caloriesConsumed / mockUserData.targetCalories)*100)}% of target`}
          />
          <KpiCard
            title="Hydration"
            value={`${todayMetrics.waterIntake} ml`}
            icon={<Droplet className="text-blue-400" size={28} />}
            chartElement={
              <div className="w-full mt-2">
                <Progress
                  value={(todayMetrics.waterIntake / mockUserData.targetWater) * 100}
                  size="sm"
                  classNames={{ indicator: "bg-blue-400" }}
                />
              </div>
            }
            subValue={`${Math.round((todayMetrics.waterIntake / mockUserData.targetWater) * 100)}% of ${mockUserData.targetWater}ml`}
          />
          <KpiCard
            title="Workouts This Week"
            value={`${weeklyWorkoutsCompleted} / ${weeklyWorkoutsPlanned}`}
            icon={<CheckCircle2 className="text-teal-400" size={28} />}
            chartElement={<DonutChart percentage={(weeklyWorkoutsCompleted/weeklyWorkoutsPlanned)*100} color="rgb(45, 212, 191)" />}
            subValue="Completed"
          />
           <KpiCard
            title="Daily Steps"
            value={todayMetrics.steps.toLocaleString()}
            icon={<Activity className="text-orange-400" size={28} />}
            trendData={mockUserData.dailyMetrics.map(d => d.steps)}
            subValue="Keep it up!"
          />
        </div>

        {/* More detailed sections - Placeholder for now */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-[#161A1E] border border-gray-700 rounded-xl shadow-xl">
            <CardHeader className="border-b border-gray-600 p-4">
              <h3 className="text-lg font-semibold flex items-center">
                <BarChart className="mr-2 text-purple-400" /> Macronutrients (Today)
              </h3>
            </CardHeader>
            <CardBody className="p-4 space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Protein</span>
                  <span>{todayMetrics.protein}g / {mockUserData.targetProtein}g</span>
                </div>
                <Progress value={(todayMetrics.protein/mockUserData.targetProtein)*100} classNames={{indicator: "bg-green-500"}} size="sm"/>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Carbs</span>
                  <span>{todayMetrics.carbs}g / {mockUserData.targetCarbs}g</span>
                </div>
                <Progress value={(todayMetrics.carbs/mockUserData.targetCarbs)*100} classNames={{indicator: "bg-blue-500"}} size="sm"/>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Fat</span>
                  <span>{todayMetrics.fat}g / {mockUserData.targetFat}g</span>
                </div>
                <Progress value={(todayMetrics.fat/mockUserData.targetFat)*100} classNames={{indicator: "bg-yellow-500"}} size="sm"/>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-[#161A1E] border border-gray-700 rounded-xl shadow-xl">
            <CardHeader className="border-b border-gray-600 p-4">
              <h3 className="text-lg font-semibold flex items-center">
                <CalendarDays className="mr-2 text-indigo-400" /> Weekly Activity
              </h3>
            </CardHeader>
            <CardBody className="p-4">
              <p className="text-gray-400 text-sm mb-2">Calories Burned - Last 7 Days</p>
              <SparklineChart data={mockUserData.dailyMetrics.map(d => d.caloriesBurned)} width={280} height={80} color="#D100F5" />
               <p className="text-gray-400 text-sm mt-4 mb-2">Steps - Last 7 Days</p>
              <SparklineChart data={mockUserData.dailyMetrics.map(d => d.steps)} width={280} height={80} color="#34D399" />
            </CardBody>
          </Card>

          <Card className="bg-[#161A1E] border border-gray-700 rounded-xl shadow-xl">
            <CardHeader className="border-b border-gray-600 p-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Target className="mr-2 text-rose-400" /> Goals Overview
              </h3>
            </CardHeader>
            <CardBody className="p-4 space-y-2 text-sm">
              <p>Focus: <span className="font-semibold text-rose-300">Weight Maintenance</span> (Example)</p>
              <p>Next Plan Review: <span className="font-semibold">3 days</span></p>
              <p>Streak (Calorie Target): <span className="font-semibold text-amber-400">5 days 🔥</span></p>
              <button className="mt-3 w-full text-sm bg-[#D100F5] hover:bg-opacity-80 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Adjust Goals
              </button>
            </CardBody>
          </Card>

        </div>
      </div>

      <MetricDetailModal
        isOpen={activeModal === 'caloriesBurned'}
        onClose={closeModal}
        title="🔥 Calories Burned Details"
      >
        <CaloriesBurnedDetail
            todayBurned={todayMetrics.caloriesBurned}
            targetBurned={mockUserData.targetCalories}
        />
      </MetricDetailModal>

    </section>
  );
};

export default DashboardSection;