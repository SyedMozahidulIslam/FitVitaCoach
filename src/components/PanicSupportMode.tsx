import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, Wind, Zap, Volume2, VolumeX, Sparkles, RefreshCw, Eye, Check, 
  Activity, ShieldCheck, Heart, AlertCircle, Info, ArrowLeft, BrainCircuit
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PanicSupportModeProps {
  onClose: () => void;
  onAddXp: (amount: number) => void;
}

type PacingLevel = "rapid" | "standard" | "deep";
type BreathingPhase = "Inhale" | "Hold" | "Exhale" | "Hold Out" | "Completed";

export default function PanicSupportMode({ onClose, onAddXp }: PanicSupportModeProps) {
  // --- Configuration states ---
  const [pacingLevel, setPacingLevel] = useState<PacingLevel>("standard");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);

  // --- Engine States ---
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [phase, setPhase] = useState<BreathingPhase>("Inhale");
  const [secondsLeft, setSecondsLeft] = useState<number>(4);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [showHapticRipple, setShowHapticRipple] = useState<boolean>(false);
  const [hapticRippleKey, setHapticRippleKey] = useState<number>(0);

  // --- Grounding Tool States ---
  const [groundingStep, setGroundingStep] = useState<number>(0);
  const [groundingAnswers, setGroundingAnswers] = useState<string[]>(["", "", ""]);
  const [groundingCompleted, setGroundingCompleted] = useState<boolean>(false);

  // --- Web Audio Refs ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const primaryOscRef = useRef<OscillatorNode | null>(null);
  const secondaryOscRef = useRef<OscillatorNode | null>(null);
  const primaryGainRef = useRef<GainNode | null>(null);
  const secondaryGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Get phase duration in seconds based on pacing level
  const getPhaseDuration = (): number => {
    switch (pacingLevel) {
      case "rapid": return 3; // 3-3-3-3: for capturing rapid breathing
      case "standard": return 4; // 4-4-4-4: balanced
      case "deep": return 5; // 5-5-5-5: maximum vagal deceleration
    }
  };

  // Trigger haptic effect (real + simulated)
  const triggerHaptic = (type: "tick" | "transition") => {
    if (!hapticsEnabled) return;

    // Real device haptics
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      if (type === "transition") {
        navigator.vibrate([120, 60, 120]);
      } else {
        navigator.vibrate([25]);
      }
    }

    // Simulated haptics on-screen
    setHapticRippleKey(prev => prev + 1);
    setShowHapticRipple(true);
    setTimeout(() => {
      setShowHapticRipple(false);
    }, 600);
  };

  // --- Web Audio Synthesizer Initialization ---
  const initAudio = () => {
    if (typeof window === "undefined") return;
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const startSynthesizers = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    // Clean up existing nodes
    stopSynthesizers();

    // Create Master Gain node to prevent clipping and handle mute/unmute
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(soundEnabled ? 0.25 : 0, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Primary calming tone oscillator (smooth sine wave)
    const primOsc = ctx.createOscillator();
    const primGain = ctx.createGain();
    primOsc.type = "sine";
    primOsc.frequency.setValueAtTime(220, ctx.currentTime); // start at A3
    primGain.gain.setValueAtTime(0.08, ctx.currentTime);
    primOsc.connect(primGain);
    primGain.connect(masterGain);
    primOsc.start();
    primaryOscRef.current = primOsc;
    primaryGainRef.current = primGain;

    // Secondary oscillator for creating a comforting binaural beat
    const secOsc = ctx.createOscillator();
    const secGain = ctx.createGain();
    secOsc.type = "sine";
    secOsc.frequency.setValueAtTime(221, ctx.currentTime); // create binaural overlap
    secGain.gain.setValueAtTime(0, ctx.currentTime); // start silent, introduce in Hold phase
    secOsc.connect(secGain);
    secGain.connect(masterGain);
    secOsc.start();
    secondaryOscRef.current = secOsc;
    secondaryGainRef.current = secGain;
  };

  const stopSynthesizers = () => {
    try {
      if (primaryOscRef.current) {
        primaryOscRef.current.stop();
        primaryOscRef.current.disconnect();
        primaryOscRef.current = null;
      }
      if (secondaryOscRef.current) {
        secondaryOscRef.current.stop();
        secondaryOscRef.current.disconnect();
        secondaryOscRef.current = null;
      }
      if (primaryGainRef.current) {
        primaryGainRef.current.disconnect();
        primaryGainRef.current = null;
      }
      if (secondaryGainRef.current) {
        secondaryGainRef.current.disconnect();
        secondaryGainRef.current = null;
      }
      if (masterGainRef.current) {
        masterGainRef.current.disconnect();
        masterGainRef.current = null;
      }
    } catch (e) {
      console.warn("Audio synthesis cleanup warning:", e);
    }
  };

  // Modulate sound frequencies dynamically depending on current box-breathing phase
  const modulateAudioForPhase = (currentPhase: BreathingPhase, duration: number) => {
    if (!audioCtxRef.current || !soundEnabled || !primaryOscRef.current || !primaryGainRef.current) return;

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    // Reset scheduled parameters to transition smoothly
    primaryOscRef.current.frequency.cancelScheduledValues(now);
    primaryGainRef.current.gain.cancelScheduledValues(now);
    
    if (secondaryOscRef.current && secondaryGainRef.current) {
      secondaryOscRef.current.frequency.cancelScheduledValues(now);
      secondaryGainRef.current.gain.cancelScheduledValues(now);
    }

    switch (currentPhase) {
      case "Inhale":
        // Pitches rises slowly to guide inhalation
        primaryOscRef.current.frequency.setValueAtTime(220, now); // A3
        primaryOscRef.current.frequency.linearRampToValueAtTime(329.63, now + duration); // E4 (perfect fifth)
        
        primaryGainRef.current.gain.setValueAtTime(0.08, now);
        primaryGainRef.current.gain.linearRampToValueAtTime(0.12, now + duration);

        // Turn down binaural beat generator
        if (secondaryGainRef.current) {
          secondaryGainRef.current.gain.linearRampToValueAtTime(0.0, now + 0.3);
        }
        break;

      case "Hold":
        // Hold breath: stable high pitch combined with a 2Hz binaural beat (Alpha relaxation frequency)
        primaryOscRef.current.frequency.setValueAtTime(329.63, now);
        
        primaryGainRef.current.gain.setValueAtTime(0.12, now);
        primaryGainRef.current.gain.linearRampToValueAtTime(0.09, now + duration);

        if (secondaryOscRef.current && secondaryGainRef.current) {
          // Tune to E4 + 2Hz to establish delta/alpha entrainment
          secondaryOscRef.current.frequency.setValueAtTime(331.63, now);
          secondaryGainRef.current.gain.setValueAtTime(0, now);
          secondaryGainRef.current.gain.linearRampToValueAtTime(0.08, now + 0.5);
        }
        break;

      case "Exhale":
        // Pitches declines slowly to guide exhalation and release tension
        primaryOscRef.current.frequency.setValueAtTime(329.63, now);
        primaryOscRef.current.frequency.linearRampToValueAtTime(146.83, now + duration); // D3 (relaxing sub-tone)
        
        primaryGainRef.current.gain.setValueAtTime(0.1, now);
        primaryGainRef.current.gain.linearRampToValueAtTime(0.05, now + duration);

        // Stop binaural oscillator
        if (secondaryGainRef.current) {
          secondaryGainRef.current.gain.linearRampToValueAtTime(0.0, now + 0.4);
        }
        break;

      case "Hold Out":
        // Holding empty lungs: deep, ultra-calming ground sub-tone
        primaryOscRef.current.frequency.setValueAtTime(110.00, now); // A2 deep drone
        
        primaryGainRef.current.gain.setValueAtTime(0.06, now);
        primaryGainRef.current.gain.linearRampToValueAtTime(0.04, now + duration);

        if (secondaryOscRef.current && secondaryGainRef.current) {
          secondaryOscRef.current.frequency.setValueAtTime(112.00, now); // binaural sub-drone
          secondaryGainRef.current.gain.setValueAtTime(0, now);
          secondaryGainRef.current.gain.linearRampToValueAtTime(0.05, now + 0.5);
        }
        break;
    }
  };

  // Adjust volume dynamically when sound setting is changed
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        soundEnabled ? 0.25 : 0, 
        audioCtxRef.current.currentTime
      );
    }
  }, [soundEnabled]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      stopSynthesizers();
    };
  }, []);

  // --- Breathing Pacing Loop ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            // Trigger phase transition
            let nextPhase: BreathingPhase = "Inhale";
            const duration = getPhaseDuration();
            
            if (phase === "Inhale") {
              nextPhase = "Hold";
            } else if (phase === "Hold") {
              nextPhase = "Exhale";
            } else if (phase === "Exhale") {
              nextPhase = "Hold Out";
            } else if (phase === "Hold Out") {
              nextPhase = "Inhale";
              setCyclesCompleted(c => {
                const updated = c + 1;
                // Add XP rewards for completed cycles to support gamification
                onAddXp(15);
                return updated;
              });
            }

            setPhase(nextPhase);
            triggerHaptic("transition");
            modulateAudioForPhase(nextPhase, duration);
            return duration;
          } else {
            // Tick haptic gently
            triggerHaptic("tick");
            return prev - 1;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, phase, pacingLevel, hapticsEnabled]);

  const handleStart = () => {
    initAudio();
    setIsRunning(true);
    setPhase("Inhale");
    const duration = getPhaseDuration();
    setSecondsLeft(duration);
    startSynthesizers();
    modulateAudioForPhase("Inhale", duration);
    triggerHaptic("transition");
  };

  const handlePause = () => {
    setIsRunning(false);
    stopSynthesizers();
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase("Inhale");
    setSecondsLeft(getPhaseDuration());
    setCyclesCompleted(0);
    stopSynthesizers();
  };

  // Quick setup for specific emergency pacing
  const applyStressPreset = (preset: PacingLevel) => {
    setPacingLevel(preset);
    if (isRunning) {
      // Re-trigger with new pacing
      const currentPhase = phase;
      setPhase(currentPhase);
      const duration = preset === "rapid" ? 3 : preset === "standard" ? 4 : 5;
      setSecondsLeft(duration);
      modulateAudioForPhase(currentPhase, duration);
    } else {
      setSecondsLeft(preset === "rapid" ? 3 : preset === "standard" ? 4 : 5);
    }
    // Add micro haptic confirmation
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([60]);
    }
  };

  // --- Grounding Exercises Handler ---
  const handleAnswerSubmit = (value: string) => {
    const updated = [...groundingAnswers];
    updated[groundingStep] = value;
    setGroundingAnswers(updated);
    
    if (groundingStep < 2) {
      setGroundingStep(prev => prev + 1);
    } else {
      setGroundingCompleted(true);
      onAddXp(30);
    }
  };

  const resetGrounding = () => {
    setGroundingStep(0);
    setGroundingAnswers(["", "", ""]);
    setGroundingCompleted(false);
  };

  // Helper text describing the physiological benefit of current phase
  const getPhaseDescription = (): string => {
    switch (phase) {
      case "Inhale":
        return "Sip oxygen slowly. Expand your lower diaphragm, stretching abdominal nerve nets to activate parasympathetic pathways.";
      case "Hold":
        return "Lungs full. Maintain dynamic expansion. This pauses blood gas oscillations, soothing overactive amygdala spikes.";
      case "Exhale":
        return "Slow, deliberate sigh. Drop your shoulders completely. Expelling CO2 triggers cardiac slowing via the vagus nerve.";
      case "Hold Out":
        return "Lungs empty. Induce high-tolerance serenity. Deep autonomic recalibration triggers prefrontal control recovery.";
      default:
        return "Gaze at the geometric pacing guide and align your lung expansions.";
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 p-6 md:p-8 rounded-3xl border border-rose-900/60 shadow-2xl relative overflow-hidden max-w-4xl mx-auto my-4">
      {/* Absolute calming ambient glow spots in background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-950/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-rose-950/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header with escape route */}
      <div className="relative z-10 flex flex-wrap justify-between items-center gap-4 border-b border-rose-900/40 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-950/50 border border-rose-800/60 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold uppercase bg-rose-950 text-rose-400 border border-rose-900 px-2 py-0.5 rounded-full">
                Autonomous Emergency Protocol
              </span>
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded-full">
                <BrainCircuit className="w-2.5 h-2.5" /> Core Connected
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white mt-1">
              Stabilization Chamber & Panic Support
            </h2>
          </div>
        </div>

        <button 
          onClick={() => {
            stopSynthesizers();
            onClose();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Exit Panic Protocol
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Deep immersive breathing box animation & pacing */}
        <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-between space-y-6 relative overflow-hidden">
          
          {/* Simulated Haptic Feedback visualizer */}
          <AnimatePresence>
            {showHapticRipple && (
              <motion.div 
                key={hapticRippleKey}
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 1.6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 border-2 border-indigo-500/20 rounded-2xl pointer-events-none"
              />
            )}
          </AnimatePresence>

          <div className="w-full flex flex-wrap justify-between items-center gap-3">
            <div>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">PRECONSTRUCTED PACING preset</span>
              <div className="flex gap-1.5 mt-1">
                {(["rapid", "standard", "deep"] as const).map(preset => (
                  <button
                    key={preset}
                    onClick={() => applyStressPreset(preset)}
                    className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all ${
                      pacingLevel === preset
                        ? "bg-rose-500 text-slate-950 border-rose-500"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {preset === "rapid" ? "⚡ Hyperventilating (3s)" : preset === "standard" ? "⚖️ Standard (4s)" : "🧘 Deep Vagus (5s)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Config Toggles */}
            <div className="flex gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Mute audio synthesis" : "Unmute audio synthesis"}
                className={`p-2 rounded-lg border transition-all ${
                  soundEnabled ? "bg-indigo-950 text-indigo-400 border-indigo-900" : "bg-slate-950 text-slate-600 border-slate-800"
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setHapticsEnabled(!hapticsEnabled)}
                title={hapticsEnabled ? "Disable haptic indicators" : "Enable haptic indicators"}
                className={`p-2 rounded-lg border transition-all ${
                  hapticsEnabled ? "bg-teal-950 text-teal-400 border-teal-900" : "bg-slate-950 text-slate-600 border-slate-800"
                }`}
              >
                <Activity className={`w-4 h-4 ${hapticsEnabled && isRunning ? "animate-pulse text-teal-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Interactive Box Pacing Canvas */}
          <div className="relative w-64 h-64 my-4 flex items-center justify-center">
            
            {/* Box frame */}
            <div className="absolute inset-0 border-2 border-slate-800/80 rounded-3xl" />

            {/* Glowing borders of the active phase */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
              {isRunning && (
                <>
                  {phase === "Inhale" && (
                    <div className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full animate-[shimmer_1s_infinite]" style={{ width: `${(secondsLeft / getPhaseDuration()) * 100}%` }} />
                  )}
                  {phase === "Hold" && (
                    <div className="absolute top-0 right-0 w-1.5 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full" style={{ height: `${((getPhaseDuration() - secondsLeft) / getPhaseDuration()) * 100}%` }} />
                  )}
                  {phase === "Exhale" && (
                    <div className="absolute bottom-0 right-0 h-1.5 bg-gradient-to-l from-indigo-500 to-rose-500 rounded-full" style={{ width: `${((getPhaseDuration() - secondsLeft) / getPhaseDuration()) * 100}%` }} />
                  )}
                  {phase === "Hold Out" && (
                    <div className="absolute bottom-0 left-0 w-1.5 bg-gradient-to-t from-rose-500 to-emerald-500 rounded-full" style={{ height: `${(secondsLeft / getPhaseDuration()) * 100}%` }} />
                  )}
                </>
              )}
            </div>

            {/* Central breathing bubble with micro haptic simulation ring */}
            <motion.div 
              animate={
                isRunning
                  ? phase === "Inhale"
                    ? { scale: [1, 1.45], backgroundColor: "rgba(16, 185, 129, 0.15)", borderColor: "rgb(16, 185, 129)" }
                    : phase === "Hold"
                      ? { scale: 1.45, backgroundColor: "rgba(99, 102, 241, 0.18)", borderColor: "rgb(99, 102, 241)", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }
                      : phase === "Exhale"
                        ? { scale: [1.45, 1], backgroundColor: "rgba(239, 68, 68, 0.15)", borderColor: "rgb(239, 68, 68)" }
                        : { scale: 1, backgroundColor: "rgba(245, 158, 11, 0.08)", borderColor: "rgb(245, 158, 11)" }
                  : { scale: 1, backgroundColor: "rgba(148, 163, 184, 0.05)", borderColor: "rgb(148, 163, 184)" }
              }
              transition={{ 
                duration: isRunning ? secondsLeft : 0.8,
                ease: "linear"
              }}
              className="w-36 h-36 rounded-full border-2 flex flex-col items-center justify-center relative shadow-lg"
            >
              {/* Dynamic text details */}
              <AnimatePresence mode="wait">
                <motion.span 
                  key={phase}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-center"
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    {isRunning ? phase : "Ready"}
                  </span>
                  <span className="text-3xl font-mono font-black text-white block mt-1">
                    {isRunning ? `${secondsLeft}s` : "0:00"}
                  </span>
                </motion.span>
              </AnimatePresence>

              {/* Rhythmic beat pulses emitting behind center */}
              {isRunning && (
                <div className="absolute inset-0 rounded-full border border-white/5 animate-[ping_2s_infinite]" />
              )}
            </motion.div>
          </div>

          <p className="text-xs text-slate-400 text-center font-medium leading-relaxed max-w-sm">
            {getPhaseDescription()}
          </p>

          {/* Controls bar */}
          <div className="w-full flex justify-center gap-3 pt-3">
            {!isRunning ? (
              <button 
                onClick={handleStart}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-950/40"
              >
                Initiate Guided Loop
              </button>
            ) : (
              <button 
                onClick={handlePause}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Hold Calibration
              </button>
            )}

            <button 
              onClick={handleReset}
              className="px-4 py-3 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition-all text-xs font-bold"
            >
              Reset Pace
            </button>
          </div>

          {cyclesCompleted > 0 && (
            <div className="flex items-center gap-2 mt-2 bg-emerald-950/30 px-3.5 py-1.5 rounded-full border border-emerald-900/40">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-300">
                Resilience Calibrated: <strong className="text-white font-mono">{cyclesCompleted}</strong> complete cycles (+{cyclesCompleted * 15} XP)
              </span>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Redirection Anchor Exercises & Sympathetic Calming Guide */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Somatic / Cognitive Redirection Tool */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Somatic Grounding Shield
                </h3>
                <p className="text-[9px] text-slate-500">Cognitive redirection to intercept panic cascades</p>
              </div>

              <button 
                onClick={resetGrounding}
                title="Restart redirection"
                className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white border border-slate-800 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {!groundingCompleted ? (
              <div className="space-y-4">
                {/* Steps indicators */}
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div 
                      key={i} 
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        i === groundingStep 
                          ? "bg-indigo-500" 
                          : i < groundingStep 
                            ? "bg-emerald-500" 
                            : "bg-slate-800"
                      }`} 
                    />
                  ))}
                </div>

                <div className="space-y-3">
                  {groundingStep === 0 && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">STEP 1: VISUAL TARGETING</span>
                      <p className="text-xs font-semibold text-slate-300 leading-relaxed">
                        Identify and name <strong className="text-white">three blue items</strong> in your immediate surrounding. Typing them anchors semantic circuits.
                      </p>
                      
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="List them here..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
                              handleAnswerSubmit(e.currentTarget.value);
                            }
                          }}
                          className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none"
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousSibling as HTMLInputElement;
                            if (input && input.value.trim() !== "") {
                              handleAnswerSubmit(input.value);
                            }
                          }}
                          className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
                        >
                          Anchor
                        </button>
                      </div>
                    </div>
                  )}

                  {groundingStep === 1 && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">STEP 2: SOMATOSENSORY ACCENT</span>
                      <p className="text-xs font-semibold text-slate-300 leading-relaxed">
                        Press your palms together firmly. Focus entirely on the <strong className="text-white">thermal heat & tension</strong>. Describe the sensation.
                      </p>

                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Warm, tight, smooth, throbbing..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
                              handleAnswerSubmit(e.currentTarget.value);
                            }
                          }}
                          className="flex-1 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none"
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousSibling as HTMLInputElement;
                            if (input && input.value.trim() !== "") {
                              handleAnswerSubmit(input.value);
                            }
                          }}
                          className="px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all"
                        >
                          Anchor
                        </button>
                      </div>
                    </div>
                  )}

                  {groundingStep === 2 && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">STEP 3: ACOUSTIC RESIDUALS</span>
                      <p className="text-xs font-semibold text-slate-300 leading-relaxed">
                        Identify the <strong className="text-white">quietest, most distant sound</strong> you can perceive. Describing it triggers focused auditive gating.
                      </p>

                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Humming AC, distant car, leaf rustle..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
                              handleAnswerSubmit(e.currentTarget.value);
                            }
                          }}
                          className="flex-1 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none"
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousSibling as HTMLInputElement;
                            if (input && input.value.trim() !== "") {
                              handleAnswerSubmit(input.value);
                            }
                          }}
                          className="px-3 bg-rose-600 hover:bg-rose-500 text-slate-950 rounded-xl text-xs font-black transition-all"
                        >
                          Anchor
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-black text-white">Prefrontal Focus Recaptured!</h4>
                <p className="text-[11px] text-emerald-300 leading-relaxed font-semibold">
                  You successfully re-anchored your attention circuits. Adrenaline levels are cooling. (+30 XP)
                </p>
                
                <div className="text-left bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[10px] text-slate-400 space-y-1">
                  <div><strong>Visual:</strong> {groundingAnswers[0]}</div>
                  <div><strong>Tactile:</strong> {groundingAnswers[1]}</div>
                  <div><strong>Acoustic:</strong> {groundingAnswers[2]}</div>
                </div>
              </div>
            )}
          </div>

          {/* Autonomic Science Reminders */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-3.5">
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-400" />
              Somatic Stabilization Checklist
            </h4>

            <div className="space-y-3">
              {[
                { title: "Release Jaw Posture", text: "Part your lips. Drop your tongue away from the roof of your mouth to release deep trigeminal tension." },
                { title: "Lower Shoulder Blades", text: "Pull your shoulders back, then sink them fully. Relax the auxiliary respiratory musculature." },
                { title: "Simulated Horizon Gaze", text: "Keep your head stationary. Let your eyes move smoothly from left to right along a horizontal line to disrupt anxiety loops." }
              ].map((item, index) => (
                <div key={index} className="flex gap-3 text-xs leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-mono shrink-0 font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <strong className="text-slate-200 block font-bold">{item.title}</strong>
                    <span className="text-[11px] text-slate-400 font-medium">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
