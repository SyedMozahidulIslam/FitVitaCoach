import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Square, RefreshCw, Volume2, Plus, Brain, Award, AlertCircle, 
  BarChart3, Calendar, ListTodo, Sparkles, TrendingUp, Compass, Sliders,
  Music, Volume1, Battery, Heart, Zap, UserCheck
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

interface FocusProductivityCenterProps {
  onAddXp: (amount: number) => void;
}

// Focus History Entry
interface FocusHistoryEntry {
  id: string;
  type: string; // "Deep Work" | "Pomodoro" | "Short Break" | "Custom"
  duration: number; // minutes completed
  timestamp: string;
  distractions: number;
  score: number; // calculated productivity score 0-100
}

export default function FocusProductivityCenter({ onAddXp }: FocusProductivityCenterProps) {
  // --- Timer State ---
  const [sessionType, setSessionType] = useState<"Pomodoro" | "Deep Work" | "Custom">("Pomodoro");
  const [timerState, setTimerState] = useState<"idle" | "running" | "paused">("idle");
  const [customMinutes, setCustomMinutes] = useState<number>(45);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [initialSeconds, setInitialSeconds] = useState<number>(25 * 60);
  const [distractionCount, setDistractionCount] = useState<number>(0);
  const [brainEnergy, setBrainEnergy] = useState<number>(85); // 0 to 100
  const [focusGoal, setFocusGoal] = useState<number>(120); // target minutes per day
  const [focusHistory, setFocusHistory] = useState<FocusHistoryEntry[]>(() => {
    const cached = localStorage.getItem("fitvita_focus_history");
    if (cached) return JSON.parse(cached);
    return [
      { id: "1", type: "Pomodoro", duration: 25, timestamp: "2026-07-12T14:30:00Z", distractions: 1, score: 92 },
      { id: "2", type: "Deep Work", duration: 50, timestamp: "2026-07-12T10:00:00Z", distractions: 3, score: 81 },
      { id: "3", type: "Custom", duration: 40, timestamp: "2026-07-11T16:15:00Z", distractions: 0, score: 100 },
      { id: "4", type: "Pomodoro", duration: 25, timestamp: "2026-07-11T11:00:00Z", distractions: 2, score: 85 }
    ];
  });

  // --- Sound Mixer Web Audio Synthesizer Refs ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<Record<string, { source: AudioNode; gainNode: GainNode }>>({});
  
  // Mixer Volume States
  const [volumes, setVolumes] = useState<Record<string, number>>({
    whiteNoise: 0,
    rain: 0,
    nature: 0,
    lofi: 0
  });

  // --- Tab / Views inside Focus Center ---
  const [activeTab, setActiveTab] = useState<"workspace" | "analytics" | "reports">("workspace");

  // --- Report Generation state ---
  const [reportRange, setReportRange] = useState<"Daily" | "Weekly">("Daily");
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Sync Timer Initial Value when sessionType or customMinutes changes
  useEffect(() => {
    if (timerState === "idle") {
      let mins = 25;
      if (sessionType === "Deep Work") mins = 50;
      if (sessionType === "Custom") mins = customMinutes;
      setSecondsLeft(mins * 60);
      setInitialSeconds(mins * 60);
    }
  }, [sessionType, customMinutes, timerState]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("fitvita_focus_history", JSON.stringify(focusHistory));
  }, [focusHistory]);

  // Timer Tick Engine
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerState === "running") {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          // Brain Energy drain during session
          if (prev % 60 === 0) {
            setBrainEnergy(e => Math.max(10, e - 1));
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState, sessionType]);

  // Initialize Web Audio Context on demand (when volume > 0)
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // Web Audio Synthesizers for White Noise, Rain, Nature, and Lofi Chords
  const startSynth = (type: string) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    // Remove if already exists
    if (synthNodesRef.current[type]) {
      try {
        synthNodesRef.current[type].source.disconnect();
      } catch (e) {}
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volumes[type] / 100, ctx.currentTime);
    gainNode.connect(ctx.destination);

    let sourceNode: AudioNode;

    if (type === "whiteNoise") {
      // Generate standard white noise
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      noiseNode.start();
      
      // Connect to a lowpass filter to make it softer/brownish noise
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      
      noiseNode.connect(filter);
      filter.connect(gainNode);
      sourceNode = noiseNode;

    } else if (type === "rain") {
      // Simulate Rain with high-frequency noise + low hum oscillations
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      noiseNode.start();

      const biquadFilter = ctx.createBiquadFilter();
      biquadFilter.type = "bandpass";
      biquadFilter.frequency.setValueAtTime(400, ctx.currentTime);
      biquadFilter.Q.setValueAtTime(1.5, ctx.currentTime);

      noiseNode.connect(biquadFilter);
      biquadFilter.connect(gainNode);
      sourceNode = noiseNode;

    } else if (type === "nature") {
      // Simulate wind / rustling leaves using an oscillating low-frequency wave on lowpass filter
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(0.15, ctx.currentTime); // very slow sweep

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(300, ctx.currentTime);

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;
      noiseNode.start();

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter.frequency);
      osc.start();

      noiseNode.connect(filter);
      filter.connect(gainNode);
      sourceNode = noiseNode;

    } else { // lofi music
      // Simple repetitive synthesized peaceful minor-seventh chords
      const chords = [
        [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
        [146.83, 174.61, 220.00, 261.63], // Dm7 (D3, F3, A3, C4)
        [164.81, 196.00, 246.94, 293.66], // Em7 (E3, G3, B3, D4)
        [174.61, 220.00, 261.63, 329.63]  // Fmaj7 (F3, A3, C4, E4)
      ];

      // Custom node container that coordinates chords
      const controllerNode = ctx.createGain(); // dummy container node
      controllerNode.connect(gainNode);
      
      let chordIndex = 0;
      const playNextChord = () => {
        if (!synthNodesRef.current["lofi"]) return;
        const noteFreqs = chords[chordIndex];
        const now = ctx.currentTime;
        
        noteFreqs.forEach(freq => {
          const oscNode = ctx.createOscillator();
          const noteGain = ctx.createGain();
          
          oscNode.type = "sine";
          oscNode.frequency.setValueAtTime(freq, now);
          
          noteGain.gain.setValueAtTime(0, now);
          noteGain.gain.linearRampToValueAtTime(0.08, now + 1.5);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 7.5);
          
          oscNode.connect(noteGain);
          noteGain.connect(controllerNode);
          oscNode.start(now);
          oscNode.stop(now + 8.0);
        });

        chordIndex = (chordIndex + 1) % chords.length;
      };

      // Periodic trigger
      playNextChord();
      const intervalId = setInterval(playNextChord, 8000);

      // We bundle the interval cleanup inside the source node wrapper
      const dummySource = {
        disconnect: () => {
          clearInterval(intervalId);
          controllerNode.disconnect();
        }
      } as any;

      sourceNode = dummySource;
    }

    synthNodesRef.current[type] = { source: sourceNode, gainNode };
  };

  const handleVolumeChange = (type: string, val: number) => {
    initAudio();
    setVolumes(prev => {
      const updated = { ...prev, [type]: val };
      
      // If volume is changed from 0 to positive, start synthesis
      if (val > 0 && prev[type] === 0) {
        startSynth(type);
      } else if (val === 0 && prev[type] > 0) {
        // Stop synthesis
        if (synthNodesRef.current[type]) {
          try {
            synthNodesRef.current[type].source.disconnect();
            delete synthNodesRef.current[type];
          } catch (e) {}
        }
      } else if (synthNodesRef.current[type]) {
        // Update volume on gain node
        synthNodesRef.current[type].gainNode.gain.setValueAtTime(val / 100, audioCtxRef.current!.currentTime);
      }

      return updated;
    });
  };

  const stopAllAudio = () => {
    Object.keys(synthNodesRef.current).forEach(type => {
      try {
        synthNodesRef.current[type].source.disconnect();
      } catch (e) {}
    });
    synthNodesRef.current = {};
    setVolumes({
      whiteNoise: 0,
      rain: 0,
      nature: 0,
      lofi: 0
    });
  };

  useEffect(() => {
    return () => {
      // Cleanup audio context on unmount
      Object.keys(synthNodesRef.current).forEach(type => {
        try {
          synthNodesRef.current[type].source.disconnect();
        } catch (e) {}
      });
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // --- Core Session Control Handlers ---
  const handleStartTimer = () => {
    initAudio();
    setTimerState("running");
  };

  const handlePauseTimer = () => {
    setTimerState("paused");
  };

  const handleResetTimer = () => {
    setTimerState("idle");
    setDistractionCount(0);
    let mins = 25;
    if (sessionType === "Deep Work") mins = 50;
    if (sessionType === "Custom") mins = customMinutes;
    setSecondsLeft(mins * 60);
  };

  const handleLogDistraction = () => {
    setDistractionCount(prev => prev + 1);
    // Flash dynamic warning
    onAddXp(-2); // small motivational deduction, or warning
  };

  const handleSessionComplete = () => {
    setTimerState("idle");
    const duration = Math.round(initialSeconds / 60);
    
    // Calculate custom session score: starts at 100, subtracts 8 per distraction
    const score = Math.max(30, 100 - distractionCount * 8);
    const bonusXp = Math.round(duration * 2 + score / 5);

    const newEntry: FocusHistoryEntry = {
      id: Date.now().toString(),
      type: sessionType,
      duration,
      timestamp: new Date().toISOString(),
      distractions: distractionCount,
      score
    };

    setFocusHistory(prev => [newEntry, ...prev]);
    setBrainEnergy(e => Math.min(100, e + 20)); // recovery boost
    setDistractionCount(0);

    alert(`🎉 Session Completed! You completed ${duration} mins of ${sessionType} with a Productivity Score of ${score}%. Earned +${bonusXp} XP!`);
    onAddXp(bonusXp);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- Calculations for Analytics ---
  const totalFocusMinutes = focusHistory.reduce((sum, h) => sum + h.duration, 0);
  const avgProductivityScore = focusHistory.length > 0 
    ? Math.round(focusHistory.reduce((sum, h) => sum + h.score, 0) / focusHistory.length) 
    : 85;

  const distractionRate = focusHistory.length > 0
    ? (focusHistory.reduce((sum, h) => sum + h.distractions, 0) / totalFocusMinutes * 60).toFixed(1)
    : "1.5"; // distractions per hour

  const todayFocusMinutes = focusHistory
    .filter(h => h.timestamp.startsWith(new Date().toISOString().split("T")[0]))
    .reduce((sum, h) => sum + h.duration, 0);

  const goalProgressPercent = Math.min(100, Math.round((todayFocusMinutes / focusGoal) * 100));

  // Focus Recommendation engine
  const focusRecommendations = [
    { title: "Optimize Brain Energy", desc: "Your current cognitive fuel is depleting. Play Lo-Fi chord synth and take a 5-minute deep-breathing pause.", score: 45 },
    { title: "Reduce Context Switching", desc: "You logged multiple distractions last session. Try the White Noise generator block to lock mental focus.", score: 80 },
    { title: "Sustain Flow Cycles", desc: "Your average focus block duration is 30 mins. Extend to 50 minutes (Deep Work) to enter restorative Flow State.", score: 65 }
  ];

  return (
    <div className="space-y-6">
      {/* Mini Navigation Menu inside Focus Center */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-gray-200">
        <button 
          onClick={() => setActiveTab("workspace")}
          className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
            activeTab === "workspace" ? "bg-slate-900 text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          🎯 Focus Workspace
        </button>
        <button 
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
            activeTab === "analytics" ? "bg-slate-900 text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📈 Focus Analytics
        </button>
        <button 
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
            activeTab === "reports" ? "bg-slate-900 text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📑 Executive Reports
        </button>
      </div>

      {activeTab === "workspace" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Focus Clock Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs relative overflow-hidden">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-extrabold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                  <Battery className={`w-3.5 h-3.5 ${brainEnergy < 30 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`} />
                  Brain Energy: {brainEnergy}%
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  COGNITIVE FOCUS CYCLER
                </span>
                <div className="flex gap-2">
                  {(["Pomodoro", "Deep Work", "Custom"] as const).map(type => (
                    <button
                      key={type}
                      disabled={timerState !== "idle"}
                      onClick={() => setSessionType(type)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                        sessionType === type
                          ? "bg-slate-900 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                      }`}
                    >
                      {type === "Pomodoro" ? "🍅 Pomodoro" : type === "Deep Work" ? "🧠 Deep Work (50m)" : "⚙️ Custom"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Minutes Input */}
              {sessionType === "Custom" && timerState === "idle" && (
                <div className="mt-4 flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-gray-100">
                  <label className="text-[11px] font-bold text-gray-500">Focus Duration (mins):</label>
                  <input 
                    type="number"
                    min={5}
                    max={180}
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(5, parseInt(e.target.value) || 25))}
                    className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-xs font-mono font-bold text-center text-slate-900 focus:outline-none focus:border-slate-800 bg-white"
                  />
                </div>
              )}

              {/* The Giant Timer Screen */}
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: timerState === "running" ? [1, 1.02, 1] : 1 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="w-56 h-56 rounded-full border-4 border-slate-900 flex flex-col items-center justify-center bg-slate-50/50 shadow-inner relative"
                >
                  <span className="text-4xl font-mono font-black text-slate-950 tracking-tight">
                    {formatTime(secondsLeft)}
                  </span>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1">
                    {timerState === "running" ? "Flowing" : timerState === "paused" ? "Paused" : "Static"}
                  </span>

                  {/* Circular visual progress stroke overlay */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle 
                      cx="112" cy="112" r="108"
                      stroke="#f1f5f9"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle 
                      cx="112" cy="112" r="108"
                      stroke="#0f172a"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 108}
                      strokeDashoffset={2 * Math.PI * 108 * (1 - secondsLeft / initialSeconds)}
                      className="transition-all duration-300"
                    />
                  </svg>
                </motion.div>

                <div className="flex gap-3">
                  {timerState === "idle" && (
                    <button
                      onClick={handleStartTimer}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" /> Begin Focus Block
                    </button>
                  )}

                  {timerState === "running" && (
                    <>
                      <button
                        onClick={handlePauseTimer}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Square className="w-4 h-4 fill-current" /> Pause
                      </button>
                      <button
                        onClick={handleLogDistraction}
                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <AlertCircle className="w-4 h-4 text-rose-600 animate-pulse" /> Log Distraction ({distractionCount})
                      </button>
                    </>
                  )}

                  {timerState === "paused" && (
                    <>
                      <button
                        onClick={handleStartTimer}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Play className="w-4 h-4 fill-current" /> Resume
                      </button>
                      <button
                        onClick={handleResetTimer}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw className="w-4 h-4" /> Reset
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Distraction metric alerts */}
              {distractionCount > 0 && (
                <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-800 animate-pulse">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Distraction logged:</span> Context switching degrades neural memory retrieval by up to 40%. Engage the ambient mixer below to isolate distractions.
                  </div>
                </div>
              )}
            </div>

            {/* Sound Mixer Engine Box */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-slate-800" />
                    Binaural & Ambient Sound Mixer
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Synthesize localized anti-noise frequencies via native Web Audio oscillators</p>
                </div>
                <button 
                  onClick={stopAllAudio}
                  className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg hover:bg-rose-100 transition-all uppercase tracking-wider"
                >
                  Mute All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "whiteNoise", name: "Soft White Noise", desc: "Lowpass filtered background hum", color: "bg-blue-500" },
                  { key: "rain", name: "Gentle Rain Patter", desc: "Bandpassed organic rain sprinkle", color: "bg-indigo-500" },
                  { key: "nature", name: "Forest Canopy Wind", desc: "Triangle wave modulated leaves rustling", color: "bg-emerald-500" },
                  { key: "lofi", name: "Lo-Fi Chord Generator", desc: "Periodic soothing minor-7th synth keys", color: "bg-amber-500" }
                ].map(track => (
                  <div key={track.key} className="bg-slate-50 p-3.5 rounded-2xl border border-gray-200/60 flex flex-col justify-between space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-black text-slate-800 block">{track.name}</span>
                        <span className="text-[9px] text-gray-500 leading-tight block">{track.desc}</span>
                      </div>
                      <Volume2 className={`w-4 h-4 text-slate-400 ${volumes[track.key] > 0 ? "text-slate-800 animate-bounce" : ""}`} />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-gray-400 w-6 font-mono">{volumes[track.key]}%</span>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={volumes[track.key]}
                        onChange={(e) => handleVolumeChange(track.key, parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Productivity Goals and Recommendations Column */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Daily Focus Goal widget */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                DAILY PRODUCTIVITY METRICS
              </h4>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-black text-slate-900">{todayFocusMinutes}</span>
                  <span className="text-xs text-gray-400 block font-bold">Minutes Logged Today</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 font-mono">{goalProgressPercent}%</span>
                  <span className="text-xs text-gray-400 block font-bold">Daily Goal Progress</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-900 rounded-full transition-all duration-500" 
                  style={{ width: `${goalProgressPercent}%` }}
                />
              </div>

              {/* Goal adjuster */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-gray-500 font-bold">Adjust Daily Focus Goal:</span>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setFocusGoal(g => Math.max(30, g - 15))}
                    className="p-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-slate-800 font-black text-xs"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-slate-900 px-2 py-0.5 bg-slate-50 rounded-md">{focusGoal}m</span>
                  <button 
                    onClick={() => setFocusGoal(g => Math.min(480, g + 15))}
                    className="p-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-slate-800 font-black text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Focus Recommendations */}
            <div className="bg-slate-950 text-white p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <h4 className="text-xs font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> SMART RECOMMENDATIONS
              </h4>

              <div className="space-y-3.5">
                {focusRecommendations.map((rec, idx) => (
                  <div key={idx} className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-white">{rec.title}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {rec.score}% match
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {rec.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Focus History Log List */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                FOCUS LEDGER (LAST 4 SESSIONS)
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {focusHistory.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2.5 bg-slate-50 border border-gray-100 rounded-xl text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{item.type} Block</div>
                      <div className="text-[9px] text-gray-400">
                        {new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {item.duration}m duration
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600">{item.score}% Score</div>
                      <div className="text-[9px] text-gray-400 font-bold">{item.distractions} Distraction{item.distractions !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6 bg-white p-6 rounded-3xl border border-gray-100">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-md font-black text-slate-900 flex items-center gap-1.5">
              <BarChart3 className="w-5 h-5 text-slate-800" />
              Focus Dynamics Analytics
            </h3>
            <p className="text-xs text-gray-500">Examine context-switching index, focus durations, and baseline efficiency.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-2xl text-center border border-gray-200/50">
              <span className="text-3xl font-black text-slate-900 font-mono">{totalFocusMinutes}m</span>
              <span className="text-xs text-gray-500 block font-bold mt-1">Cumulative Work Time</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl text-center border border-gray-200/50">
              <span className="text-3xl font-black text-slate-900 font-mono">{avgProductivityScore}%</span>
              <span className="text-xs text-gray-500 block font-bold mt-1">Avg Productivity Score</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl text-center border border-gray-200/50">
              <span className="text-3xl font-black text-slate-900 font-mono">{distractionRate} / hr</span>
              <span className="text-xs text-gray-500 block font-bold mt-1">Distractions Rate</span>
            </div>
          </div>

          <div className="h-64 mt-6">
            <span className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2 block">Focus Block Efficiencies Over History</span>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={focusHistory.slice().reverse()}>
                <defs>
                  <linearGradient id="focusColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="type" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#0f172a" strokeWidth={2.5} fillOpacity={1} fill="url(#focusColor)" name="Productivity Score (%)" />
                <Area type="monotone" dataKey="duration" stroke="#10b981" strokeWidth={1.5} fillOpacity={0} name="Duration (mins)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-6">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-md font-black text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-slate-800" />
                Executive Productivity Reports
              </h3>
              <p className="text-xs text-gray-500">Synthesize deep cognitive flow profiles and contextual efficiency records.</p>
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={() => setReportRange("Daily")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  reportRange === "Daily" ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Daily
              </button>
              <button 
                onClick={() => setReportRange("Weekly")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  reportRange === "Weekly" ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Weekly
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200/60 max-w-xl mx-auto text-center space-y-4">
            <Award className="w-12 h-12 text-slate-800 mx-auto animate-pulse" />
            <h4 className="text-sm font-black text-slate-900">
              Compile Custom FitVita {reportRange} Flow Profile
            </h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
              Consolidate distraction patterns, brain energy drains, focus times, and ambient tracks correlation logs to draft a thorough performance digest.
            </p>
            <button 
              onClick={() => {
                setShowReportModal(true);
                onAddXp(60);
              }}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs inline-block"
            >
              Generate {reportRange} Executive Report (+60 XP)
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Generated Report Modal Overlay */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  VERIFIED DEEP DYNAMICS LEDGER
                </span>
                <h4 className="text-md font-black text-slate-900 mt-1">
                  FitVita {reportRange} Flow & Cognitive Audit
                </h4>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-xs text-gray-400 hover:text-gray-900 font-extrabold uppercase"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-gray-700">
              {/* Profile Metrics Summary */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <span>Audit Parameter</span>
                  <span>Calculated Outcome</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <span>Cumulative Flow Time:</span>
                  <strong className="font-mono text-slate-900">{totalFocusMinutes} minutes</strong>
                </div>
                <div className="flex justify-between">
                  <span>Autonomic Resilience Score:</span>
                  <strong className="font-mono text-slate-900">{avgProductivityScore}% efficiency</strong>
                </div>
                <div className="flex justify-between">
                  <span>Context Switching Velocity:</span>
                  <strong className="font-mono text-slate-900">{distractionRate} interruptions/hr</strong>
                </div>
              </div>

              {/* MD Narrative Analysis */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  CLINICAL PERFORMANCE EVALUATION
                </span>
                <p>
                  Based on the biometric flow data tracked, the user's cognitive engagement curves are {avgProductivityScore >= 85 ? "highly optimal" : "sub-optimal with mild prefrontal load"}. The calculated <strong>context switching index</strong> reveals a distraction rate of {distractionRate} blocks per hour, which indicates {parseFloat(distractionRate) > 2 ? "significant cognitive fragmentation" : "superb executive attention gating"}.
                </p>
                <p>
                  Your brain energy curves indicate a healthy correlation with restorative breaks. Sustaining minor-7th ambient chord frequencies in the sound mixer serves as a robust neurological anchor, stabilizing your parasympathetic system. Keep your daily focus blocks bounded within 50 minutes to optimize neurotransmitter replenishment cycles.
                </p>
              </div>

              {/* Action plan */}
              <div className="border-t border-gray-100 pt-3 space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  PRESCRIBED BEHAVIORAL PROTOCOLS
                </span>
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-extrabold">✓</span>
                  <span>Transition from Pomodoro to <strong>50-min Deep Work</strong> blocks twice daily.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-extrabold">✓</span>
                  <span>Leverage a 50/50 mix of <strong>White Noise & Soft Rain</strong> to offset low-frequency environmental echoes.</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex gap-2">
              <button 
                onClick={() => {
                  alert("Report downloaded in secure PDF schema!");
                }}
                className="w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all"
              >
                Download PDF Ledger
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
