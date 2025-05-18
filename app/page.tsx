'use client'; // For form interactions

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image'; // For the dumbbell image
import type { Selection } from '@react-types/shared'; // Import Selection type
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { CheckboxGroup, Checkbox } from "@heroui/checkbox";
import { Spinner } from "@heroui/spinner"; // For loading state
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card"; // For displaying results/errors, added CardHeader, CardFooter
import { addToast } from "@heroui/toast"; // Import addToast
import { title as titlePrimitive, subtitle as subtitlePrimitive } from "@/components/primitives"; // Renamed to avoid conflict
import { Link as HeroUILink } from "@heroui/link"; // For any HeroUI specific links if needed
import DayCard, { DayPlan } from '@/components/DayCard'; // Import the new DayCard
import { useKeenSlider } from 'keen-slider/react'; // Import keen-slider
import 'keen-slider/keen-slider.min.css'; // Import keen-slider CSS
import DashboardSection from "@/components/dashboard/DashboardSection"; // Import the new DashboardSection
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react"; // HeroUI Modal components
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'; // For actual charts later. Corrected imports based on documentation.
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement as ChartJSBarElement, Title, Filler } from 'chart.js'; // Renamed BarElement to avoid conflict

// Import Detail Views
import CaloriesBurnedDetail from '@/components/dashboard/detailViews/CaloriesBurnedDetail';
import CaloriesConsumedDetail from '@/components/dashboard/detailViews/CaloriesConsumedDetail';
import HydrationDetail from '@/components/dashboard/detailViews/HydrationDetail';
import WorkoutsDetail from '@/components/dashboard/detailViews/WorkoutsDetail';
import DailyStepsDetail from '@/components/dashboard/detailViews/DailyStepsDetail';
import MacronutrientsDetail from '@/components/dashboard/detailViews/MacronutrientsDetail';
import WeeklyActivityDetail from '@/components/dashboard/detailViews/WeeklyActivityDetail';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, ChartJSBarElement, Title, Filler);

// Icons for the bottom indicators (assuming these are available or can be created)
const GaugeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27383 20.9074 6.80338 19.1602 4.99909M12 6V12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const GlassIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/></svg>;
const ConfettiIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4V8H8M4 20V16H8M20 4V8H16M20 20V16H16M12 9L10 11L12 13L14 11L12 9ZM9 14L7 16L9 18L11 16L9 14ZM15 14L13 16L15 18L17 16L15 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// Placeholder icons for carousel controls - replace with actual Lucide SVGs or HeroUI icons if available
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

interface ApiExercise {
  name: string;
  sets: number;
  reps: string | number;
}

interface ApiWorkoutDay {
  day: string;
  title: string;
  burn_kcal_est?: number; // Optional as per current usage, though prompt implies it
  exercises: ApiExercise[];
}

interface ApiMacros {
  p: number; // protein_g
  c: number; // carbs_g
  f: number; // fat_g
}

interface ApiMealItem {
  day: string;
  meal: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  item: string;
  kcal: number;
  macros: ApiMacros;
}

interface ApiPlanResponse {
  workouts?: ApiWorkoutDay[];
  meals?: ApiMealItem[];
  error?: string;
  details?: string;
  rawResponse?: string;
}

// Helper to get full day name
const getDayFullName = (shortDay: string): string => {
  const names: { [key: string]: string } = {
    Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
  };
  return names[shortDay] || shortDay;
};

// Day-specific accent colors
const dayAccents: { [key: string]: { from: string; to: string } } = {
  Mon: { from: "from-magenta-500", to: "to-fuchsia-500" }, //rgb(154, 38, 174) → #FF4ECD (approx)
  Tue: { from: "from-violet-500", to: "to-purple-500" },  // #7C3AED → #A855F7
  Wed: { from: "from-blue-500", to: "to-sky-500" },      // #3B82F6 → #60A5FA
  Thu: { from: "from-cyan-500", to: "to-teal-500" },    // #06B6D4 → #2DD4BF
  Fri: { from: "from-emerald-500", to: "to-green-500" },// #10B981 → #34D399
  Sat: { from: "from-amber-500", to: "to-yellow-500" },  // #F59E0B → #FBBF24
  Sun: { from: "from-rose-500", to: "to-pink-500" },    // #EC4899 → #F472B6
};

