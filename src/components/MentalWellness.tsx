import React, { useState, useEffect } from "react";
import { Smile, Sparkles, BrainCircuit, Heart, Plus, Send, Play, Square, Moon } from "lucide-react";
import { MoodLog } from "../types";

interface MentalWellnessProps {
  moodLogs: MoodLog[];
  onAddMoodLog: (log: Omit<MoodLog, "id" | "timestamp">) => void;
  onAddXp: (amount: number) => void;
}

export default function MentalWellness({
  moodLogs,
  onAddMoodLog,
  onAddXp
}: MentalWellnessProps) {
  const [moodScore, setMoodScore] = useState<number>(8);
  const [stressLevel, setStressLevel] = useState<number>(4);
  const [journalText, setJournalText] = useState("");
  const [gratitudeInputs, setGratitudeInputs] = useState<string[]>(["", "", ""]);

  // Breathing Coach states
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Ready">("Ready");
  const [breathingSecLeft, setBreathingSecLeft] = useState(4);
  const [breathingCycleCount, setBreathingCycleCount] = useState(0);

  // Breathing timer cycle logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (breathingActive) {
      timer = setInterval(() => {
        setBreathingSecLeft(prev => {
          if (prev <= 1) {
            // transition phase
            if (breathingPhase === "Inhale") {
              setBreathingPhase("Hold");
              return 4; // hold for 4s
            } else if (breathingPhase === "Hold") {
              setBreathingPhase("Exhale");
              return 4; // exhale for 4s
            } else {
              setBreathingPhase("Inhale");
              setBreathingCycleCount(c => c + 1);
              return 4; // inhale for 4s
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathingPhase("Ready");
      setBreathingSecLeft(4);
    }

    return () => clearInterval(timer);
  }, [breathingActive, breathingPhase]);

  const handleStartBreathing = () => {
    setBreathingActive(true);
    setBreathingPhase("Inhale");
    setBreathingSecLeft(4);
    setBreathingCycleCount(0);
    onAddXp(100);
  };

  const handleStopBreathing = () => {
    setBreathingActive(false);
    setBreathingPhase("Ready");
  };

  const handleLogWellnessState = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMoodLog({
      score: moodScore,
      stressLevel,
      journalText: journalText || "Logged general state"
    });

    setJournalText("");
    onAddXp(150);
    alert("Mental Wellness metrics saved! Keep building healthy cognitive routines.");
  };

  return (
    <div className="space-y-6" id="mental_wellness">
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-emerald-500" />
            Mindfulness & Cognitive Wellness Suite
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Track daily psychological scores, manage cortisol spikes, and practice heart-rate-variability breathing loops.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Breathing coach */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400 animate-pulse" />
                Vagus Nerve Breathing Coach
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full uppercase">
                Interactive
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Activate your parasympathetic nervous system using the classic 4-4-4 Box Breathing ratio, lowering resting blood pressure and reducing anxiety.
            </p>
          </div>

          {/* Breathing Animated Container */}
          <div className="flex flex-col items-center justify-center py-6 relative">
            
            {/* Pulsing visual circles */}
            <div className="relative flex items-center justify-center w-40 h-40">
              <div 
                className={`absolute rounded-full bg-emerald-500/10 border border-emerald-500/20 transition-all duration-1000 ${
                  breathingPhase === "Inhale" ? "w-36 h-36 scale-110" :
                  breathingPhase === "Hold" ? "w-36 h-36 scale-110" :
                  "w-24 h-24 scale-90"
                }`} 
              />
              <div 
                className={`absolute rounded-full bg-emerald-500/20 border-2 border-emerald-400/30 transition-all duration-1000 ${
                  breathingPhase === "Inhale" ? "w-32 h-32 scale-105" :
                  breathingPhase === "Hold" ? "w-32 h-32 scale-105" :
                  "w-20 h-20 scale-95"
                }`} 
              />
              <div className="w-24 h-24 bg-emerald-500 text-slate-950 rounded-full flex flex-col items-center justify-center z-10 font-bold shadow-lg shadow-emerald-500/20">
                <span className="text-xs font-black uppercase tracking-widest leading-none">
                  {breathingPhase}
                </span>
                {breathingActive && (
                  <span className="text-lg font-mono font-black mt-1">{breathingSecLeft}s</span>
                )}
              </div>
            </div>

            {breathingActive && (
              <p className="text-xs text-emerald-400 font-bold uppercase mt-4 tracking-widest animate-pulse">
                Cycle Progress: {breathingCycleCount} completed
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            {!breathingActive ? (
              <button 
                onClick={handleStartBreathing}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-slate-950" /> Start Breathing Coach
              </button>
            ) : (
              <button 
                onClick={handleStopBreathing}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Square className="w-4 h-4 fill-white" /> Stop Breathing Session
              </button>
            )}
          </div>
        </div>

        {/* Right column: Mood logging and daily journaling */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <h3 className="font-bold text-gray-900">Psychological State Logger</h3>
          
          <form onSubmit={handleLogWellnessState} className="space-y-4">
            
            {/* Sliders for mood and stress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-100/80">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700 uppercase">Mood Quality Score</label>
                  <span className="text-xs font-black font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {moodScore} / 10
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={moodScore}
                  onChange={(e) => setMoodScore(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1 bg-gray-200 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>Anxious / Dull</span>
                  <span>Optimistic / Vibrant</span>
                </div>
              </div>

              <div className="space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-100/80">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700 uppercase">Cortisol / Stress Level</label>
                  <span className="text-xs font-black font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {stressLevel} / 10
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1 bg-gray-200 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>Deep Serenity</span>
                  <span>High Burnout</span>
                </div>
              </div>

            </div>

            {/* Gratitude Journal placeholders */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase block">Daily Gratitude Points (3 things you are thankful for)</label>
              <div className="space-y-2">
                {[0, 1, 2].map(index => (
                  <input 
                    key={index}
                    type="text"
                    placeholder={`Gratitude factor #${index + 1}`}
                    value={gratitudeInputs[index]}
                    onChange={(e) => {
                      const updated = [...gratitudeInputs];
                      updated[index] = e.target.value;
                      setGratitudeInputs(updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                  />
                ))}
              </div>
            </div>

            {/* Journal text box */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase">Reflective Journal Entry</label>
              <textarea 
                rows={3}
                placeholder="What is on your mind today? Expressing your feelings reduces cortisol levels and structures cognitive coherence."
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Send className="w-4 h-4" /> Save Psychological Logs
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
