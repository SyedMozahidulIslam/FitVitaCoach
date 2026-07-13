import React, { useState } from "react";
import { 
  Flame, Plus, Dumbbell, Calendar, Play, Trophy, 
  Search, ArrowUpRight, TrendingUp, Sparkles, Check
} from "lucide-react";
import { WorkoutLog, UserProfile } from "../types";

interface FitnessModuleProps {
  userProfile: UserProfile;
  workoutLogs: WorkoutLog[];
  onAddWorkoutLog: (log: Omit<WorkoutLog, "id" | "timestamp">) => void;
  onAddXp: (amount: number) => void;
}

const PRESET_WORKOUTS = [
  { name: "Full-Body Strength Compound Lift", category: "Strength" as const, duration: 45, calories: 340, difficulty: "Intermediate" },
  { name: "Core Centered Hatha Yoga Loop", category: "Yoga/Pilates" as const, duration: 30, calories: 120, difficulty: "Beginner" },
  { name: "Zone 2 High-Metabolism Jogging", category: "Cardio" as const, duration: 35, calories: 310, difficulty: "Intermediate" },
  { name: "Cardio HIIT Fat-Burning Intervals", category: "HIIT" as const, duration: 25, calories: 290, difficulty: "Advanced" },
  { name: "Post-Workout Active Static Stretch", category: "Stretch" as const, duration: 15, calories: 60, difficulty: "Beginner" },
];