interface UserData {
  // ... existing UserData fields
  activityLevel?: string;
  dietaryPreferences?: string[];
  healthConditions?: string[];
}

interface PlanResponse {
  // ... existing PlanResponse fields
}

// Sample data for dashboard elements (replace with actual state/props)
const mockDashboardData = {
    caloriesBurned: { current: 2350, goal: 2500, trend: [2200, 2400, 2300, 2550, 2450, 2350, 2600] },
    caloriesConsumed: { current: 1890, goal: 2200, trend: [2000, 1900, 2100, 1800, 1950, 2050, 1890], protein: 120, carbs: 200, fat: 60 },
    hydration: { current: 1800, goal: 2500, trend: [1500, 1600, 1400, 1700, 1800, 1750, 1650] },
    workouts: { current: 3, goal: 5, trend: [2,3,1,3,2,4,3] }, // workouts this week
    steps: { current: 7800, goal: 10000, trend: [7000, 8000, 6500, 9000, 7500, 10200, 7800] },
    macros: { protein: {current: 130, goal: 150}, carbs: {current: 210, goal: 250}, fat: {current: 55, goal: 70}},
    weeklyActivity: {caloriesTrend: [2200,2400,2100,2500,2300,2800,1900], stepsTrend: [8000,7500,6000,9500,11000,14000,7000]}
};

const equipamentoOptions = [
  // ... existing equipamentoOptions
];

const objetivosOptions = [
  // ... existing objetivosOptions
];

const dietOptions = [
    { key: "balanced", label: "Balanced" },
    { key: "low-carb", label: "Low Carb" },
    { key: "high-protein", label: "High Protein" },
    { key: "keto", label: "Keto" },
    { key: "vegetarian", label: "Vegetarian" },
    { key: "vegan", label: "Vegan" },
];

const healthConditionsOptions = [
    { key: "none", label: "None" },
    { key: "diabetes", label: "Diabetes" },
    { key: "hypertension", label: "Hypertension" },
    { key: "cholesterol", label: "High Cholesterol" },
    { key: "celiac", label: "Celiac Disease (Gluten-Free)" },
    { key: "lactose", label: "Lactose Intolerance" },
];

