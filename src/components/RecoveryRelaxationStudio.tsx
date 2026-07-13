import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, Wind, ShieldAlert, Award, Compass, Sparkles, Sliders, Music, 
  Play, Square, Volume2, RefreshCw, Layers, Zap, Clock, ChevronRight, 
  Sun, Moon, Shield, VolumeX, Eye, Flame, CheckCircle, HelpCircle
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, PieChart, Pie, Cell
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import PanicSupportMode from "./PanicSupportMode";

interface RecoveryRelaxationStudioProps {
  onAddXp: (amount: number) => void;
  sleepLogs?: any[];
}

export default function RecoveryRelaxationStudio({ onAddXp, sleepLogs = [] }: RecoveryRelaxationStudioProps) {
  // --- Breathing Engine States ---
  const [breathingProgram, setBreathingProgram] = useState<"Box" | "4-7-8" | "Coherent">("Box");
  const [breathActive, setBreathActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Hold Out" | "Ready">("Ready");
  const [secondsLeftInPhase, setSecondsLeftInPhase] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  // --- Session Timers (Power Nap / PMR / Stretching) ---
  const [napActive, setNapActive] = useState<boolean>(false);
  const [napSecondsLeft, setNapSecondsLeft] = useState<number>(20 * 60); // 20m power nap

  // --- Stretch Session States ---
  const [activeStretchIdx, setActiveStretchIdx] = useState<number>(0);
  const [stretchSecondsLeft, setStretchSecondsLeft] = useState<number>(30);
  const [stretchTimerRunning, setStretchTimerRunning] = useState<boolean>(false);

  // --- Acute Panic / Anxiety Support State ---
  const [panicModeActive, setPanicModeActive] = useState<boolean>(false);
  const [panicPulseRate, setPanicPulseRate] = useState<number>(6); // slow paced 6s inhalation/exhalation

  // --- Audio Synth Node Refs for Ocean / Crickets ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<Record<string, { source: AudioNode; gainNode: GainNode }>>({});
  const [volumes, setVolumes] = useState<Record<string, number>>({
    ocean: 0,
    crickets: 0,
    ambientPad: 0
  });

  // --- Evening Wind-Down Checklist ---
  const [windDownSteps, setWindDownSteps] = useState<Record<string, boolean>>({
    dimLights: false,
    noScreen: false,
    herbalTea: false,
    stretch: false,
    gratitudeLog: false
  });

  // --- Tabs selection inside Recovery Studio ---
  const [activeTab, setActiveTab] = useState<"breathing" | "relaxation" | "winddown">("breathing");

  // --- Sound Synthesizers Engine ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const startSynth = (type: string) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    if (synthNodesRef.current[type]) {
      try {
        synthNodesRef.current[type].source.disconnect();
      } catch (e) {}
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volumes[type] / 100, ctx.currentTime);
    gainNode.connect(ctx.destination);

    let sourceNode: AudioNode;

    if (type === "ocean") {
      // Ocean wave simulator: modulated low frequency pink-ish noise on lowpass filter
      const bufferSize = 4 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      noiseSource.start();

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(350, ctx.currentTime);

      // Waves oscillation sweep (LFO)
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(0.08, ctx.currentTime); // slow wave sweep (12s sweep)
      
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(250, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(lowpass.frequency);
      osc.start();

      noiseSource.connect(lowpass);
      lowpass.connect(gainNode);
      sourceNode = noiseSource;

    } else if (type === "crickets") {
      // Crickets night-scape: periodic high-frequency chirps
      const controllerNode = ctx.createGain();
      controllerNode.connect(gainNode);

      const triggerChirp = () => {
        if (!synthNodesRef.current["crickets"]) return;
        const now = ctx.currentTime;
        // Fast repeating envelope
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const chirpGain = ctx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(3800 + Math.random() * 200, now + i * 0.08);

          chirpGain.gain.setValueAtTime(0, now + i * 0.08);
          chirpGain.gain.linearRampToValueAtTime(0.03, now + i * 0.08 + 0.01);
          chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.05);

          osc.connect(chirpGain);
          chirpGain.connect(controllerNode);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.06);
        }
      };

      triggerChirp();
      const intervalId = setInterval(triggerChirp, 2400);

      const dummySource = {
        disconnect: () => {
          clearInterval(intervalId);
          controllerNode.disconnect();
        }
      } as any;

      sourceNode = dummySource;

    } else { // ambientPad
      // Soothing warm low-frequency synthetic drone chord
      const freqs = [110.00, 165.00, 220.00, 275.00]; // A2, E3, A3, C#4
      const controllerNode = ctx.createGain();
      controllerNode.connect(gainNode);

      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        noteGain.gain.setValueAtTime(0.05, ctx.currentTime);
        
        // Soft volume modulation LFO
        const modOsc = ctx.createOscillator();
        const modGain = ctx.createGain();
        modOsc.type = "sine";
        modOsc.frequency.setValueAtTime(0.1, ctx.currentTime);
        modGain.gain.setValueAtTime(0.02, ctx.currentTime);

        modOsc.connect(modGain);
        modGain.connect(noteGain.gain);
        modOsc.start();

        osc.connect(noteGain);
        noteGain.connect(controllerNode);
        osc.start();
      });

      const dummySource = {
        disconnect: () => {
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
      if (val > 0 && prev[type] === 0) {
        startSynth(type);
      } else if (val === 0 && prev[type] > 0) {
        if (synthNodesRef.current[type]) {
          try {
            synthNodesRef.current[type].source.disconnect();
            delete synthNodesRef.current[type];
          } catch (e) {}
        }
      } else if (synthNodesRef.current[type]) {
        synthNodesRef.current[type].gainNode.gain.setValueAtTime(val / 100, audioCtxRef.current!.currentTime);
      }
      return updated;
    });
  };

  const handleMuteAll = () => {
    Object.keys(synthNodesRef.current).forEach(type => {
      try {
        synthNodesRef.current[type].source.disconnect();
      } catch (e) {}
    });
    synthNodesRef.current = {};
    setVolumes({ ocean: 0, crickets: 0, ambientPad: 0 });
  };

  useEffect(() => {
    return () => {
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

  // --- Guided Breathing Pacing Engine ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathActive) {
      interval = setInterval(() => {
        setSecondsLeftInPhase(prev => {
          if (prev <= 1) {
            handleBreathingPhaseTransition();
            return 4; // temporary, resolved in transition handler
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathActive, breathPhase, breathingProgram]);

  const startBreathing = () => {
    initAudio();
    setBreathActive(true);
    setBreathPhase("Inhale");
    let initialSecs = 4;
    if (breathingProgram === "4-7-8") initialSecs = 4;
    if (breathingProgram === "Coherent") initialSecs = 5;
    setSecondsLeftInPhase(initialSecs);
    setCompletedCycles(0);
  };

  const stopBreathing = () => {
    setBreathActive(false);
    setBreathPhase("Ready");
    setSecondsLeftInPhase(4);
  };

  const handleBreathingPhaseTransition = () => {
    if (breathingProgram === "Box") {
      // Box: Inhale(4s) -> Hold(4s) -> Exhale(4s) -> Hold Out(4s)
      if (breathPhase === "Inhale") {
        setBreathPhase("Hold");
        setSecondsLeftInPhase(4);
      } else if (breathPhase === "Hold") {
        setBreathPhase("Exhale");
        setSecondsLeftInPhase(4);
      } else if (breathPhase === "Exhale") {
        setBreathPhase("Hold Out");
        setSecondsLeftInPhase(4);
      } else {
        setBreathPhase("Inhale");
        setSecondsLeftInPhase(4);
        setCompletedCycles(c => c + 1);
        onAddXp(12);
      }
    } else if (breathingProgram === "4-7-8") {
      // 4-7-8: Inhale(4s) -> Hold(7s) -> Exhale(8s)
      if (breathPhase === "Inhale") {
        setBreathPhase("Hold");
        setSecondsLeftInPhase(7);
      } else if (breathPhase === "Hold") {
        setBreathPhase("Exhale");
        setSecondsLeftInPhase(8);
      } else {
        setBreathPhase("Inhale");
        setSecondsLeftInPhase(4);
        setCompletedCycles(c => c + 1);
        onAddXp(18);
      }
    } else { // Coherent
      // Coherent: Inhale(5s) -> Exhale(5s)
      if (breathPhase === "Inhale") {
        setBreathPhase("Exhale");
        setSecondsLeftInPhase(5);
      } else {
        setBreathPhase("Inhale");
        setSecondsLeftInPhase(5);
        setCompletedCycles(c => c + 1);
        onAddXp(10);
      }
    }
  };

  // --- Stretching Timer Engine ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stretchTimerRunning) {
      interval = setInterval(() => {
        setStretchSecondsLeft(prev => {
          if (prev <= 1) {
            handleStretchMoveComplete();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stretchTimerRunning, activeStretchIdx]);

  const stretchingDatabase = [
    { name: "Cervical Neck Release", instruction: "Gently tilt right ear to right shoulder. Anchor opposite hand. Hold for 30s, breathe slow." },
    { name: "Spinal Decompression Twist", desc: "Twist spine sitting down. Look over shoulder, lengthen thoracic joints.", instruction: "Decompress thoracic joints to lower sympathetic trigger signals. Hold and repeat opposite side." },
    { name: "Chest & Anterior Shoulder Opening", instruction: "Clasp hands behind back, extend shoulder blades back. Expand chest to stimulate vagus nerve bundles." },
    { name: "Somatic Hip Opener", instruction: "Cross ankle over opposite knee sitting down. Lean forward softly to release deep gluteal stress holds." }
  ];

  const handleStretchMoveComplete = () => {
    onAddXp(20);
    alert(`🧘 completed Stretch: ${stretchingDatabase[activeStretchIdx].name}! Earned +20 XP.`);
    if (activeStretchIdx < stretchingDatabase.length - 1) {
      setActiveStretchIdx(idx => idx + 1);
      setStretchSecondsLeft(30);
    } else {
      setStretchTimerRunning(false);
      alert("🎉 Entire stretching program finished successfully! Cognitive body-state recalibrated.");
    }
  };

  // --- Power Nap Timer tick ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (napActive) {
      interval = setInterval(() => {
        setNapSecondsLeft(prev => {
          if (prev <= 1) {
            handleNapComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [napActive]);

  const handleNapComplete = () => {
    setNapActive(false);
    onAddXp(80);
    alert("🔔 Power Nap completed! Soothing chimes sounding. Open eyes slowly, drink 200ml water to reset blood pressure. Earned +80 XP!");
    setNapSecondsLeft(20 * 60);
  };

  // --- Dynamic Recovery Score calculation ---
  const recoveryCalculatedScore = (() => {
    let score = 70;
    // Sleep logs boost
    if (sleepLogs.length > 0) {
      const avgSleep = sleepLogs.slice(0, 3).reduce((sum, s) => sum + s.hoursSlept, 0) / Math.min(3, sleepLogs.length);
      if (avgSleep >= 7.5) score += 15;
      else if (avgSleep >= 6.5) score += 8;
      else score -= 10;
    }
    // Wind down checklist boosts
    const checkedSteps = Object.values(windDownSteps).filter(v => v).length;
    score += checkedSteps * 4;

    return Math.min(100, Math.max(30, score));
  })();

  const recoveryDescription = () => {
    if (recoveryCalculatedScore >= 85) return "Excellent autonomic reserve. Body is fully restored for intense cognitive output.";
    if (recoveryCalculatedScore >= 60) return "Moderate restorative status. Light cardiovascular activity and Box breathing advised.";
    return "Slight exhaustion state. Schedule pruning and deep muscle relaxation highly prioritized.";
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- PMR Guide Steps ---
  const pmrSteps = [
    { part: "Lower Facial Muscles", instructions: "Squeeze eyes shut, furrow eyebrows tightly for 5 seconds. Exhale and completely melt facial posture." },
    { part: "Shoulders and Cervical trapezius", instructions: "Shrug shoulders high to your ears, hold tightly. Release and feel warm gravity drag tension away." },
    { part: "Fists and Forearms", instructions: "Clench both fists, squeeze forearms tightly. Release and spread fingers wide to release deep cellular stress." }
  ];

  if (panicModeActive) {
    return (
      <PanicSupportMode 
        onClose={() => setPanicModeActive(false)} 
        onAddXp={onAddXp} 
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Mini Tabs menu */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-gray-200">
        <button 
          onClick={() => setActiveTab("breathing")}
          className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
            activeTab === "breathing" ? "bg-slate-900 text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          🌬️ breathing programs
        </button>
        <button 
          onClick={() => setActiveTab("relaxation")}
          className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
            activeTab === "relaxation" ? "bg-slate-900 text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          🧘 recovery studio
        </button>
        <button 
          onClick={() => setActiveTab("winddown")}
          className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
            activeTab === "winddown" ? "bg-slate-900 text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          🌙 Evening Wind-down
        </button>
      </div>

      {activeTab === "breathing" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Breathing Pacer Bubble */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between space-y-6 relative overflow-hidden">
            
            {/* Panic Mode Emergency Trigger */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400">PACED AUTONOMIC GAUGE</span>
                <div className="flex items-center gap-2 mt-1">
                  <Wind className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-md font-black text-slate-900">Parasympathetic Resonator</h3>
                </div>
              </div>

              <button 
                onClick={() => {
                  setPanicModeActive(!panicModeActive);
                  stopBreathing();
                  onAddXp(50);
                }}
                className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg border transition-all ${
                  panicModeActive 
                    ? "bg-rose-600 text-white border-rose-600 animate-pulse" 
                    : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                }`}
              >
                🚨 PANIC SUPPORT (Vagal Reset)
              </button>
            </div>

            {panicModeActive ? (
              // Acute Panic Support emergency breathing screen
              <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center">
                <span className="text-xs font-black text-rose-600 uppercase bg-rose-50 border border-rose-100 px-3 py-1 rounded-full animate-pulse">
                  Panic Protocol Initialized
                </span>
                
                <motion.div 
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="w-40 h-40 bg-rose-500/15 border-2 border-rose-500 rounded-full flex flex-col items-center justify-center relative shadow-lg shadow-rose-200"
                >
                  <Wind className="w-12 h-12 text-rose-600 animate-pulse" />
                  <span className="text-[10px] font-black text-rose-800 uppercase tracking-widest mt-2">Breathe Slow</span>
                </motion.div>

                <p className="text-xs text-slate-600 max-w-sm leading-relaxed font-semibold">
                  Gaze at the bubble. Inhale as it expands, exhale as it contracts. A slow 6-second pacing cycle triggers the carotid sinus, suppressing acute adrenaline discharges.
                </p>
              </div>
            ) : (
              // Regular breathing program screen
              <div className="py-6 flex flex-col items-center justify-center space-y-6">
                
                <div className="flex gap-2 mb-4 bg-slate-50 p-1 rounded-xl border border-gray-100">
                  {(["Box", "4-7-8", "Coherent"] as const).map(prog => (
                    <button
                      key={prog}
                      disabled={breathActive}
                      onClick={() => setBreathingProgram(prog)}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                        breathingProgram === prog 
                          ? "bg-slate-900 text-white" 
                          : "bg-transparent text-gray-500 hover:text-slate-900 disabled:opacity-40"
                      }`}
                    >
                      {prog === "Box" ? "📦 Box (4-4-4-4)" : prog === "4-7-8" ? "🌙 4-7-8 Sleep" : "🌊 Coherent (5-5)"}
                    </button>
                  ))}
                </div>

                <motion.div 
                  animate={
                    breathActive && (breathPhase === "Inhale" || breathPhase === "Hold")
                      ? { scale: 1.35, backgroundColor: "#e0e7ff" }
                      : { scale: 1.0, backgroundColor: "#f1f5f9" }
                  }
                  transition={{ duration: secondsLeftInPhase, ease: "easeInOut" }}
                  className="w-44 h-44 rounded-full flex flex-col items-center justify-center relative border-4 border-slate-900 shadow-md"
                >
                  <span className="text-2xl font-mono font-black text-slate-900">{secondsLeftInPhase}s</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 mt-1">
                    {breathPhase}
                  </span>
                </motion.div>

                <div className="flex gap-3">
                  {!breathActive ? (
                    <button 
                      onClick={startBreathing}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Begin Breathing Block
                    </button>
                  ) : (
                    <button 
                      onClick={stopBreathing}
                      className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Stop Breathing Cycle
                    </button>
                  )}
                </div>

                {breathActive && (
                  <span className="text-[11px] font-bold text-gray-500 mt-2">
                    Cycles Completed: <strong className="text-slate-900 font-mono">{completedCycles}</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Calming Soundscapes Studio column */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-slate-800" />
                Calm Music & Soundscapes
              </h4>
              <p className="text-[10px] text-gray-500">Synthesize customized calming audio frequencies</p>
            </div>

            <div className="space-y-4">
              {[
                { key: "ocean", name: "Rhythmic Ocean Wash", desc: "Triangle modulated white noise waves" },
                { key: "crickets", name: "Crickets Nightscape", desc: "Soothing episodic high-frequency chirp loop" },
                { key: "ambientPad", name: "Warm Solfeggio Pad", desc: "432Hz harmonic major resonance" }
              ].map(track => (
                <div key={track.key} className="bg-slate-50 p-3.5 rounded-2xl border border-gray-200/60 flex flex-col justify-between space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-black text-slate-800 block">{track.name}</span>
                      <span className="text-[9px] text-gray-400 leading-tight block">{track.desc}</span>
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
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
                    />
                  </div>
                </div>
              ))}

              <button 
                onClick={handleMuteAll}
                className="w-full text-center py-2 text-[10px] font-black text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all uppercase tracking-wider"
              >
                Mute All Soundscapes
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "relaxation" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Stretching Studio */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full w-fit block">
                SOMATIC BODY REINTEGRATION
              </span>
              <h4 className="text-md font-black text-slate-900 flex items-center gap-1.5">
                Gentle Stretching & Recalibration
              </h4>
              <p className="text-xs text-gray-500">
                Unlock muscular knots stored during stressful prefrontal calculations and sitting.
              </p>

              {/* Stretching Carousel Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200/60 space-y-3 mt-4">
                <div className="flex justify-between items-center text-xs border-b border-gray-200 pb-2">
                  <span className="font-black text-slate-900">Move {activeStretchIdx + 1} of {stretchingDatabase.length}</span>
                  <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">
                    {formatSeconds(stretchSecondsLeft)}
                  </span>
                </div>

                <div className="space-y-1">
                  <h5 className="text-xs font-black text-slate-900">{stretchingDatabase[activeStretchIdx].name}</h5>
                  <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                    {stretchingDatabase[activeStretchIdx].instruction}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              {!stretchTimerRunning ? (
                <button 
                  onClick={() => {
                    initAudio();
                    setStretchTimerRunning(true);
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all w-full"
                >
                  Start Stretch Timer
                </button>
              ) : (
                <button 
                  onClick={() => setStretchTimerRunning(false)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all w-full animate-pulse"
                >
                  Pause Stretch Timer
                </button>
              )}

              <button 
                onClick={() => {
                  setActiveStretchIdx(idx => (idx + 1) % stretchingDatabase.length);
                  setStretchSecondsLeft(30);
                }}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
              >
                Skip
              </button>
            </div>
          </div>

          {/* PMR / Power Nap / Stress Recovery */}
          <div className="space-y-6">
            
            {/* PMR guide */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
              <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full w-fit block">
                PMR SYSTEMATIC REHAB
              </span>
              <h4 className="text-sm font-black text-slate-900">Progressive Muscle Relaxation</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Step-by-step systemic muscle contraction to trigger blood pressure drops and deep vagal cooling.
              </p>

              <div className="space-y-2 mt-2">
                {pmrSteps.map((step, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-xl border border-gray-100 text-[11px] leading-relaxed">
                    <strong className="text-indigo-900 block font-bold mb-0.5">{step.part}</strong>
                    <span className="text-gray-600 font-medium">{step.instructions}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Power Nap widget */}
            <div className="bg-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black uppercase text-emerald-400">Power Nap Pacer</span>
                <h4 className="text-md font-black text-white mt-0.5">20-Min Neuro-Restore Nap</h4>
                <p className="text-[10px] text-slate-400 mt-1">Recharge prefrontal glucose reserves.</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-sm tracking-wide">{formatSeconds(napSecondsLeft)}</span>
                {!napActive ? (
                  <button 
                    onClick={() => {
                      initAudio();
                      setNapActive(true);
                      onAddXp(20);
                    }}
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setNapActive(false);
                      setNapSecondsLeft(20 * 60);
                    }}
                    className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "winddown" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Wind down Checklist */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h4 className="text-sm font-black text-slate-900 border-b border-gray-100 pb-3 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-500" />
              Evening Wind-Down Routine Checklist
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Establishing a regular pre-sleep routine tells your pineal gland to synthesize melatonin naturally, optimizing sleep quality.
            </p>

            <div className="space-y-3.5 mt-2">
              {[
                { key: "dimLights", label: "Dim overhead lights to warm yellow (Sunset simulation)", score: 10 },
                { key: "noScreen", label: "Abstain from electronic devices / screens (No blue light)", score: 15 },
                { key: "herbalTea", label: "Sip soothing chamomile, lavender, or hot water", score: 10 },
                { key: "stretch", label: "Perform somatic spinal twist stretches (Cervical opening)", score: 10 },
                { key: "gratitudeLog", label: "Log gratitude elements in your personal memory ledger", score: 15 }
              ].map(step => (
                <button
                  key={step.key}
                  onClick={() => {
                    const nextVal = !windDownSteps[step.key];
                    setWindDownSteps(prev => ({ ...prev, [step.key]: nextVal }));
                    if (nextVal) {
                      onAddXp(step.score);
                      alert(`✓ Checked Evening Wind-down Target! Earned +${step.score} XP.`);
                    }
                  }}
                  className="w-full text-left flex items-start gap-3 p-3 bg-slate-50 border border-gray-200/60 rounded-xl hover:bg-slate-100 transition-all text-xs font-bold text-slate-800"
                >
                  <div className={`w-4 h-4 rounded-md border mt-0.5 flex items-center justify-center shrink-0 ${
                    windDownSteps[step.key] ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"
                  }`}>
                    {windDownSteps[step.key] && "✓"}
                  </div>
                  <span>{step.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Autonomic Recovery Index Score card */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-indigo-900 shadow-xl flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">
                    AUTONOMIC BIO-METRIC DECAY METER
                  </span>
                  <h3 className="text-md font-black text-white mt-1.5 flex items-center gap-1.5">
                    <Shield className="w-5 h-5 text-indigo-400" />
                    Calculated Autonomic Recovery Index
                  </h3>
                </div>

                <span className="text-xl font-mono font-black text-indigo-300 bg-indigo-900/40 px-2.5 py-1 rounded-xl">
                  {recoveryCalculatedScore}%
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {recoveryDescription()}
              </p>

              <div className="w-full h-1.5 bg-indigo-900/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-400 rounded-full transition-all duration-500" 
                  style={{ width: `${recoveryCalculatedScore}%` }}
                />
              </div>
            </div>

            <div className="border-t border-indigo-900/80 pt-4 space-y-2">
              <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">
                COGNITIVE SLEEP CORRELATION
              </span>
              <div className="text-xs text-slate-400 leading-relaxed">
                {sleepLogs.length > 0 ? (
                  <span>Your last sleep record: <strong className="text-white font-mono">{sleepLogs[0].hoursSlept} hrs</strong> with a quality score of <strong className="text-white font-mono">{sleepLogs[0].qualityScore}%</strong>. Establishing pre-sleep stretching and sunset triggers will boost deep sleep cycles.</span>
                ) : (
                  <span>No sleep logs recorded in this session. Log sleep durations inside the FitVita Sleep Centre to calibrate recovery scores automatically.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
