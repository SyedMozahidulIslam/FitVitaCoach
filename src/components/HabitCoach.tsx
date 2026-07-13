import React, { useState } from "react";
import { Sparkles, Check, Flame, Trophy, Plus, Calendar, Star, RefreshCw } from "lucide-react";
import { Habit } from "../types";

interface HabitCoachProps {
  habits: Habit[];
  onToggleHabit: (id: string, date: string) => void;
  onAddHabit: (habit: Omit<Habit, "id" | "completedDays" | "streak">) => void;
  onAddXp: (amount: number) => void;
}

const PRESET_CHALLENGES = [
  { title: "Metabolic Kickstart", desc: "No refined sugar & 30m steps daily", durationDays: 14, rewardXp: 1000 },
  { title: "Deep Sleep Architecture", desc: "No blue light screens 60m before bed", durationDays: 7, rewardXp: 500 },
  { title: "Consistent Hydration", desc: "Complete daily water target 7 days in a row", durationDays: 7, rewardXp: 600 }
];

export default function HabitCoach({
  habits,
  onToggleHabit,
  onAddHabit,
  onAddXp
}: HabitCoachProps) {
  const [newHabitName, setNewHabitName] = useState("");
  const [habitCategory, setHabitCategory] = useState<"Morning" | "Night" | "Productivity" | "Lifestyle" | "Nutrition">("Morning");
  const todayStr = new Date().toISOString().split("T")[0];

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    onAddHabit({
      name: newHabitName,
      category: habitCategory,
      frequency: "Daily"
    });

    setNewHabitName("");
    onAddXp(100);
    alert(`Habit "${newHabitName}" registered successfully!`);
  };

  return (
    <div className="space-y-6" id="habit_coach">
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
            Habit Formulation & Lifestyle Coach
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Build consistency, structure morning or night routines, and unlock seasonal wellness achievements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Habit List */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Habit board */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 flex justify-between items-center">
              <span>Today's Habit Checklist</span>
              <span className="text-xs font-bold text-gray-400 font-mono">Date: {todayStr}</span>
            </h3>

            {habits.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2 animate-bounce" />
                <p className="text-xs font-bold text-gray-400">Your habit board is clean.</p>
                <p className="text-[10px] text-gray-400 mt-1">Configure your morning or night targets on the right side.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {habits.map(habit => {
                  const isCompletedToday = habit.completedDays.includes(todayStr);
                  
                  return (
                    <div 
                      key={habit.id}
                      className={`p-4 rounded-2xl border transition-all flex justify-between items-center ${isCompletedToday ? "bg-emerald-50/50 border-emerald-100" : "bg-gray-50/50 border-gray-100"}`}
                    >
                      <div className="space-y-1">
                        <span className={`text-[8px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          habit.category === "Morning" ? "bg-amber-100 text-amber-800" :
                          habit.category === "Night" ? "bg-indigo-100 text-indigo-800" :
                          "bg-emerald-100 text-emerald-800"
                        }`}>
                          {habit.category} Routine
                        </span>
                        <div className={`text-xs font-bold leading-tight mt-1 ${isCompletedToday ? "line-through text-gray-400" : "text-gray-900"}`}>
                          {habit.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-orange-600 font-bold font-mono">
                          <Flame className="w-3.5 h-3.5" />
                          <span>Streak: {habit.streak} days</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          onToggleHabit(habit.id, todayStr);
                          if (!isCompletedToday) onAddXp(100);
                        }}
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                          isCompletedToday ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-200 text-gray-300 hover:text-emerald-500 hover:border-emerald-500"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Milestone Challenges */}
          <div className="bg-emerald-950 text-white p-6 rounded-3xl border border-emerald-900 shadow-sm space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <Trophy className="w-5 h-5 text-yellow-300 animate-pulse" />
              FitVita Premium Seasonal Challenges
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRESET_CHALLENGES.map((challenge, i) => (
                <div key={i} className="bg-slate-900/50 p-4 rounded-2xl border border-emerald-900/50 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{challenge.title}</h4>
                    <p className="text-[10px] text-emerald-200/70 mt-1 leading-relaxed">{challenge.desc}</p>
                  </div>
                  <div className="flex justify-between items-center pt-3 mt-3 border-t border-emerald-900/30">
                    <span className="text-[9px] font-mono font-bold text-yellow-300 bg-yellow-950/40 px-1.5 py-0.5 rounded-full">
                      +{challenge.rewardXp} XP
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold">{challenge.durationDays} Days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Setup habits */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-900">Formulate New Habit</h3>
          
          <form onSubmit={handleCreateHabit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Routine Time</label>
              <select 
                value={habitCategory}
                onChange={(e) => setHabitCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
              >
                <option value="Morning">Morning Routine ☀️</option>
                <option value="Night">Night Routine 🌙</option>
                <option value="Productivity">Productivity Flow 🚀</option>
                <option value="Lifestyle">Lifestyle Habits 🌱</option>
                <option value="Nutrition">Nutrition Discipline 🥗</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Habit Title</label>
              <input 
                type="text" 
                placeholder="e.g. Do 15 min diaphragmatic breathing"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-white rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Habit Tracker
            </button>
          </form>

          {/* Tips block */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs text-emerald-950 font-medium leading-relaxed">
            💡 <span className="font-bold">Habit tip:</span> Keep habits atomic and anchor them to an existing sequence (e.g., "Right after I brush my teeth, I will log my water target"). This minimizes willpower fatigue.
          </div>
        </div>

      </div>
    </div>
  );
}