export default function HomePage() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<string | undefined>(undefined);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [activityLevel, setActivityLevel] = useState<Selection>(new Set([]));
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [healthConditions, setHealthConditions] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [apiPlanResult, setApiPlanResult] = useState<ApiPlanResponse | null>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    created() {
      setLoaded(true);
    },
    loop: true,
    slides: { perView: 1, spacing: 15 },
    breakpoints: {
      '(min-width: 768px)': {
        slides: { perView: 2, spacing: 20 },
      },
      '(min-width: 1024px)': {
        slides: { perView: 3, spacing: 25 },
      },
    },
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
  const [selectedDetail, setSelectedDetail] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");

  // Load plan and user preferences from local storage on component mount
  useEffect(() => {
    // Clear the last plan from localStorage on component mount
    localStorage.removeItem('lastFitForgePlan');
    // Set planResult to null to ensure a fresh start if a plan was previously loaded
    setApiPlanResult(null);

    // Load saved user preferences
    try {
      const savedPrefs = localStorage.getItem('fitForgeUserPrefs');
      if (savedPrefs) {
        const { height: savedHeight, weight: savedWeight, goal: savedGoal, equipment: savedEquipment } = JSON.parse(savedPrefs);
        if (savedHeight) setHeight(savedHeight);
        if (savedWeight) setWeight(savedWeight);
        if (savedGoal) setGoal(savedGoal);
        if (savedEquipment) setEquipment(savedEquipment);
        // toast.show({ title: "Preferences Loaded", description: "Your previous inputs have been pre-filled.", status: "info" }); // Optional: can be too noisy
      }
    } catch (error) {
      console.error("Error loading user preferences from local storage:", error);
      // Don't show a toast for this, as it's not critical if prefs don't load
      localStorage.removeItem('fitForgeUserPrefs');
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setApiPlanResult(null);

    // Basic client-side validation (can be expanded)
    if (!height || !weight || !goal) {
      addToast({ title: "Missing Fields", description: "Please fill in height, weight, and primary goal.", color: "warning" });
      setIsLoading(false);
      return;
    }

    const formData = { height, weight, goal, equipment, activityLevel, dietaryPreferences, healthConditions };

    // Save current user preferences
    try {
      localStorage.setItem('fitForgeUserPrefs', JSON.stringify(formData));
    } catch (storageError) {
      console.error("Error saving user preferences to local storage:", storageError);
      // Non-critical, don't necessarily need a toast unless it becomes a persistent issue.
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: ApiPlanResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to generate plan. Status: ' + response.status);
      }

      setApiPlanResult(data);
      // Save plan to local storage
      try {
        localStorage.setItem('lastFitForgePlan', JSON.stringify(data));
        addToast({ title: "Plan Generated!", description: "Your personalized plan is ready and saved.", color: "success" });
      } catch (storageError) {
        console.error("Error saving plan to local storage:", storageError);
        addToast({ title: "Storage Error", description: "Plan generated, but failed to save to local storage.", color: "warning" });
      }

    } catch (error: any) {
      console.error("Error submitting form:", error);
      addToast({ title: "Generation Failed", description: error.message || "An unexpected error occurred.", color: "danger" });
    } finally {
      setIsLoading(false);
    }

    // For now, let's just show the dashboard with mock data on any form submit
    // if successful generation, or if a plan exists in local storage.
    setShowDashboard(true);
  };

  const transformedPlanForCarousel: DayPlan[] = useMemo(() => {
    if (!apiPlanResult || !apiPlanResult.workouts || !apiPlanResult.meals) return [];
    const daysOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return daysOrder.map(dayShort => {
      const dayWorkoutsApi = apiPlanResult.workouts?.filter(w => w.day === dayShort) || [];
      const dayMealsApi = apiPlanResult.meals?.filter(m => m.day === dayShort) || [];

      const totalDayKcal =
        (dayWorkoutsApi.reduce((sum, w) => sum + (w.burn_kcal_est || 0), 0)) +
        (dayMealsApi.reduce((sum, m) => sum + m.kcal, 0));

      const totalDayMacros = dayMealsApi.reduce((acc, meal) => {
        acc.p += meal.macros.p;
        acc.c += meal.macros.c;
        acc.f += meal.macros.f;
        return acc;
      }, { p: 0, c: 0, f: 0 });

      return {
        // Properties matching DayPlan interface from DayCard.tsx
        day: dayShort,
        dayFullName: getDayFullName(dayShort),
        kcal: totalDayKcal,
        workouts: dayWorkoutsApi, // Pass the full workouts array as defined in DayPlan
        meals: dayMealsApi,    // Pass the full meals array
        macros: totalDayMacros,
        accentFrom: dayAccents[dayShort]?.from || dayAccents["Mon"].from, // Expects accentFrom directly
        accentTo: dayAccents[dayShort]?.to || dayAccents["Mon"].to,       // Expects accentTo directly
      };
    });
  }, [apiPlanResult]);

  const fitnessGoals = [
    { label: "Lose Fat", value: "fat_loss" },
    { label: "Build Muscle", value: "build_muscle" },
    { label: "Maintain Weight", value: "maintain_weight" },
  ];

  const equipmentOptions = [
    { label: "Dumbbells", value: "dumbbells" },
    { label: "Resistance Bands", value: "resistance_bands" },
    { label: "Kettlebells", value: "kettlebells" },
    { label: "Bodyweight Only", value: "bodyweight" },
    { label: "Full Gym Access", value: "full_gym" },
  ];

  // Determine which slide is the "middle" one for enhanced hover effect
  const getMiddleSlideIndex = () => {
    if (!instanceRef.current || !instanceRef.current.options || !instanceRef.current.options.slides) {
      return -1;
    }
    const slidesOptions = instanceRef.current.options.slides; // Type: TrackSlidesConfigOption
    let perView = 1; // Default

    if (typeof slidesOptions === 'number') {
      perView = slidesOptions;
    } else if (typeof slidesOptions === 'object' && slidesOptions !== null) {
      if (typeof slidesOptions.perView === 'number') {
        perView = slidesOptions.perView;
      } else if (typeof slidesOptions.perView === 'function') {
        try {
          const pVal = slidesOptions.perView();
          if (typeof pVal === 'number') {
            perView = pVal;
          }
        } catch (e) {
          // console.warn("Could not evaluate slidesOptions.perView function", e);
        }
      } else if (slidesOptions.perView === 'auto') {
        // Handle 'auto' - defaulting to 1 for simplicity
      }
    }
    return currentSlide; // Sticking to enhancing the primary 'rel' slide.
  };
  const middleSlideIdx = getMiddleSlideIndex(); // isMiddle logic will be revisited

  const handleOpenDetail = (detailComponent: React.ReactNode, title: string) => {
    try {
      console.log('handleOpenDetail called with title:', title);
      setSelectedDetail(detailComponent);
      setModalTitle(title);
      onOpen();
    } catch (error) {
      console.error('Error opening detail modal:', error);
      addToast({ title: "Error", description: "Failed to open detail view.", color: "danger" });
    }
  };

  // Simple Sparkline component (can be moved to its own file)
  interface SparklineProps {
    data: number[];
    color?: string;
    width?: number;
    height?: number;
  }

  const Sparkline: React.FC<SparklineProps> = ({ data, color = "#fff", width = 100, height = 30 }) => {
    if (!data || data.length === 0) {
      return <div style={{ width, height, border: "1px dashed #555" }} />; // Placeholder for no data
    }

    const yMin = Math.min(...data);
    const yMax = Math.max(...data);
    const xStep = width / (data.length - 1 || 1);

    const points = data
      .map((d, i) => {
        const y = height - ((d - yMin) / (yMax - yMin || 1)) * height;
        return `${i * xStep},${y}`;
      })
      .join(" ");

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

  const renderDashboard = () => {
    if (!showDashboard && !apiPlanResult) return null; // Don't render dashboard if form not submitted and no plan loaded
    // Use mock data for now, later integrate with `apiPlanResult` state
    const data = mockDashboardData;

    return (
      <section id="dashboard" className="mt-12 p-4 md:p-6 bg-[#161A1E] rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-transparent bg-clip-text">
          Your FitForge Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {/* KPI Card: Calories Burned */}
          <Card isPressable onPress={() => handleOpenDetail(<CaloriesBurnedDetail todayBurned={data.caloriesBurned.current} targetBurned={data.caloriesBurned.goal} />, "Calories Burned Details")} className="bg-[#1F2328] hover:bg-[#2A2E33] transition-all cursor-pointer">
            <CardHeader className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-medium text-gray-400">Calories Burned</h3>
              <span className="text-xs text-purple-400">Today</span>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-2xl font-bold text-white">{data.caloriesBurned.current.toLocaleString()} <span className="text-sm text-gray-500">kcal</span></p>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-500">Goal: {data.caloriesBurned.goal.toLocaleString()}</span>
                <Sparkline data={data.caloriesBurned.trend} color="#D100F5" />
              </div>
            </CardBody>
          </Card>

          {/* KPI Card: Calories Consumed */}
          <Card isPressable onPress={() => handleOpenDetail(<CaloriesConsumedDetail todayConsumed={data.caloriesConsumed.current} targetConsumed={data.caloriesConsumed.goal} />, "Calories Consumed Details")} className="bg-[#1F2328] hover:bg-[#2A2E33] transition-all cursor-pointer">
            <CardHeader className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-medium text-gray-400">Calories Consumed</h3>
              <span className="text-xs text-green-400">Today</span>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-2xl font-bold text-white">{data.caloriesConsumed.current.toLocaleString()} <span className="text-sm text-gray-500">kcal</span></p>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-500">Goal: {data.caloriesConsumed.goal.toLocaleString()}</span>
                <Sparkline data={data.caloriesConsumed.trend} color="#22C55E" />
              </div>
            </CardBody>
          </Card>

          {/* KPI Card: Hydration */}
          <Card isPressable onPress={() => handleOpenDetail(<HydrationDetail todayIntake={data.hydration.current} targetIntake={data.hydration.goal} />, "Hydration Details")} className="bg-[#1F2328] hover:bg-[#2A2E33] transition-all cursor-pointer">
            <CardHeader className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-medium text-gray-400">Hydration</h3>
              <span className="text-xs text-blue-400">Today</span>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-2xl font-bold text-white">{data.hydration.current.toLocaleString()} <span className="text-sm text-gray-500">ml</span></p>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-500">Goal: {data.hydration.goal.toLocaleString()}</span>
                <Sparkline data={data.hydration.trend} color="#3B82F6" />
              </div>
            </CardBody>
          </Card>

          {/* KPI Card: Workouts This Week */}
          <Card isPressable onPress={() => handleOpenDetail(<WorkoutsDetail workoutsCompleted={data.workouts.current} workoutsTarget={data.workouts.goal} />, "Workouts This Week")} className="bg-[#1F2328] hover:bg-[#2A2E33] transition-all cursor-pointer">
            <CardHeader className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-medium text-gray-400">Workouts This Week</h3>
              <span className="text-xs text-teal-400">Progress</span>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-2xl font-bold text-white">{data.workouts.current} <span className="text-sm text-gray-500">of {data.workouts.goal}</span></p>
               <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-500">Keep it up!</span>
                 <Sparkline data={data.workouts.trend} color="#14B8A6" />
              </div>
            </CardBody>
          </Card>

          {/* KPI Card: Daily Steps */}
          <Card isPressable onPress={() => handleOpenDetail(<DailyStepsDetail todaySteps={data.steps.current} targetSteps={data.steps.goal} />, "Daily Steps Details")} className="bg-[#1F2328] hover:bg-[#2A2E33] transition-all cursor-pointer">
            <CardHeader className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-medium text-gray-400">Daily Steps</h3>
              <span className="text-xs text-pink-400">Today</span>
            </CardHeader>
            <CardBody className="pt-0">
              <p className="text-2xl font-bold text-white">{data.steps.current.toLocaleString()}</p>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-500">Goal: {data.steps.goal.toLocaleString()}</span>
                <Sparkline data={data.steps.trend} color="#EC4899" />
              </div>
            </CardBody>
          </Card>

          {/* KPI Card: Macronutrients */}
           <Card isPressable onPress={() => handleOpenDetail(<MacronutrientsDetail consumedKcal={data.caloriesConsumed.current} targetKcal={data.caloriesConsumed.goal} protein={data.macros.protein.current} proteinGoal={data.macros.protein.goal} carbs={data.macros.carbs.current} carbGoal={data.macros.carbs.goal} fat={data.macros.fat.current} fatGoal={data.macros.fat.goal} />, "Macronutrients Details")} className="bg-[#1F2328] hover:bg-[#2A2E33] transition-all cursor-pointer">
            <CardHeader className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-medium text-gray-400">Macronutrients</h3>
              <span className="text-xs text-purple-400">Today</span>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="text-xs space-y-0.5">
                <p className="text-white">P: <span className="font-semibold">{data.macros.protein.current}g</span> <span className="text-gray-500">/{data.macros.protein.goal}g</span></p>
                <p className="text-white">C: <span className="font-semibold">{data.macros.carbs.current}g</span> <span className="text-gray-500">/{data.macros.carbs.goal}g</span></p>
                <p className="text-white">F: <span className="font-semibold">{data.macros.fat.current}g</span> <span className="text-gray-500">/{data.macros.fat.goal}g</span></p>
              </div>
            </CardBody>
          </Card>

          {/* KPI Card: Weekly Activity Summary */}
          <Card isPressable onPress={() => handleOpenDetail(<WeeklyActivityDetail />, "Weekly Activity Summary")} className="bg-[#1F2328] hover:bg-[#2A2E33] transition-all cursor-pointer">
            <CardHeader className="pb-1">
              <h3 className="text-sm font-medium text-gray-400">Weekly Activity</h3>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="text-xs text-gray-300">View calories & steps trends, workout logs, and readiness.</div>
              {/* Could add mini sparklines here too if desired */}
            </CardBody>
          </Card>

          {/* Placeholder for more cards if needed */}
           <Card isPressable onPress={() => handleOpenDetail(<div className="p-4 text-center"><h3 className="text-xl font-bold mb-4">Coming Soon!</h3><p>This feature is currently under development and will be available in a future update.</p></div>, "Future Feature")} className="bg-[#1F2328] md:col-span-2 lg:col-span-1 xl:col-span-1 hover:bg-[#2A2E33] transition-all cursor-pointer">
            <CardHeader className="pb-1">
              <h3 className="text-sm font-medium text-gray-400">Future Feature</h3>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="h-16 flex items-center justify-center text-gray-600 italic">Coming soon...</div>
            </CardBody>
          </Card>

        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-[#101214] text-gray-100 flex flex-col items-center justify-start p-4 md:p-8 selection:bg-purple-500 selection:text-white">
      {/* Hero Section */}
      <section
        className="relative w-full min-h-screen flex items-center justify-center text-white overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at bottom, #160027 0%, #0E0E12 70%)' }} // Adjusted radial gradient
      >
        <div className="container mx-auto px-6 z-10 grid md:grid-cols-2 gap-8 items-center">
          {/* Left Column: Text and CTAs */}
          <div className="flex flex-col gap-6 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Forge your <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">fittest</span> week—instantly.
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              Smarter workouts. Sharper meals. Tailored by AI to your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center md:justify-start">
              <Button
                size="lg"
                className="bg-[#D100F5] text-white font-semibold shadow-lg shadow-[#D100F5]/30 hover:bg-opacity-90 transition-all duration-300 px-8 py-3 rounded-full"
              >
                Start Planning
              </Button>
            </div>
          </div>

          {/* Right Column: Dumbbell Image */}
          <div className="relative flex items-center justify-center mt-8 md:mt-0">
            <div className="absolute inset-0 flex items-center justify-center">
                 {/* Adjusted shadow for magenta glow */}
                <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full blur-3xl opacity-50" style={{backgroundColor: '#D100F5'}}></div>
            </div>
            <Image
              src="/asset-barbell.png"
              alt="Dumbbell"
              width={500}
              height={500}
              className="relative z-10 w-full max-w-md md:max-w-lg object-contain transform md:rotate-[-15deg]"
            />
          </div>
        </div>

        {/* Bottom Indicators */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-6 items-center z-10">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <GaugeIcon />
            <span>Gauge</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <GlassIcon />
            <span>Glass</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <ConfettiIcon />
            <span>Confetti</span>
          </div>
        </div>
      </section>

      {/* Existing Form Section - Adjusted for theme consistency */}
      <section className="flex flex-col items-center justify-center gap-8 py-12 md:py-16 px-4 bg-[#0E0E12] text-white">
        <div className="inline-block max-w-xl text-center justify-center">
          <h1 className={titlePrimitive({
            class: "text-white  hover:text-gray-200 transition-colors"
          })}>Shape Your Journey</h1>
          <h2 className={subtitlePrimitive({
            class: "mt-4 text-gray-300 hover:text-gray-400 transition-colors"
          })}>
            Tell us a bit about yourself to generate a personalized fitness and nutrition plan.
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-md mt-8">
          <Input
            isRequired
            type="number"
            label="Height (cm)"
            placeholder="Enter your height"
            value={height}
            onValueChange={setHeight}
            isDisabled={isLoading}
          />
          <Input
            isRequired
            type="number"
            label="Weight (kg)"
            placeholder="Enter your weight"
            value={weight}
            onValueChange={setWeight}
            isDisabled={isLoading}
          />
          <Select
            isRequired
            label="Primary Fitness Goal"
            placeholder="Select your goal"
            selectedKeys={goal ? [goal] : []}
            onSelectionChange={(keys: Selection) => {
              if (keys !== 'all') {
                const selectedKey = Array.from(keys)[0];
                setGoal(String(selectedKey));
              }
            }}
            isDisabled={isLoading}
          >
            {fitnessGoals.map((g) => (
              <SelectItem key={g.value} >
                {g.label}
              </SelectItem>
            ))}
          </Select>

          <CheckboxGroup
            label="Select available equipment"
            value={equipment}
            onValueChange={setEquipment}
            isDisabled={isLoading}
          >
            {equipmentOptions.map((item) => (
              <Checkbox key={item.value} value={item.value} isDisabled={isLoading}>{item.label}</Checkbox>
            ))}
          </CheckboxGroup>

          <Button
            size="lg"
            className="mt-4 bg-[#D100F5] text-white font-semibold shadow-lg shadow-[#D100F5]/30 hover:bg-opacity-90 transition-all duration-300 px-8 py-3 rounded-full"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm" color="current" /> : 'Generate My Plan'}
          </Button>
        </form>

        {renderDashboard()}

        {/* Display Results or Errors */}
        {apiPlanResult?.rawResponse && (
          <Card className="mt-4 w-full max-w-2xl bg-warning-50 border border-warning-200">
            <CardBody className="p-4 text-warning-700">
                <h4 className="font-semibold">Debug: Raw OpenAI Response (if parsing failed)</h4>
                <pre className="text-xs whitespace-pre-wrap break-all">{apiPlanResult.rawResponse}</pre>
            </CardBody>
          </Card>
        )}
      </section>

      {/* Plan Results Carousel Section - Now includes the header, conditionally rendered */}
      {transformedPlanForCarousel.length > 0 && (
        <>
          <section className="py-8 md:py-10 bg-[#0E0E12]">
            <div className="container mx-auto px-0 md:px-6">
              <h2 className={titlePrimitive({class: "text-center text-white"})}>
                This is your 7 day workout plan:
              </h2>
            </div>
          </section>

          <section className="pt-4 md:pt-6 pb-12 md:pb-16 bg-[#0E0E12] relative"
            aria-roledescription="carousel"
            aria-label="7-day fitness plan"
          >
            <div className="container mx-auto px-0 md:px-6">
              <div ref={sliderRef} className="keen-slider">
                {transformedPlanForCarousel.map((dayPlanItem, index) => (
                  <div className="keen-slider__slide px-2 flex justify-center" key={dayPlanItem.day}>
                    <DayCard plan={dayPlanItem} />
                  </div>
                ))}
              </div>
              {loaded && instanceRef.current && (
                <>
                  <Button
                    isIconOnly
                    aria-label="Previous day"
                    className="absolute left-0 md:left-[-20px] top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 hidden md:flex disabled:opacity-50"
                    onClick={(e: any) => { e.stopPropagation(); instanceRef.current?.prev(); }}
                    disabled={!instanceRef.current.options.loop && currentSlide === 0}
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </Button>
                  <Button
                    isIconOnly
                    aria-label="Next day"
                    className="absolute right-0 md:right-[-20px] top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 hidden md:flex disabled:opacity-50"
                    onClick={(e: any) => { e.stopPropagation(); instanceRef.current?.next(); }}
                    disabled={!instanceRef.current.options.loop && currentSlide === instanceRef.current.track.details.slides.length - 1}
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>
          </section>
        </>
      )}

      {/* NEW DASHBOARD SECTION */}
      <DashboardSection />

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        size="3xl"
        className="bg-[#1F2328] text-gray-100 z-50"
      >
        <ModalContent>
          {(onCloseModal) => (
            <>
              <ModalHeader className="text-lg font-semibold border-b border-gray-700">{modalTitle}</ModalHeader>
              <ModalBody className="py-4 px-2 md:px-4 max-h-[75vh] overflow-y-auto">
                {selectedDetail}
              </ModalBody>
              <ModalFooter className="border-t border-gray-700">
                <Button color="danger" variant="light" onPress={onCloseModal}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </main>
  );
}
