import React, { useState, useEffect } from "react";
import { 
  Flame, Droplets, Moon, Activity, Dumbbell, Sparkles, Scale, 
  Smile, ClipboardList, BookOpen, Star, User, Settings, ShieldAlert,
  ChevronRight, Heart, Menu, X, Plus, Info
} from "lucide-react";

import { UserProfile, FoodLog, WorkoutLog, WaterLog, SleepLog, MoodLog, Habit, Medication } from "./types";
import { secureStorage } from "./utils/security";

// Import custom modules
import HomeDashboard from "./components/HomeDashboard";
import SmartCalorieTracker from "./components/SmartCalorieTracker";
import AIMealPlanner from "./components/AIMealPlanner";
import FitnessModule from "./components/FitnessModule";
import BodyTracker from "./components/BodyTracker";
import MentalWellness from "./components/MentalWellness";
import HabitCoach from "./components/HabitCoach";
import MedicationCenter from "./components/MedicationCenter";
import MoreModules from "./components/MoreModules";
import AICoachChat from "./components/AICoachChat";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // --- Core Persistent State ---
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = secureStorage.getItem("fit_profile");
    if (saved) return JSON.parse(saved);
    return {
      name: "SMI Fahim",
      role: "SMI Fahim",
      age: 26,
      gender: "Male",
      weight: 75,
      height: 178,
      goal: "Weight Loss",
      dietType: "Standard",
      allergies: ["Peanuts"],
      conditions: ["Diabetes Care"],
      dailyCalorieTarget: 1950,
      waterTargetMl: 2500,
      sleepTargetHours: 8,
      stepTarget: 10000
    };
  });

  const [foodLogs, setFoodLogs] = useState<FoodLog[]>(() => {
    const saved = secureStorage.getItem("fit_food_logs");
    if (saved) return JSON.parse(saved);
    const today = new Date().toISOString().split("T")[0];
    return [
      { id: "1", timestamp: `${today}T08:30:00Z`, mealType: "Breakfast", foodName: "Whole-wheat Handmade Roti with Mixed Dal", calories: 320, protein: 14, carbs: 52, fat: 5, servingSize: "2 Rotis" },
      { id: "2", timestamp: `${today}T13:15:00Z`, mealType: "Lunch", foodName: "Steamed Lal Chal Rice with Baked Hilsha Fish", calories: 480, protein: 32, carbs: 45, fat: 12, servingSize: "1 plate" }
    ];
  });

  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(() => {
    const saved = secureStorage.getItem("fit_workout_logs");
    if (saved) return JSON.parse(saved);
    const today = new Date().toISOString().split("T")[0];
    return [
      { id: "1", timestamp: `${today}T18:00:00Z`, exerciseName: "Brisk Walking with form correction", category: "Cardio", durationMinutes: 30, caloriesBurned: 150, notes: "Felt strong, high cadence" }
    ];
  });

  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    const saved = secureStorage.getItem("fit_water_logs");
    if (saved) return JSON.parse(saved);
    const today = new Date().toISOString().split("T")[0];
    return [
      { id: "1", timestamp: `${today}T09:00:00Z`, amountMl: 500 },
      { id: "2", timestamp: `${today}T11:30:00Z`, amountMl: 250 },
      { id: "3", timestamp: `${today}T14:45:00Z`, amountMl: 500 }
    ];
  });

  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => {
    const saved = secureStorage.getItem("fit_sleep_logs");
    if (saved) return JSON.parse(saved);
    return [
      { id: "1", date: "2026-07-12", hoursSlept: 7.5, qualityScore: 84 }
    ];
  });

  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(() => {
    const saved = secureStorage.getItem("fit_mood_logs");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = secureStorage.getItem("fit_habits");
    if (saved) return JSON.parse(saved);
    return [
      { id: "1", name: "Drink 1 glass of water after waking up", category: "Morning", completedDays: [], streak: 3, frequency: "Daily" },
      { id: "2", name: "No blue-light screens 60m before bed", category: "Night", completedDays: [], streak: 5, frequency: "Daily" },
      { id: "3", name: "Complete dynamic physical warm-up", category: "Lifestyle", completedDays: [], streak: 2, frequency: "Daily" }
    ];
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = secureStorage.getItem("fit_meds");
    if (saved) return JSON.parse(saved);
    return [
      { id: "1", name: "Metformin 500mg", dosage: "1 tablet", time: "08:30 AM", refillCount: 4, instructions: "Take immediately with/after breakfast", loggedDays: [] }
    ];
  });

  const [xpPoints, setXpPoints] = useState<number>(() => {
    const saved = secureStorage.getItem("fit_xp");
    return saved ? Number(saved) : 1250; // starts at level 2
  });

  // --- Sync storage ---
  useEffect(() => {
    secureStorage.setItem("fit_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    secureStorage.setItem("fit_food_logs", JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    secureStorage.setItem("fit_workout_logs", JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  useEffect(() => {
    secureStorage.setItem("fit_water_logs", JSON.stringify(waterLogs));
  }, [waterLogs]);

  useEffect(() => {
    secureStorage.setItem("fit_sleep_logs", JSON.stringify(sleepLogs));
  }, [sleepLogs]);

  useEffect(() => {
    secureStorage.setItem("fit_mood_logs", JSON.stringify(moodLogs));
  }, [moodLogs]);

  useEffect(() => {
    secureStorage.setItem("fit_habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    secureStorage.setItem("fit_meds", JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    secureStorage.setItem("fit_xp", xpPoints.toString());
  }, [xpPoints]);

  // --- Handlers ---
  const handleAddFoodLog = (log: Omit<FoodLog, "id" | "timestamp">) => {
    const newLog: FoodLog = {
      ...log,
      id: Math.random().toString(),
      timestamp: new Date().toISOString()
    };
    setFoodLogs(prev => [newLog, ...prev]);
  };

  const handleDeleteFoodLog = (id: string) => {
    setFoodLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleAddWorkoutLog = (log: Omit<WorkoutLog, "id" | "timestamp">) => {
    const newLog: WorkoutLog = {
      ...log,
      id: Math.random().toString(),
      timestamp: new Date().toISOString()
    };
    setWorkoutLogs(prev => [newLog, ...prev]);
  };

  const handleAddWaterLog = (amountMl: number) => {
    const newLog: WaterLog = {
      id: Math.random().toString(),
      timestamp: new Date().toISOString(),
      amountMl
    };
    setWaterLogs(prev => [newLog, ...prev]);
    setXpPoints(p => p + 50); // reward water log
  };

  const handleAddMoodLog = (log: Omit<MoodLog, "id" | "timestamp">) => {
    const newLog: MoodLog = {
      ...log,
      id: Math.random().toString(),
      timestamp: new Date().toISOString()
    };
    setMoodLogs(prev => [newLog, ...prev]);
  };

  const handleAddHabit = (habit: Omit<Habit, "id" | "completedDays" | "streak">) => {
    const newHabit: Habit = {
      ...habit,
      id: Math.random().toString(),
      completedDays: [],
      streak: 0
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const handleToggleHabit = (id: string, dateStr: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const completed = habit.completedDays.includes(dateStr);
        const nextCompleted = completed 
          ? habit.completedDays.filter(d => d !== dateStr)
          : [...habit.completedDays, dateStr];
        
        return {
          ...habit,
          completedDays: nextCompleted,
          streak: completed ? Math.max(0, habit.streak - 1) : habit.streak + 1
        };
      }
      return habit;
    }));
  };

  const handleAddMedication = (med: Omit<Medication, "id" | "loggedDays">) => {
    const newMed: Medication = {
      ...med,
      id: Math.random().toString(),
      loggedDays: []
    };
    setMedications(prev => [...prev, newMed]);
  };

  const handleToggleMedication = (id: string, dateStr: string) => {
    setMedications(prev => prev.map(med => {
      if (med.id === id) {
        const taken = med.loggedDays.includes(dateStr);
        return {
          ...med,
          loggedDays: taken ? med.loggedDays.filter(d => d !== dateStr) : [...med.loggedDays, dateStr],
          refillCount: taken ? med.refillCount + 1 : Math.max(0, med.refillCount - 1)
        };
      }
      return med;
    }));
  };

  const handleAddXp = (amount: number) => {
    setXpPoints(prev => prev + amount);
  };

  // --- Calculate Health Score dynamically ---
  const calculateDailyHealthScore = () => {
    let score = 50; // baseline
    const today = new Date().toISOString().split("T")[0];
    
    // Water metric
    const todayWater = waterLogs.filter(w => w.timestamp.startsWith(today)).reduce((s, w) => s + w.amountMl, 0);
    if (todayWater >= userProfile.waterTargetMl) score += 15;
    else if (todayWater > 1000) score += 8;

    // Workout metric
    const todayWorkouts = workoutLogs.filter(w => w.timestamp.startsWith(today));
    if (todayWorkouts.length > 0) score += 15;

    // Diet metric
    const todayCal = foodLogs.filter(f => f.timestamp.startsWith(today)).reduce((s, f) => s + f.calories, 0);
    if (todayCal > 0 && todayCal <= userProfile.dailyCalorieTarget) score += 20;

    return Math.min(100, score);
  };

  // Update Profile parameters
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setShowProfileModal(false);
    handleAddXp(200);
    alert("Profile parameters optimized and recalibrated successfully!");
  };

  return (
    <div className="min-h-screen bg-[#F1F5F2] text-[#1F2937] flex flex-col md:flex-row font-sans" id="app_root">
      
      {/* Side Navigation Bar */}
      <aside className="w-full md:w-64 bg-[#1F2937] text-white shrink-0 flex flex-col justify-between p-6 border-r border-gray-800" id="app_aside">
        <div className="space-y-8">
          
          {/* Logo Brand Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-emerald-500/20">
                🌱
              </div>
              <div>
                <span className="font-black text-sm block tracking-tight">FitVitaCoach</span>
                <span className="text-[10px] text-emerald-400 font-bold block leading-none">Your Health Operating Sys</span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className={`md:block space-y-1.5 ${isMobileMenuOpen ? "block" : "hidden md:block"}`}>
            {[
              { id: "dashboard", label: "Dashboard", icon: Activity },
              { id: "calories", label: "Nutrition Diary", icon: Flame },
              { id: "planner", label: "AI Meal Planner", icon: Sparkles },
              { id: "fitness", label: "Fitness Hub", icon: Dumbbell },
              { id: "body", label: "Body Composition", icon: Scale },
              { id: "mental", label: "Mindfulness Center", icon: Smile },
              { id: "habits", label: "Habit Formulator", icon: Star },
              { id: "meds", label: "Medication & Vault", icon: ClipboardList },
              { id: "modules", label: "Lifestyle Modules", icon: BookOpen },
              { id: "coach", label: "AI Health Coach", icon: Heart },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeTab === item.id 
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10" 
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Mini Profile & Settings */}
        <div className={`mt-8 pt-4 border-t border-slate-900 md:block ${isMobileMenuOpen ? "block" : "hidden md:block"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-emerald-400">
                SF
              </div>
              <div>
                <div className="text-xs font-black text-slate-200">{userProfile.name}</div>
                <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">{userProfile.role}</div>
              </div>
            </div>

            <button 
              onClick={() => setShowProfileModal(true)}
              className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Calibrate Onboarding Profile"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Panel Frame */}
      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
        
        {/* Render Active Module */}
        {activeTab === "dashboard" && (
          <HomeDashboard 
            userProfile={userProfile}
            foodLogs={foodLogs}
            workoutLogs={workoutLogs}
            waterLogs={waterLogs}
            sleepLogs={sleepLogs}
            onQuickLogWater={handleAddWaterLog}
            onQuickLogCal={(name, cal) => handleAddFoodLog({ mealType: "Snack", foodName: name, calories: cal, protein: 4, carbs: 20, fat: 5, servingSize: "1 Snack Portion" })}
            onAddActiveMinutes={(name, min, cal) => handleAddWorkoutLog({ exerciseName: name, category: "Cardio", durationMinutes: min, caloriesBurned: cal, notes: "Logged via quick dashboard click" })}
            dailyHealthScore={calculateDailyHealthScore()}
            xpPoints={xpPoints}
          />
        )}

        {activeTab === "calories" && (
          <SmartCalorieTracker 
            userProfile={userProfile}
            foodLogs={foodLogs}
            onAddFoodLog={handleAddFoodLog}
            onDeleteFoodLog={handleDeleteFoodLog}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === "planner" && (
          <AIMealPlanner 
            userProfile={userProfile}
            onAddFoodLog={handleAddFoodLog}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === "fitness" && (
          <FitnessModule 
            userProfile={userProfile}
            workoutLogs={workoutLogs}
            onAddWorkoutLog={handleAddWorkoutLog}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === "body" && (
          <BodyTracker 
            userProfile={userProfile}
            onChangeWeight={(w) => setUserProfile(prev => ({ ...prev, weight: w }))}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === "mental" && (
          <MentalWellness 
            moodLogs={moodLogs}
            onAddMoodLog={handleAddMoodLog}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === "habits" && (
          <HabitCoach 
            habits={habits}
            onToggleHabit={handleToggleHabit}
            onAddHabit={handleAddHabit}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === "meds" && (
          <MedicationCenter 
            userProfile={userProfile}
            medications={medications}
            onToggleMedication={handleToggleMedication}
            onAddMedication={handleAddMedication}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === "modules" && (
          <MoreModules 
            userProfile={userProfile}
            onChangeProfile={(p) => setUserProfile(prev => ({ ...prev, ...p }))}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === "coach" && (
          <AICoachChat 
            userProfile={userProfile}
          />
        )}

      </main>

      {/* Dynamic Profile/Onboarding Calibration Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-gray-100 shadow-xl animate-fadeIn">
            
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm tracking-tight">Onboarding Profile Calibration</h3>
                <p className="text-[10px] text-emerald-400 mt-0.5 font-bold">RECONFIGURING PERSONAL BIOMARKERS</p>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">User Name</label>
                  <input 
                    type="text" 
                    value={userProfile.name}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-150 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Profile Role</label>
                  <select 
                    value={userProfile.role}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-150 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                  >
                    <option value="SMI Fahim">Supreme Admin: SMI Fahim</option>
                    <option value="Registered User">Registered User</option>
                    <option value="Premium User">Premium User ⭐</option>
                    <option value="Doctor">Clinical Advisor (Doctor)</option>
                    <option value="Nutritionist">Licensed Dietitian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Age</label>
                  <input 
                    type="number" 
                    value={userProfile.age}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, age: Number(e.target.value) }))}
                    className="w-full p-2 border border-gray-150 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Height (cm)</label>
                  <input 
                    type="number" 
                    value={userProfile.height}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, height: Number(e.target.value) }))}
                    className="w-full p-2 border border-gray-150 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={userProfile.weight}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, weight: Number(e.target.value) }))}
                    className="w-full p-2 border border-gray-150 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Primary Fitness Goal</label>
                  <select 
                    value={userProfile.goal}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, goal: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-150 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                  >
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Heart Healthy">Heart Healthy</option>
                    <option value="PCOS Management">PCOS Management</option>
                    <option value="Diabetes Care">Diabetes Care</option>
                    <option value="General Wellness">General Wellness</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Daily Calorie Target</label>
                  <input 
                    type="number" 
                    value={userProfile.dailyCalorieTarget}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, dailyCalorieTarget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-150 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950 font-medium">
                <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p>Calibrating these metrics automatically recalculates your target hydration formulas, BMI bands, macro proportions, and daily wellness logs.</p>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Save & Recalibrate Metrics
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
