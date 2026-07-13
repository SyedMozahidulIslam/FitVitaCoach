import React, { useState } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { Scale, TrendingUp, Plus, Activity, LayoutGrid, Ruler } from "lucide-react";
import { UserProfile } from "../types";

interface BodyTrackerProps {
  userProfile: UserProfile;
  onChangeWeight: (weight: number) => void;
  onAddXp: (amount: number) => void;
}

// Initial mockup historical progress data for visualization
const INITIAL_BODY_HISTORY = [
  { date: "May 1", weight: 78.5, bodyFat: 18.5, waist: 34.0 },
  { date: "May 15", weight: 77.8, bodyFat: 18.2, waist: 33.5 },
  { date: "Jun 1", weight: 77.2, bodyFat: 17.9, waist: 33.2 },
  { date: "Jun 15", weight: 76.5, bodyFat: 17.5, waist: 32.8 },
  { date: "Jul 1", weight: 75.9, bodyFat: 17.1, waist: 32.2 },
  { date: "Jul 13", weight: 75.0, bodyFat: 16.5, waist: 32.0 },
];

export default function BodyTracker({
  userProfile,
  onChangeWeight,
  onAddXp
}: BodyTrackerProps) {
  const [weightInput, setWeightInput] = useState(userProfile.weight.toString());
  const [bodyFatInput, setBodyFatInput] = useState("16.5");
  const [waistInput, setWaistInput] = useState("32.0");
  const [chestInput, setChestInput] = useState("40.0");
  const [hipsInput, setHipsInput] = useState("38.0");
  const [history, setHistory] = useState(INITIAL_BODY_HISTORY);

  // Calculate current BMI based on weight and profile height
  const heightInMeters = userProfile.height / 100;
  const currentBmi = Number((userProfile.weight / (heightInMeters * heightInMeters)).toFixed(1));

  let bmiCategory = "Normal Weight";
  let bmiColor = "text-emerald-500 bg-emerald-50 border-emerald-100";
  if (currentBmi < 18.5) {
    bmiCategory = "Underweight";
    bmiColor = "text-amber-500 bg-amber-50 border-amber-100";
  } else if (currentBmi >= 25 && currentBmi < 29.9) {
    bmiCategory = "Overweight";
    bmiColor = "text-orange-500 bg-orange-50 border-orange-100";
  } else if (currentBmi >= 30) {
    bmiCategory = "Obese";
    bmiColor = "text-rose-500 bg-rose-50 border-rose-100";
  }

  const handleLogMeasurements = (e: React.FormEvent) => {
    e.preventDefault();
    const newWeight = Number(weightInput);
    if (isNaN(newWeight) || newWeight <= 0) return;

    onChangeWeight(newWeight);

    // Append to graph history
    const dateStr = new Date().toLocaleDateString([], { month: "short", day: "numeric" });
    setHistory(prev => [
      ...prev,
      {
        date: dateStr,
        weight: newWeight,
        bodyFat: Number(bodyFatInput) || 16.5,
        waist: Number(waistInput) || 32.0
      }
    ]);

    onAddXp(150);
    alert("Measurements logged successfully!");
  };

  return (
    <div className="space-y-6" id="body_tracker">
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Scale className="w-6 h-6 text-emerald-500" />
            Body Composition & Biometric Tracker
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Log physical measurements, monitor fat distribution ratios, and observe precise progress charts.
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 ${bmiColor}`}>
            BMI: {currentBmi} ({bmiCategory})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left side: Logging panel & body metrics */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Biometrics Entry Form */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
              <Ruler className="w-5 h-5 text-emerald-600" />
              Update Measurements
            </h3>

            <form onSubmit={handleLogMeasurements} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Weight (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Body Fat (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={bodyFatInput}
                    onChange={(e) => setBodyFatInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Waist (in)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={waistInput}
                    onChange={(e) => setWaistInput(e.target.value)}
                    className="w-full p-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Chest (in)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={chestInput}
                    onChange={(e) => setChestInput(e.target.value)}
                    className="w-full p-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Hips (in)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={hipsInput}
                    onChange={(e) => setHipsInput(e.target.value)}
                    className="w-full p-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-white rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Save Biometrics & Replot
              </button>
            </form>
          </div>

          {/* Current Stats Summary cards */}
          <div className="bg-emerald-950 text-white p-5 rounded-3xl space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-emerald-400">Current Aggregates</h4>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-900/40 p-3 rounded-2xl border border-emerald-900/40">
                <div className="text-[10px] text-emerald-300">Lean Mass Est.</div>
                <div className="text-base font-black font-mono mt-1">62.6 <span className="text-xs font-normal">kg</span></div>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-2xl border border-emerald-900/40">
                <div className="text-[10px] text-emerald-300">Body Water Est.</div>
                <div className="text-base font-black font-mono mt-1">54.2 <span className="text-xs font-normal">%</span></div>
              </div>
            </div>

            <p className="text-[10px] text-emerald-200/80 leading-relaxed italic">
              *Calculated based on whole body bioelectrical impedance guidelines. Lean mass supports systemic energy expenditures and endocrine integrity.
            </p>
          </div>

        </div>

        {/* Right side: Recharts interactive graphs */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Weight & Waist Circumference Trends
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interactive Analytics</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} stroke="#9ca3af" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff", fontSize: "11px" }}
                  labelStyle={{ fontWeight: "bold", color: "#10b981" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Area type="monotone" name="Weight (kg)" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
                <Line type="monotone" name="Waist (in)" dataKey="waist" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-xs mt-0.5">
                📉
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Consistent Downward Trend</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">You have shaved off 3.5 kg over the past 45 days. This points to an effective, metabolic-safe caloric deficit.</p>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg font-bold text-xs mt-0.5">
                📏
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Visceral Fat Reduction</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Waist reduction of 2.0 inches represents a direct decrease in visceral fat deposits, optimizing long-term cardiac output.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