export default function FitnessModule({
  userProfile,
  workoutLogs,
  onAddWorkoutLog,
  onAddXp
}: FitnessModuleProps) {
  const [exerciseName, setExerciseName] = useState("");
  const [category, setCategory] = useState<"Strength" | "Cardio" | "Yoga/Pilates" | "Stretch" | "HIIT">("Strength");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"log" | "library" | "pr">("log");
  const [videoSimName, setVideoSimName] = useState<string | null>(null);

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    onAddWorkoutLog({
      exerciseName,
      category,
      durationMinutes: Number(duration) || 20,
      caloriesBurned: Number(calories) || 150,
      notes
    });

    setExerciseName("");
    setDuration("");
    setCalories("");
    setNotes("");
    onAddXp(200);
  };

  const handleQuickLogPreset = (preset: typeof PRESET_WORKOUTS[0]) => {
    onAddWorkoutLog({
      exerciseName: preset.name,
      category: preset.category,
      durationMinutes: preset.duration,
      caloriesBurned: preset.calories,
      notes: `Preset logged with ${preset.difficulty} intensity`
    });
    onAddXp(200);
    alert(`Logged: ${preset.name}`);
  };

  const handleSimulateVideo = (name: string) => {
    setVideoSimName(name);
  };

  return (
    <div className="space-y-6" id="fitness_module">
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-emerald-500" />
            Active Fitness & Athletic Hub
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Build lean mass, monitor cardiovascular performance, and view professional biomechanics.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(["log", "library", "pr"] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${activeTab === tab ? "bg-white text-emerald-600 shadow-xs" : "text-gray-500 hover:text-gray-900"}`}
            >
              {tab === "pr" ? "Personal Records" : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main interactive workout logging or Library */}
        <div className="lg:col-span-7 space-y-6">
          
          {activeTab === "log" && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-bold text-gray-900">Record Active Workout</h3>
              
              <form onSubmit={handleSubmitLog} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Movement Category</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                    >
                      <option value="Strength">Strength Compound 🏋️</option>
                      <option value="Cardio">Cardiovascular Run/Cycle 🏃</option>
                      <option value="Yoga/Pilates">Yoga & Pilates Balance 🧘</option>
                      <option value="HIIT">HIIT Fat Burn 🔥</option>
                      <option value="Stretch">Active Recovery Stretch 🧘‍♀️</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Duration (Minutes)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 30"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Exercise Name</label>
                    <input 
                      type="text" 
                      placeholder="Squats, Bench Press, Treadmill Run..."
                      value={exerciseName}
                      onChange={(e) => setExerciseName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Est. Calories Burned</label>
                    <input 
                      type="number" 
                      placeholder="Kcal"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Workout notes (Sets, Reps, or Intensity)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 4 sets of 12 reps at 60kg, felt energized"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-white rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Save Active Workout Session
                </button>
              </form>
            </div>
          )}

          {activeTab === "library" && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-bold text-gray-900">Custom Guided Movement Library</h3>
              <p className="text-xs text-gray-400">Tap standard templates or play physical guides to master mechanics.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PRESET_WORKOUTS.map((preset, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {preset.category}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 font-mono">{preset.difficulty}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 leading-tight">{preset.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">{preset.duration} min | {preset.calories} kcal</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100/60">
                      <button 
                        onClick={() => handleSimulateVideo(preset.name)}
                        className="flex-1 py-1 px-2.5 bg-slate-900 hover:bg-emerald-500 text-white font-bold text-[9px] rounded-md transition-colors flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-white" /> Guide Video
                      </button>
                      <button 
                        onClick={() => handleQuickLogPreset(preset)}
                        className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[9px] rounded-md transition-colors flex items-center justify-center"
                      >
                        Log Preset
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "pr" && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Your Athletic Personal Records (PR)
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-amber-50/40 rounded-2xl border border-amber-100 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">Strength</span>
                    <div className="text-xs font-extrabold text-gray-900 mt-1">Compound Deadlift Max</div>
                  </div>
                  <span className="text-sm font-black font-mono text-gray-800">140 kg (308 lbs)</span>
                </div>
                <div className="p-3 bg-blue-50/40 rounded-2xl border border-blue-100 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">Cardio</span>
                    <div className="text-xs font-extrabold text-gray-900 mt-1">Fastest 5K Running Pace</div>
                  </div>
                  <span className="text-sm font-black font-mono text-gray-800">22 mins 15 secs</span>
                </div>
                <div className="p-3 bg-purple-50/40 rounded-2xl border border-purple-100 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">HIIT</span>
                    <div className="text-xs font-extrabold text-gray-900 mt-1">Strict Burpee Intervals Max</div>
                  </div>
                  <span className="text-sm font-black font-mono text-gray-800">45 reps / 2 mins</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right pane: guided videos and activity records */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Simulated Biomechanics Video Guide */}
          {videoSimName ? (
            <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full">
                  Guided Bio-Feedback Active
                </span>
                <button 
                  onClick={() => setVideoSimName(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="aspect-video bg-slate-950 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group border border-slate-800">
                <div className="absolute inset-0 bg-radial from-transparent to-slate-950/80 pointer-events-none" />
                
                {/* Visual simulator simulation */}
                <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center animate-pulse shadow-md z-10">
                  <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                </div>

                <div className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase mt-4 z-10">Streaming Bio-Form Guidance</div>
                <div className="text-xs font-bold text-slate-200 mt-1 z-10 text-center px-4">{videoSimName}</div>
              </div>

              <div className="text-xs bg-slate-950 p-3 rounded-xl space-y-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase">Form Correction Advice</span>
                <p className="text-slate-300">Keep your core heavily braced. Inhale deeply on eccentric path, and exhale forcefully during concentric execution.</p>
              </div>
            </div>
          ) : (
            <div className="bg-linear-to-b from-emerald-950 to-slate-950 text-white p-6 rounded-3xl border border-emerald-900/40 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm">Form Correction Videos</h3>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Unlock high-fidelity 4K video guides reviewing posture, kinetic mechanics, and joint safety designed directly by our Sports Scientists. Tap 'Guide Video' on the library tab to preview!
              </p>
            </div>
          )}

          {/* Today's logged exercises */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 flex justify-between items-center">
              <span>Today's Movements</span>
              <span className="text-xs font-bold text-gray-400">
                ({workoutLogs.filter(w => w.timestamp.startsWith(new Date().toISOString().split("T")[0])).length} logged)
              </span>
            </h3>

            <div className="space-y-3">
              {workoutLogs.length === 0 ? (
                <div className="p-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
                  No active workout recorded today yet. Use the logger on the left or quick log actions!
                </div>
              ) : (
                workoutLogs.map(log => (
                  <div key={log.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <span className="text-[8px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {log.category}
                      </span>
                      <h4 className="text-xs font-bold text-gray-900 mt-1.5">{log.exerciseName}</h4>
                      <div className="text-[10px] text-gray-400 mt-0.5">{log.durationMinutes} minutes | {log.notes || "High focus execution"}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-rose-600 font-mono">-{log.caloriesBurned} kcal</div>
                      <div className="text-[9px] text-gray-400 font-bold mt-1 uppercase">Active</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
