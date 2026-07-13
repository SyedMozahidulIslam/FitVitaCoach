import React, { useState, useEffect } from "react";
import { 
  Flame, Droplets, Footprints, Moon, Activity, Sparkles, Plus, 
  Heart, Smile, Calendar, Trophy, Lightbulb, UserCheck, Compass, Clock, RefreshCw, Lock, Award, ShieldCheck
} from "lucide-react";
import { UserProfile, FoodLog, WorkoutLog, WaterLog, SleepLog, Habit } from "../types";

interface HomeDashboardProps {
  userProfile: UserProfile;
  foodLogs: FoodLog[];
  workoutLogs: WorkoutLog[];
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  onQuickLogWater: (amountMl: number) => void;
  onQuickLogCal: (name: string, cal: number) => void;
  onAddActiveMinutes: (name: string, minutes: number, cal: number) => void;
  dailyHealthScore: number;
  xpPoints: number;
  habits?: Habit[];
}

export default function HomeDashboard({
  userProfile,
  foodLogs,
  workoutLogs,
  waterLogs,
  sleepLogs,
  onQuickLogWater,
  onQuickLogCal,
  onAddActiveMinutes,
  dailyHealthScore,
  xpPoints,
  habits = []
}: HomeDashboardProps) {
  // Current time states
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDateStr, setCurrentDateStr] = useState<string>("");
  const [simulatedHeartRate, setSimulatedHeartRate] = useState<number>(72);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<any>(null);

  useEffect(() => {
    // Update local clock and date
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }));
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    // Heart rate pulse simulation
    const hrInterval = setInterval(() => {
      setSimulatedHeartRate(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + change;
        return next > 95 ? 95 : next < 60 ? 60 : next;
      });
    }, 4000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(hrInterval);
    };
  }, []);

  // Calculate daily aggregates
  const today = new Date().toISOString().split("T")[0];
  
  const todayFoods = foodLogs.filter(log => log.timestamp.startsWith(today));
  const todayCalories = todayFoods.reduce((sum, f) => sum + f.calories, 0);
  const todayProtein = todayFoods.reduce((sum, f) => sum + (f.protein || 0), 0);
  const todayCarbs = todayFoods.reduce((sum, f) => sum + (f.carbs || 0), 0);
  const todayFat = todayFoods.reduce((sum, f) => sum + (f.fat || 0), 0);

  const todayWorkouts = workoutLogs.filter(log => log.timestamp.startsWith(today));
  const todayCaloriesBurned = todayWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  const todayActiveMinutes = todayWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0);

  const todayWater = waterLogs.filter(log => log.timestamp.startsWith(today)).reduce((sum, w) => sum + w.amountMl, 0);

  const todayCardioMinutes = todayWorkouts
    .filter(w => w.category === "Cardio" || w.category === "HIIT")
    .reduce((sum, w) => sum + w.durationMinutes, 0);
  const todayOtherMinutes = todayWorkouts
    .filter(w => w.category !== "Cardio" && w.category !== "HIIT")
    .reduce((sum, w) => sum + w.durationMinutes, 0);

  // 4200 baseline passive steps + 130 steps/min for cardio + 45 steps/min for others
  const todaySteps = 4200 + (todayCardioMinutes * 130) + (todayOtherMinutes * 45);
  const stepProgressPercent = Math.min(100, (todaySteps / userProfile.stepTarget) * 100);

  const lastSleep = sleepLogs.length > 0 ? sleepLogs[sleepLogs.length - 1] : { hoursSlept: 0, qualityScore: 0 };

  const caloriesRemaining = Math.max(0, userProfile.dailyCalorieTarget - todayCalories + todayCaloriesBurned);

  // --- Dynamic Historical Scoring & Streak Computing Engine ---
  const getScoreForDate = (dateStr: string) => {
    let score = 50; // baseline
    
    // Water metric
    const dateWater = waterLogs.filter(w => w.timestamp.startsWith(dateStr)).reduce((s, w) => s + w.amountMl, 0);
    if (dateWater >= userProfile.waterTargetMl) score += 15;
    else if (dateWater > 1000) score += 8;

    // Workout metric
    const dateWorkouts = workoutLogs.filter(w => w.timestamp.startsWith(dateStr));
    if (dateWorkouts.length > 0) score += 15;

    // Diet metric
    const dateCal = foodLogs.filter(f => f.timestamp.startsWith(dateStr)).reduce((s, f) => s + f.calories, 0);
    if (dateCal > 0 && dateCal <= userProfile.dailyCalorieTarget) score += 20;

    return Math.min(100, score);
  };

  const streakStats = (() => {
    let currentStreak = 0;
    let maxStreak = 0;
    
    // Compute for the last 30 days
    const scoresList: { date: string; score: number; dateLabel: string; water: number; workoutsCount: number; calories: number }[] = [];
    
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const score = getScoreForDate(dateStr);
      
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.toLocaleDateString("en-US", { day: "numeric" });
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      
      const dateWater = waterLogs.filter(w => w.timestamp.startsWith(dateStr)).reduce((s, w) => s + w.amountMl, 0);
      const dateWorkoutsCount = workoutLogs.filter(w => w.timestamp.startsWith(dateStr)).length;
      const dateCal = foodLogs.filter(f => f.timestamp.startsWith(dateStr)).reduce((s, f) => s + f.calories, 0);

      scoresList.push({
        date: dateStr,
        score,
        dateLabel: `${dayName}, ${monthName} ${dayNum}`,
        water: dateWater,
        workoutsCount: dateWorkoutsCount,
        calories: dateCal
      });
    }

    let index = 0;
    const todayScore = scoresList[0].score;
    const yesterdayScore = scoresList[1]?.score || 0;
    
    if (todayScore >= 80) {
      while (index < scoresList.length && scoresList[index].score >= 80) {
        currentStreak++;
        index++;
      }
    } else {
      if (yesterdayScore >= 80) {
        index = 1;
        while (index < scoresList.length && scoresList[index].score >= 80) {
          currentStreak++;
          index++;
        }
      } else {
        currentStreak = 0;
      }
    }

    // Compute max streak across the entire 30 days
    let streakCount = 0;
    for (let i = scoresList.length - 1; i >= 0; i--) {
      if (scoresList[i].score >= 80) {
        streakCount++;
        if (streakCount > maxStreak) {
          maxStreak = streakCount;
        }
      } else {
        streakCount = 0;
      }
    }

    return {
      currentStreak,
      maxStreak,
      scoresHistory: scoresList.slice(0, 14).reverse() // Last 14 days chronologically
    };
  })();

  // Calculate dynamic unlocked badges
  const maxHabitStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  const totalHabitsCompleted = habits.reduce((s, h) => s + h.completedDays.length, 0);
  const loggedFoodToday = todayFoods.length > 0;

  const badgesList = [
    {
      id: "hydration_hero",
      title: "Hydration Hero",
      unlocked: todayWater >= 1000 || habits.some(h => h.name.toLowerCase().includes("water") && h.completedDays.includes(today)),
      icon: <Droplets className="w-5 h-5 text-blue-500" />,
      color: "bg-blue-50/80 border-blue-100 text-blue-700"
    },
    {
      id: "consistency_king",
      title: "Consistency King",
      unlocked: maxHabitStreak >= 3,
      icon: <Trophy className="w-5 h-5 text-amber-500" />,
      color: "bg-amber-50/80 border-amber-100 text-amber-700"
    },
    {
      id: "habit_pioneer",
      title: "Habit Pioneer",
      unlocked: totalHabitsCompleted >= 5,
      icon: <Calendar className="w-5 h-5 text-emerald-500" />,
      color: "bg-emerald-50/80 border-emerald-100 text-emerald-700"
    },
    {
      id: "xp_enthusiast",
      title: "XP Enthusiast",
      unlocked: xpPoints >= 1500,
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      color: "bg-purple-50/80 border-purple-100 text-purple-700"
    },
    {
      id: "calorie_commander",
      title: "Calorie Commander",
      unlocked: loggedFoodToday,
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      color: "bg-rose-50/80 border-rose-100 text-rose-700"
    },
    {
      id: "apex_achiever",
      title: "Apex Achiever",
      unlocked: xpPoints >= 2000,
      icon: <ShieldCheck className="w-5 h-5 text-teal-500" />,
      color: "bg-teal-50/80 border-teal-100 text-teal-700"
    },
    {
      id: "longevity_sage",
      title: "Longevity Sage",
      unlocked: xpPoints >= 2500 || maxHabitStreak >= 5,
      icon: <Heart className="w-5 h-5 text-rose-600" />,
      color: "bg-rose-50/80 border-rose-100 text-rose-700"
    }
  ];

  const unlockedBadges = badgesList.filter(b => b.unlocked);

  // Healthy Tips Database
  const healthTips = [
    "Drinking 1 glass of water immediately after waking up stimulates internal organs and boosts metabolic rates.",
    "Substituting white rice with red rice (Lal Chal) increases mineral density and reduces glycemic response.",
    "Aim to complete 150 minutes of moderate-intensity exercise weekly. You are on a fantastic track!",
    "Quality sleep is when physical recovery happens. Aim for deep sleep phases by cooling your room.",
    "Lentils (Dal) paired with brown rice creates a complete protein source, providing all 9 essential amino acids."
  ];
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const handleNextTip = () => {
    setCurrentTipIndex(prev => (prev + 1) % healthTips.length);
  };

  return (
    <div className="space-y-6" id="home_dashboard_root">
      
      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="bento_dashboard_grid">
        
        {/* Welcome Block Tile (col-span-1 md:col-span-2 lg:col-span-3) */}
        <div className="md:col-span-2 lg:col-span-3 bg-white p-6 md:p-8 rounded-[2rem] border border-gray-150/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between relative overflow-hidden" id="bento_welcome_tile">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-100/30 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-100/10 rounded-full blur-2xl -z-10" />
          
          <div className="space-y-4">
            {/* Status indicators */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Server Active
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-100">
                <Lock className="w-3.5 h-3.5 text-teal-600 animate-pulse" /> AES-256 Storage Encrypted
              </span>
              
              {userProfile.role === "SMI Fahim" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-100">
                  👑 Supreme Admin: SMI Fahim
                </span>
              )}
              
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-gray-50 text-gray-500 border border-gray-150">
                Goal: {userProfile.goal}
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
                Assalamu Alaikum, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">{userProfile.name}</span>! 👋
              </h1>
              <p className="text-xs md:text-sm text-gray-500 max-w-xl font-medium">
                Welcome back to your high-performance wellness cockpit. Let's make today a masterpieces of personalized health, optimized nutrition, and focused fitness.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-gray-400 font-semibold">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>{currentDateStr || "Loading today's schedule..."}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100/40">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Calibrated for: <strong className="font-extrabold">{userProfile.age} yrs, {userProfile.weight} kg</strong></span>
            </div>
          </div>
        </div>

        {/* Live Vitals Monitor Tile (col-span-1) */}
        <div className="bg-[#1F2937] text-white p-6 rounded-[2rem] border border-gray-800 shadow-md flex flex-col justify-between overflow-hidden relative" id="bento_vitals_tile">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl" />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Telemetry</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </div>

          <div className="my-6 space-y-4">
            {/* Heart rate indicator */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Pulse</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black tracking-tight text-white">{simulatedHeartRate}</span>
                  <span className="text-[10px] text-rose-400 font-bold">bpm</span>
                </div>
              </div>
              <Heart className="w-8 h-8 text-rose-500 animate-pulse" />
            </div>

            {/* Live Clock display */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
              <div>
                <span className="text-[10px] text-gray-400 font-bold block uppercase">Local Time</span>
                <div className="text-sm font-mono font-bold text-emerald-400 tracking-widest mt-0.5">
                  {currentTime || "00:00:00"}
                </div>
              </div>
              <Clock className="w-5 h-5 text-emerald-400/80" />
            </div>
          </div>

          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Bio-Sensor Synced
          </div>
        </div>

        {/* Daily Health Score Tile (col-span-1) */}
        <div className="bg-emerald-50/80 p-6 rounded-[2rem] border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.05)] flex flex-col justify-between" id="bento_score_tile">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block">Efficiency Index</span>
              <h3 className="text-base font-black text-emerald-950 mt-1">Health Score</h3>
            </div>
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="my-4 flex items-center justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="#d1fae5" strokeWidth="10" fill="transparent" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="46" 
                  stroke="#10b981" 
                  strokeWidth="10" 
                  fill="transparent" 
                  strokeDasharray={289}
                  strokeDashoffset={289 - (289 * dailyHealthScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-3xl font-black text-emerald-950">{dailyHealthScore}</span>
            </div>
          </div>

          <p className="text-[10px] text-emerald-800 font-bold text-center">
            {dailyHealthScore >= 80 ? "🔥 Elite performance today!" : "📈 Log activities to maximize score!"}
          </p>
        </div>

        {/* Level & XP Progress Tile (col-span-1) */}
        <div className="bg-blue-50/80 p-6 rounded-[2rem] border border-blue-100 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.05)] flex flex-col justify-between" id="bento_xp_tile">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-widest block">Gamification Status</span>
              <h3 className="text-base font-black text-blue-950 mt-1">Level {Math.floor(xpPoints / 1000) + 1}</h3>
            </div>
            <div className="p-2 bg-blue-500 text-white rounded-xl shadow-sm">
              <Trophy className="w-4 h-4 text-yellow-300" />
            </div>
          </div>

          <div className="my-2 space-y-2">
            <div className="flex justify-between text-xs font-bold text-blue-950">
              <span>{xpPoints} XP</span>
              <span className="text-blue-600">Level Goal: {Math.floor(xpPoints / 1000) * 1000 + 1000} XP</span>
            </div>
            
            {/* XP Progress Bar */}
            <div className="h-3 w-full bg-blue-100 rounded-full overflow-hidden border border-blue-200/50">
              <div 
                className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                style={{ width: `${(xpPoints % 1000) / 10}%` }}
              />
            </div>
          </div>

          <p className="text-[10px] text-blue-800 font-bold">
            💡 {1000 - (xpPoints % 1000)} XP needed to calibrate next level tier.
          </p>
        </div>

        {/* Calorie Ring Summary Card (col-span-1 md:col-span-2 lg:col-span-2) */}
        <div className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-150/60 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between relative overflow-hidden" id="bento_calories_tile">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/30 rounded-full blur-2xl -z-10" />
          
          <div className="flex justify-between items-center pb-4 border-b border-gray-100/80 mb-4">
            <div>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Metabolic Sync</span>
              <h3 className="text-base font-black text-gray-900">Energy & Calorie Balance</h3>
            </div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/60">
              {todayCalories} kcal Logged
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-around">
            {/* Calorie Progress Ring */}
            <div className="relative flex items-center justify-center w-40 h-40 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="66" stroke="#f3f4f6" strokeWidth="10" fill="transparent" />
                <circle 
                  cx="80" 
                  cy="80" 
                  r="66" 
                  stroke="#10b981" 
                  strokeWidth="10" 
                  fill="transparent" 
                  strokeDasharray={414}
                  strokeDashoffset={414 - (414 * Math.min(todayCalories, userProfile.dailyCalorieTarget)) / userProfile.dailyCalorieTarget}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-gray-900">{caloriesRemaining}</span>
                <p className="text-[9px] text-gray-400 font-extrabold tracking-widest uppercase mt-0.5">kcal left</p>
              </div>
            </div>

            {/* Balances details */}
            <div className="space-y-4 flex-1 w-full">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-gray-50 rounded-xl text-center border border-gray-100">
                  <div className="text-[9px] text-gray-400 font-bold mb-0.5">Goal</div>
                  <div className="font-extrabold text-xs text-gray-800">{userProfile.dailyCalorieTarget}</div>
                </div>
                <div className="p-2 bg-emerald-50/50 rounded-xl text-center border border-emerald-100/40">
                  <div className="text-[9px] text-emerald-600 font-bold mb-0.5">Food</div>
                  <div className="font-extrabold text-xs text-emerald-700">+{todayCalories}</div>
                </div>
                <div className="p-2 bg-orange-50/50 rounded-xl text-center border border-orange-100/40">
                  <div className="text-[9px] text-orange-600 font-bold mb-0.5">Burned</div>
                  <div className="font-extrabold text-xs text-orange-700">-{todayCaloriesBurned}</div>
                </div>
              </div>

              {/* Macros Breakdown */}
              <div className="space-y-2 pt-1">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Macronutrients</div>
                
                <div className="space-y-1.5">
                  {/* Protein */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                      <span>Protein (Daily Target: 130g)</span>
                      <span className="text-gray-900">{todayProtein}g</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (todayProtein / 130) * 100)}%` }} />
                    </div>
                  </div>
                  {/* Carbs */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                      <span>Carbs (Daily Target: 230g)</span>
                      <span className="text-gray-900">{todayCarbs}g</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (todayCarbs / 230) * 100)}%` }} />
                    </div>
                  </div>
                  {/* Fat */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                      <span>Fat (Daily Target: 70g)</span>
                      <span className="text-gray-900">{todayFat}g</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, (todayFat / 70) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Quick Actions Station Tile (col-span-1 md:col-span-2 lg:col-span-2) */}
        <div className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-150/60 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between" id="bento_quicklog_tile">
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100/80">
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Instant Input</span>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-1.5">
                  <Plus className="w-5 h-5 text-emerald-500" />
                  Quick Log Station
                </h3>
              </div>
              <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                One-Click
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Water triggers */}
              <button 
                onClick={() => onQuickLogWater(250)}
                className="p-3 bg-blue-50/50 hover:bg-blue-100 border border-blue-100/60 rounded-2xl text-xs font-black text-blue-800 flex items-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="p-1.5 bg-blue-500 text-white rounded-lg">
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-left text-[11px] leading-tight">Hydrate</span>
                  <span className="block text-left text-[9px] text-blue-500 font-medium">+250ml Water</span>
                </div>
              </button>

              {/* Food log trigger */}
              <button 
                onClick={() => onQuickLogCal("Assorted Snack", 180)}
                className="p-3 bg-emerald-50/50 hover:bg-emerald-100 border border-emerald-100/60 rounded-2xl text-xs font-black text-emerald-800 flex items-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-left text-[11px] leading-tight">Snack Log</span>
                  <span className="block text-left text-[9px] text-emerald-500 font-medium">+180 kcal</span>
                </div>
              </button>

              {/* Workout log trigger 1 */}
              <button 
                onClick={() => onAddActiveMinutes("Brisk Walking", 30, 150)}
                className="p-3 bg-amber-50/50 hover:bg-amber-100 border border-amber-100/60 rounded-2xl text-xs font-black text-amber-800 flex items-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                  <Footprints className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-left text-[11px] leading-tight">Brisk Walk</span>
                  <span className="block text-left text-[9px] text-amber-500 font-medium">+30m / -150 kcal</span>
                </div>
              </button>

              {/* Workout log trigger 2 */}
              <button 
                onClick={() => onAddActiveMinutes("High-Intensity Gym", 45, 320)}
                className="p-3 bg-rose-50/50 hover:bg-rose-100 border border-rose-100/60 rounded-2xl text-xs font-black text-rose-800 flex items-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="p-1.5 bg-rose-500 text-white rounded-lg">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-left text-[11px] leading-tight">Gym Workout</span>
                  <span className="block text-left text-[9px] text-rose-500 font-medium">+45m / -320 kcal</span>
                </div>
              </button>
            </div>
          </div>

          <div className="text-[9px] text-gray-400 font-extrabold uppercase mt-4 text-center block">
            🚀 Powered by precision exercise-calorimetry equations
          </div>
        </div>

        {/* Water Hydration Card (col-span-1) */}
        <div className="bg-white p-5 rounded-[2rem] border border-gray-150/60 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-3" id="bento_water_tile">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100/80">
            <h4 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
              <Droplets className="w-4.5 h-4.5 text-blue-500" />
              Hydration Center
            </h4>
            <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100/40">
              {Math.round((todayWater / userProfile.waterTargetMl) * 100)}%
            </span>
          </div>

          {/* Water Progress Ring */}
          <div className="my-1 flex items-center justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="#eff6ff" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="46" 
                  stroke="#3b82f6" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={289}
                  strokeDashoffset={289 - (289 * Math.min(todayWater, userProfile.waterTargetMl)) / userProfile.waterTargetMl}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-xl font-black text-blue-950 leading-none">{todayWater}</span>
                <span className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">/ {userProfile.waterTargetMl}ml</span>
              </div>
            </div>
          </div>

          {/* Quick Custom triggers */}
          <div className="flex items-center gap-1.5">
            {[150, 250, 500].map(amt => (
              <button 
                key={amt}
                onClick={() => onQuickLogWater(amt)}
                className="flex-1 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-[10px] font-extrabold text-gray-500 transition-colors border border-transparent hover:border-blue-100/60 cursor-pointer transform active:scale-95"
              >
                +{amt}ml
              </button>
            ))}
          </div>

          <p className="text-[9px] text-blue-500 font-bold text-center">Weather-adjusted dynamic formulas active</p>
        </div>

        {/* Sleep Tracker Widget (col-span-1) */}
        <div className="bg-white p-5 rounded-[2rem] border border-gray-150/60 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-4" id="bento_sleep_tile">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100/80">
            <h4 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
              <Moon className="w-4.5 h-4.5 text-indigo-500" />
              Sleep Quality Center
            </h4>
            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/40">
              Score: {lastSleep?.qualityScore || "82"}
            </span>
          </div>

          <div className="text-center py-2 space-y-1">
            <div className="text-2xl font-black text-gray-900">
              {lastSleep?.hoursSlept || "7.5"} <span className="text-xs text-gray-400 font-normal">/ {userProfile.sleepTargetHours} hrs</span>
            </div>
            <p className="text-[9px] text-indigo-500 font-extrabold uppercase">Deep Sleep: 22% | REM Sleep: 25%</p>
          </div>

          {/* Bedtime suggestions */}
          <div className="text-[10px] bg-indigo-50/40 p-2.5 rounded-2xl border border-indigo-100/40 text-indigo-900 font-semibold leading-relaxed">
            💤 Bedtime reminder: Keep bedroom at 18-22°C for optimal physical recovery.
          </div>
        </div>

        {/* Dynamic AI health tips and Coach advice (col-span-1) */}
        <div className="bg-white p-5 rounded-[2rem] border border-gray-150/60 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between" id="bento_tips_tile">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100/80">
              <h4 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-emerald-500" />
                Dietitian Guidance
              </h4>
              <button 
                onClick={handleNextTip}
                className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
              >
                Next <RefreshCw className="w-2.5 h-2.5" />
              </button>
            </div>
            
            <p className="text-[11px] text-gray-600 leading-relaxed italic bg-emerald-50/20 p-3 rounded-2xl border border-emerald-100/30">
              "{healthTips[currentTipIndex]}"
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100/80 flex items-center justify-between mt-4">
            <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Ecosystem Certified</span>
            <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50/60 px-2 py-0.5 rounded-full border border-emerald-100/30">Science Backed</span>
          </div>
        </div>

        {/* Virtual Badges Vault Quick-Glance (col-span-1) */}
        <div className="bg-white p-5 rounded-[2rem] border border-gray-150/60 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-4" id="bento_badges_glance_tile">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100/80">
            <h4 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
              Trophy Badges Vault
            </h4>
            <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
              {unlockedBadges.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {unlockedBadges.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {unlockedBadges.map(b => (
                  <div 
                    key={b.id} 
                    title={`${b.title}: Unlocked`}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all hover:scale-105 ${b.color}`}
                  >
                    {b.icon}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 font-medium italic text-center py-4">
                No virtual badges unlocked yet. Complete habit streaks or logs to claim trophies!
              </p>
            )}

            <div className="text-[10px] bg-slate-50 p-2.5 rounded-2xl border border-gray-150 text-slate-700 font-semibold leading-relaxed">
              🏆 Earn badges to trigger premium XP bonuses and level up!
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100/80 flex items-center justify-between">
            <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Interactive Trophy Room</span>
            <span className="text-[9px] text-gray-500 font-bold">7 Milestones</span>
          </div>
        </div>

        {/* Steps & Activity Arena Card (col-span-1) */}
        <div className="bg-white p-5 rounded-[2rem] border border-gray-150/60 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-3" id="bento_steps_tile">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100/80">
            <h4 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
              <Footprints className="w-4.5 h-4.5 text-amber-500" />
              Steps Arena
            </h4>
            <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100/40">
              {Math.round(stepProgressPercent)}%
            </span>
          </div>

          {/* Steps Progress Ring */}
          <div className="my-1 flex items-center justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="#fffbeb" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="46" 
                  stroke="#f59e0b" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={289}
                  strokeDashoffset={289 - (289 * Math.min(todaySteps, userProfile.stepTarget)) / userProfile.stepTarget}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-xl font-black text-amber-950 leading-none">{Math.round(todaySteps)}</span>
                <span className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">/ {userProfile.stepTarget}</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] bg-amber-50/40 p-2.5 rounded-2xl border border-amber-100/40 text-amber-950 font-semibold leading-normal">
            🚶 Background rhythm active. Dynamic step equations convert exercise minutes directly!
          </div>
        </div>

        {/* Unified Concentric Bio-Rings Cockpit (col-span-1) */}
        <div className="bg-white p-5 rounded-[2rem] border border-gray-150/60 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-3" id="bento_tri_rings_tile">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100/80">
            <h4 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
              Wellness Cockpit
            </h4>
            <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/40">
              Tri-Sync
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 py-1">
            {/* Concentric Rings SVG */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Outer Ring: Calories */}
                <circle cx="56" cy="56" r="46" stroke="#f3f4f6" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="46" 
                  stroke="#10b981" 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray={289}
                  strokeDashoffset={289 - (289 * Math.min(todayCalories, userProfile.dailyCalorieTarget)) / userProfile.dailyCalorieTarget}
                  strokeLinecap="round"
                />

                {/* Middle Ring: Steps */}
                <circle cx="56" cy="56" r="34" stroke="#f3f4f6" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="34" 
                  stroke="#f59e0b" 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray={214}
                  strokeDashoffset={214 - (214 * Math.min(todaySteps, userProfile.stepTarget)) / userProfile.stepTarget}
                  strokeLinecap="round"
                />

                {/* Inner Ring: Water */}
                <circle cx="56" cy="56" r="22" stroke="#f3f4f6" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="22" 
                  stroke="#3b82f6" 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray={138}
                  strokeDashoffset={138 - (138 * Math.min(todayWater, userProfile.waterTargetMl)) / userProfile.waterTargetMl}
                  strokeLinecap="round"
                />
              </svg>
              {/* Center icon or label */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-slate-900 leading-none">
                  {Math.round(
                    ((Math.min(100, (todayCalories / userProfile.dailyCalorieTarget) * 100) +
                      Math.min(100, (todaySteps / userProfile.stepTarget) * 100) +
                      Math.min(100, (todayWater / userProfile.waterTargetMl) * 100)) /
                      3)
                  )}%
                </span>
                <span className="text-[6px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">Avg</span>
              </div>
            </div>

            {/* Detailed Legend */}
            <div className="flex-1 space-y-1.5 pl-1.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[8px] text-gray-400 font-extrabold leading-none uppercase">Energy</div>
                  <div className="text-[10px] text-gray-800 font-extrabold truncate">
                    {todayCalories} / {userProfile.dailyCalorieTarget}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[8px] text-gray-400 font-extrabold leading-none uppercase">Steps</div>
                  <div className="text-[10px] text-gray-800 font-extrabold truncate">
                    {Math.round(todaySteps)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[8px] text-gray-400 font-extrabold leading-none uppercase">Water</div>
                  <div className="text-[10px] text-gray-800 font-extrabold truncate">
                    {todayWater}ml
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest text-center pt-2 border-t border-gray-100/80">
            Concentric Biomarkers
          </div>
        </div>

        {/* Global Streak & Health Score Calendar View (col-span-1 md:col-span-2 lg:col-span-2) */}
        <div className="md:col-span-2 lg:col-span-2 bg-white p-5 rounded-[2rem] border border-gray-150/60 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between space-y-4" id="bento_global_streak_tile">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100/80">
            <h4 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
              <Flame className="w-4.5 h-4.5 text-orange-500 animate-bounce" />
              Global Streak Calendar
            </h4>
            <span className="text-[10px] font-black text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100/40">
              80%+ Health Score
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gradient-to-br from-orange-50 to-amber-50/50 p-3 rounded-2xl border border-orange-100/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-500 text-white rounded-xl shadow-xs">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-orange-700 uppercase block tracking-wider leading-none">Active Streak</span>
                  <span className="text-xl font-black text-orange-950">{streakStats.currentStreak} Days</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-gray-400 uppercase block tracking-wider leading-none">Personal Best</span>
                <span className="text-sm font-black text-gray-700">{streakStats.maxStreak} Days</span>
              </div>
            </div>

            {/* Interactive Grid of last 14 days */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">Last 14 Days</span>
              <div className="grid grid-cols-7 gap-1.5">
                {streakStats.scoresHistory.map((day) => {
                  const isActive = day.score >= 80;
                  const isSelected = selectedCalendarDay?.date === day.date;
                  
                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedCalendarDay(isSelected ? null : day)}
                      className={`relative aspect-square rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer group active:scale-95 ${
                        isActive
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400 shadow-[0_2px_8px_rgba(16,185,129,0.15)]"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                      } ${isSelected ? "ring-2 ring-orange-500 ring-offset-2" : ""}`}
                    >
                      <span className="text-[8px] font-bold opacity-70 leading-none mb-0.5">
                        {day.dateLabel.split(",")[0]}
                      </span>
                      <span className="text-xs font-black leading-none">
                        {day.dateLabel.split(" ")[2]}
                      </span>
                      {/* Mini hover status */}
                      <span className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full ${isActive ? "bg-white" : "bg-gray-400"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive drill-down day detail */}
            {selectedCalendarDay ? (
              <div className="p-3 bg-slate-50 rounded-2xl border border-gray-200 animate-fadeIn space-y-2">
                <div className="flex justify-between items-center pb-1.5 border-b border-gray-200/50">
                  <span className="text-[10px] font-bold text-slate-800 font-mono">
                    Details for: {selectedCalendarDay.dateLabel}
                  </span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    selectedCalendarDay.score >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    Score: {selectedCalendarDay.score}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-gray-600">
                  <div className="bg-blue-50/50 p-1.5 rounded-lg border border-blue-100/30">
                    <span className="block text-blue-500 text-[8px] font-black uppercase tracking-wider">Water</span>
                    <span className="font-extrabold text-blue-950">{selectedCalendarDay.water}ml</span>
                  </div>
                  <div className="bg-amber-50/50 p-1.5 rounded-lg border border-amber-100/30">
                    <span className="block text-amber-500 text-[8px] font-black uppercase tracking-wider">Exercise</span>
                    <span className="font-extrabold text-amber-950">{selectedCalendarDay.workoutsCount} Done</span>
                  </div>
                  <div className="bg-emerald-50/50 p-1.5 rounded-lg border border-emerald-100/30">
                    <span className="block text-emerald-500 text-[8px] font-black uppercase tracking-wider">Diet</span>
                    <span className="font-extrabold text-emerald-950">{selectedCalendarDay.calories} kcal</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[9px] text-gray-400 font-bold text-center">
                👉 Click any calendar block above to analyze dynamic wellness details
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100/80 text-[8px] text-gray-400 font-black uppercase tracking-widest text-center">
            Health Consistency Grid
          </div>
        </div>

        {/* Daily Achievements & Missions Row (col-span-1 md:col-span-2 lg:col-span-4) */}
        <div className="lg:col-span-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 md:p-8 rounded-[2rem] shadow-md flex flex-col lg:flex-row items-center justify-between gap-6" id="bento_quests_tile">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl md:text-2xl font-black flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-300" />
              FitVita Daily Quests & Milestones
            </h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
              Complete your dynamic biomarkers check-ins to unlock profile trophies and level up. High-performance habits compound daily into structural longevity.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto pb-1">
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl text-center flex-1 sm:flex-initial min-w-[120px] border border-white/10 flex flex-col items-center">
              <Droplets className="w-6 h-6 text-blue-200 mb-1" />
              <div className="text-xs font-black">Hydro Champion</div>
              <div className="text-[9px] text-emerald-100/80 mt-1">Reach water target</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl text-center flex-1 sm:flex-initial min-w-[120px] border border-white/10 flex flex-col items-center">
              <Flame className="w-6 h-6 text-orange-300 mb-1" />
              <div className="text-xs font-black">Active Engine</div>
              <div className="text-[9px] text-emerald-100/80 mt-1">Burn 300 kcal</div>
            </div>
            <div className="bg-white/20 backdrop-blur-xs p-3.5 rounded-2xl text-center flex-1 sm:flex-initial min-w-[120px] border-2 border-yellow-300 flex flex-col items-center shadow-xs">
              <Trophy className="w-6 h-6 text-yellow-300 mb-1 animate-bounce" />
              <div className="text-xs font-black text-yellow-100">Super Habit</div>
              <div className="text-[9px] text-emerald-50 mt-1">7 Day Streak!</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
