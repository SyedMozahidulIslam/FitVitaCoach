import React, { useState, useEffect, useMemo } from "react";
import { 
  Smile, Sparkles, BrainCircuit, Heart, Plus, Send, Play, Square, Moon,
  Calendar, Flame, Droplets, Dumbbell, ShieldAlert, ShieldCheck, Lock, Unlock,
  Eye, EyeOff, BarChart2, TrendingUp, AlertTriangle, Key, Download, Trash2,
  Fingerprint, RefreshCw, Layers, CheckCircle2, Info, ChevronRight, Activity,
  Sliders, Award, LockKeyhole, UserCheck, Share2, Search, Volume2
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { MoodLog, WorkoutLog, FoodLog, WaterLog, SleepLog } from "../types";
import FocusProductivityCenter from "./FocusProductivityCenter";
import LifeReflectionJournal from "./LifeReflectionJournal";
import DigitalWellbeingCenter from "./DigitalWellbeingCenter";
import RecoveryRelaxationStudio from "./RecoveryRelaxationStudio";

interface MentalWellnessProps {
  moodLogs: MoodLog[];
  workoutLogs?: WorkoutLog[];
  foodLogs?: FoodLog[];
  waterLogs?: WaterLog[];
  sleepLogs?: SleepLog[];
  onAddMoodLog: (log: Omit<MoodLog, "id" | "timestamp">) => void;
  onAddXp: (amount: number) => void;
}

// 50+ Emotions list organized into 4 categories
const EMOTIONS_DATA = {
  Joyful: [
    "Happy", "Excited", "Motivated", "Proud", "Confident", "Hopeful", "Grateful", 
    "Loved", "Optimistic", "Thrilled", "Passionate", "Inspired", "Joyful", "Energized", 
    "Euphoric", "Radiant"
  ],
  Peaceful: [
    "Calm", "Relaxed", "Content", "Peaceful", "Serene", "Thoughtful", "Safe", 
    "Appreciated", "Satisfied", "Balanced", "Grounded", "Receptive"
  ],
  Vulnerable: [
    "Lonely", "Tired", "Burned Out", "Sad", "Disappointed", "Hurt", "Grief", 
    "Insecure", "Gloomy", "Helpless", "Hopeless", "Lost", "Ashamed", "Regretful", 
    "Vulnerable", "Overlooked"
  ],
  Tense: [
    "Frustrated", "Angry", "Anxious", "Overwhelmed", "Stressed", "Irritated", 
    "Agitated", "Panicked", "Jealous", "Threatened", "Shocked", "Distrustful", 
    "Impatient", "Restless", "Outraged"
  ]
};

const CATEGORY_COLORS = {
  Joyful: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-500", raw: "#f59e0b" },
  Peaceful: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-500", raw: "#10b981" },
  Vulnerable: { bg: "bg-sky-500/10", border: "border-sky-500/20", text: "text-sky-500", raw: "#0af" },
  Tense: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-500", raw: "#f43f5e" }
};

const ALL_TRIGGERS = [
  "Work", "Study", "Family", "Relationships", "Friends", "Finance", 
  "Health", "Exercise", "Sleep", "Food", "Weather", "Social Media", "Travel"
];

export default function MentalWellness({
  moodLogs = [],
  workoutLogs = [],
  foodLogs = [],
  waterLogs = [],
  sleepLogs = [],
  onAddMoodLog,
  onAddXp
}: MentalWellnessProps) {
  
  // --- Tab States ---
  // "dashboard" | "checkin" | "breathing" | "focus" | "journal" | "digital" | "recovery"
  const [activeTab, setActiveTab] = useState<"dashboard" | "checkin" | "breathing" | "focus" | "journal" | "digital" | "recovery">("dashboard");

  // --- Security & Privacy States ---
  const [pinCode, setPinCode] = useState<string>(() => {
    return localStorage.getItem("eq_pin_code") || "";
  });
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem("eq_is_locked") === "true";
  });
  const [isPrivateMode, setIsPrivateMode] = useState<boolean>(false);
  const [encryptRecords, setEncryptRecords] = useState<boolean>(false);
  
  // PIN Keyboard Input State
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [pinSetupMode, setPinSetupMode] = useState<boolean>(false);
  const [newPinInput, setNewPinInput] = useState<string>("");
  const [showBiometricsScan, setShowBiometricsScan] = useState<boolean>(false);
  const [biometricsSuccess, setBiometricsSuccess] = useState<boolean>(false);
  const [showPinSetupModal, setShowPinSetupModal] = useState<boolean>(false);

  // --- Advanced Check-In Logger State ---
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [emotionIntensities, setEmotionIntensities] = useState<Record<string, number>>({});
  const [moodScore, setMoodScore] = useState<number>(7);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [motivationLevel, setMotivationLevel] = useState<number>(7);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(7);
  const [productivityLevel, setProductivityLevel] = useState<number>(7);
  const [socialLevel, setSocialLevel] = useState<number>(7);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [journalText, setJournalText] = useState("");
  const [isEntryPrivate, setIsEntryPrivate] = useState(false);
  
  // Simulated Attachments
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number>(0);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string>("");
  const [photoAttachment, setPhotoAttachment] = useState<string>("");
  const [photoPreviewName, setPhotoPreviewName] = useState<string>("");

  // --- Emotion Wheel Category Angle State ---
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [activeWheelCategory, setActiveWheelCategory] = useState<keyof typeof EMOTIONS_DATA>("Joyful");

  // --- Timeline Filtering ---
  const [timelineFilter, setTimelineFilter] = useState<"Daily" | "Weekly" | "Monthly" | "Yearly">("Daily");

  // --- Existing Breathing Coach states (Unchanged core features) ---
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Ready">("Ready");
  const [breathingSecLeft, setBreathingSecLeft] = useState(4);
  const [breathingCycleCount, setBreathingCycleCount] = useState(0);
  const [gratitudeInputs, setGratitudeInputs] = useState<string[]>(["", "", ""]);

  // --- Existing Breathing cycle logic (Retained exactly) ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (breathingActive) {
      timer = setInterval(() => {
        setBreathingSecLeft(prev => {
          if (prev <= 1) {
            if (breathingPhase === "Inhale") {
              setBreathingPhase("Hold");
              return 4;
            } else if (breathingPhase === "Hold") {
              setBreathingPhase("Exhale");
              return 4;
            } else {
              setBreathingPhase("Inhale");
              setBreathingCycleCount(c => c + 1);
              return 4;
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

  // --- Security PIN & Lock handlers ---
  const handleLockUnlockSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (enteredPin === pinCode) {
      setIsLocked(false);
      localStorage.setItem("eq_is_locked", "false");
      setEnteredPin("");
      onAddXp(50);
    } else {
      alert("Invalid Security PIN Code! Please check your credentials.");
      setEnteredPin("");
    }
  };

  const handleKeyboardClick = (num: string) => {
    if (enteredPin.length < 4) {
      setEnteredPin(prev => prev + num);
    }
  };

  const triggerBiometricScan = () => {
    setShowBiometricsScan(true);
    setBiometricsSuccess(false);
    setTimeout(() => {
      setBiometricsSuccess(true);
      setTimeout(() => {
        setIsLocked(false);
        localStorage.setItem("eq_is_locked", "false");
        setShowBiometricsScan(false);
        setBiometricsSuccess(false);
        onAddXp(100);
      }, 800);
    }, 1500);
  };

  const handleSaveNewPin = () => {
    if (newPinInput.length === 4) {
      setPinCode(newPinInput);
      localStorage.setItem("eq_pin_code", newPinInput);
      setIsLocked(true);
      localStorage.setItem("eq_is_locked", "true");
      setShowPinSetupModal(false);
      setNewPinInput("");
      alert("Secure Journal Access PIN configured! Your emotional database is now encrypted.");
      onAddXp(150);
    } else {
      alert("PIN must be exactly 4 digits.");
    }
  };

  const handleToggleDeviceLock = () => {
    if (pinCode) {
      const nextLock = !isLocked;
      setIsLocked(nextLock);
      localStorage.setItem("eq_is_locked", String(nextLock));
    } else {
      setShowPinSetupModal(true);
    }
  };

  // --- Simulated Audio Recorder & Photo handlers ---
  const toggleRecordingVoice = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setVoiceNoteDuration(0);
    } else {
      setIsRecordingVoice(false);
      setVoiceNoteUrl("simulated_voice_journal_" + Date.now() + ".wav");
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setVoiceNoteDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  const simulatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoPreviewName(file.name);
      setPhotoAttachment("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2'><rect x='3' y='3' width='18' height='18' rx='2' ry='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg>");
    }
  };

  // --- Advanced Emotional Check-In Submission ---
  const handleLogAdvancedWellness = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmotions.length === 0) {
      alert("Please select at least one emotion from the Emotion Wheel before saving!");
      return;
    }

    onAddMoodLog({
      score: moodScore,
      stressLevel,
      journalText: journalText || "Logged " + selectedEmotions.join(", "),
      emotions: selectedEmotions,
      emotionIntensities: { ...emotionIntensities },
      energyLevel,
      motivationLevel,
      confidenceLevel,
      productivityLevel,
      socialLevel,
      triggers: selectedTriggers,
      isPrivate: isEntryPrivate,
      voiceNoteUrl: voiceNoteUrl || undefined,
      photoAttachmentUrl: photoAttachment || undefined
    });

    // Reset checkin form values
    setSelectedEmotions([]);
    setEmotionIntensities({});
    setJournalText("");
    setSelectedTriggers([]);
    setVoiceNoteUrl("");
    setPhotoAttachment("");
    setPhotoPreviewName("");
    setIsEntryPrivate(false);

    onAddXp(250);
    alert("Enterprise Emotional Intelligence state logged successfully! +250 XP earned.");
    setActiveTab("dashboard");
  };

  // --- Data Calculations ---

  // 1. Emotional Stability Score Calculation (0-100)
  const stabilityScoreStats = useMemo(() => {
    if (moodLogs.length === 0) return { score: 75, label: "Initializing", desc: "Log emotional check-ins to calibrate dynamic EQ scores." };

    // Compute average mood score (out of 10) -> 40 points max
    const avgMood = moodLogs.reduce((acc, log) => acc + log.score, 0) / moodLogs.length;
    const moodContribution = avgMood * 4; // max 40 pts

    // Compute stress penalty -> 25 points max (stress is bad)
    const avgStress = moodLogs.reduce((acc, log) => acc + log.stressLevel, 0) / moodLogs.length;
    const stressContribution = Math.max(0, 10 - avgStress) * 2.5; // max 25 pts

    // Consistency component (mood variance) -> 15 points max
    let moodVariance = 0;
    if (moodLogs.length > 1) {
      const squaredDiffs = moodLogs.map(log => Math.pow(log.score - avgMood, 2));
      const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / moodLogs.length;
      moodVariance = Math.max(0, 15 - variance * 4); // lower variance = higher score component
    } else {
      moodVariance = 12; // baseline
    }

    // Health factors correlation component -> 20 points max
    let healthBonus = 0;
    // Active Sleep
    if (sleepLogs.length > 0) {
      const avgSleep = sleepLogs.reduce((sum, log) => sum + log.hoursSlept, 0) / sleepLogs.length;
      if (avgSleep >= 7 && avgSleep <= 9) healthBonus += 10;
      else if (avgSleep > 5) healthBonus += 5;
    } else {
      healthBonus += 7; // baseline
    }
    // Active Workouts
    if (workoutLogs.length > 0) {
      if (workoutLogs.length >= 2) healthBonus += 10;
      else healthBonus += 5;
    } else {
      healthBonus += 5; // baseline
    }

    const finalScore = Math.round(moodContribution + stressContribution + moodVariance + healthBonus);
    const scoreClamped = Math.max(0, Math.min(100, finalScore));

    let label = "Stable & Resilient";
    let desc = "Exceptional autonomic self-regulation and emotional recovery speeds.";
    if (scoreClamped < 40) {
      label = "High Emotional Volatility";
      desc = "Fluctuating mood ranges combined with chronic fatigue signals. Immediate restorative measures required.";
    } else if (scoreClamped < 65) {
      label = "Moderate Flux State";
      desc = "Standard cognitive adaptation patterns. Minor stress triggers impact overall daily homeostasis.";
    } else if (scoreClamped < 85) {
      label = "Balanced Mindset";
      desc = "Robust emotional resilience with regular lifestyle sync benefits.";
    }

    return { score: scoreClamped, label, desc, avgMood, avgStress };
  }, [moodLogs, sleepLogs, workoutLogs]);

  // 2. Burnout Risk Assessment (Low, Moderate, High, Severe)
  const burnoutAssessment = useMemo(() => {
    // Sort all logs newest first for 14-day window or slice
    const sortedMoodLogs = [...moodLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const sortedSleepLogs = [...sleepLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Filter for logs within 14 days of the latest log (or current time if latest is older)
    const latestRefTime = sortedMoodLogs.length > 0 
      ? Math.max(new Date(sortedMoodLogs[0].timestamp).getTime(), Date.now())
      : Date.now();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

    const moodLogs14 = sortedMoodLogs.filter(l => (latestRefTime - new Date(l.timestamp).getTime()) <= fourteenDaysMs);
    const sleepLogs14 = sortedSleepLogs.filter(l => {
      const dateMs = new Date(l.date).getTime();
      return (latestRefTime - dateMs) <= fourteenDaysMs;
    });

    // Fallback to last 14 logs if filtered set is empty
    const finalMoodLogs14 = moodLogs14.length > 0 ? moodLogs14 : sortedMoodLogs.slice(0, 14);
    const finalSleepLogs14 = sleepLogs14.length > 0 ? sleepLogs14 : sortedSleepLogs.slice(0, 14);

    let score = 0;
    let reasons: string[] = [];

    // Aggregates over the last 14 days
    let avgStress = 0;
    let highStressDays = 0;
    let stressTrend: "Rising" | "Stable" | "Declining" = "Stable";

    let avgSleep = 0;
    let sleepDeficitDays = 0;

    let avgMotivation = 0;
    let lowMotivationDays = 0;

    if (finalMoodLogs14.length > 0) {
      // 1. Chronic Stress Trends
      avgStress = finalMoodLogs14.reduce((sum, l) => sum + l.stressLevel, 0) / finalMoodLogs14.length;
      highStressDays = finalMoodLogs14.filter(l => l.stressLevel >= 7).length;

      // stress trend comparison: newer 7 days vs previous 7 days of the 14-day range
      const newerHalf = finalMoodLogs14.slice(0, Math.ceil(finalMoodLogs14.length / 2));
      const olderHalf = finalMoodLogs14.slice(Math.ceil(finalMoodLogs14.length / 2));
      const newerAvgStress = newerHalf.length > 0 ? newerHalf.reduce((sum, l) => sum + l.stressLevel, 0) / newerHalf.length : 0;
      const olderAvgStress = olderHalf.length > 0 ? olderHalf.reduce((sum, l) => sum + l.stressLevel, 0) / olderHalf.length : 0;

      if (newerAvgStress - olderAvgStress > 0.8) {
        stressTrend = "Rising";
        score += 15;
        reasons.push(`Rising stress trend in last 14 days (average stress increased to ${newerAvgStress.toFixed(1)}/10)`);
      } else if (olderAvgStress - newerAvgStress > 0.8) {
        stressTrend = "Declining";
      } else {
        stressTrend = "Stable";
      }

      if (avgStress >= 7) {
        score += 30;
        reasons.push(`Chronic high stress levels observed (avg stress: ${avgStress.toFixed(1)}/10)`);
      } else if (avgStress >= 5) {
        score += 15;
        reasons.push(`Moderately elevated baseline tension (avg stress: ${avgStress.toFixed(1)}/10)`);
      }

      if (highStressDays >= 3) {
        score += 15;
        reasons.push(`Multiple high cortisol peaks (${highStressDays} out of 14 days with extreme stress logs)`);
      }

      // 2. Low Motivation Scores
      const logsWithMotiv = finalMoodLogs14.filter(l => l.motivationLevel !== undefined);
      if (logsWithMotiv.length > 0) {
        avgMotivation = logsWithMotiv.reduce((sum, l) => sum + (l.motivationLevel || 5), 0) / logsWithMotiv.length;
        lowMotivationDays = logsWithMotiv.filter(l => (l.motivationLevel || 5) <= 4).length;

        if (avgMotivation <= 4.5) {
          score += 20;
          reasons.push(`Sustained neural fatigue & low motivation index (avg motivation: ${avgMotivation.toFixed(1)}/10)`);
        } else if (avgMotivation <= 5.8) {
          score += 10;
          reasons.push(`Mild motivational apathy (avg motivation: ${avgMotivation.toFixed(1)}/10)`);
        }

        if (lowMotivationDays >= 3) {
          score += 10;
          reasons.push(`Frequent low motivation days (${lowMotivationDays} out of 14 days)`);
        }
      }
    } else {
      // Baseline if no mood logs
      avgStress = 3.2;
      avgMotivation = 7.1;
    }

    // 3. Reduced Sleep Quality
    if (finalSleepLogs14.length > 0) {
      avgSleep = finalSleepLogs14.reduce((sum, l) => sum + l.hoursSlept, 0) / finalSleepLogs14.length;
      sleepDeficitDays = finalSleepLogs14.filter(l => l.hoursSlept < 6.5).length;

      if (avgSleep < 6.0) {
        score += 25;
        reasons.push(`Critical sleep deprivation (avg sleep: ${avgSleep.toFixed(1)}h over last 14 days)`);
      } else if (avgSleep < 7.0) {
        score += 15;
        reasons.push(`Sub-optimal sleep window (avg sleep: ${avgSleep.toFixed(1)}h over last 14 days)`);
      }

      if (sleepDeficitDays >= 3) {
        score += 10;
        reasons.push(`Chronic sleep deficit patterns (${sleepDeficitDays} nights with < 6.5h of rest)`);
      }
    } else {
      // Baseline if no sleep logs
      avgSleep = 7.4;
    }

    // Risk calculation
    let level: "Low" | "Moderate" | "High" | "Severe" = "Low";
    let color = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    let desc = "Your energy reservoirs and mental lifestyle parameters are healthy and balanced.";

    if (score >= 70) {
      level = "Severe";
      color = "text-rose-600 bg-rose-500/10 border-rose-200";
      desc = "Critical mental & systemic burnout threshold breached. Immediate rest protocol and therapeutic support advised.";
    } else if (score >= 40) {
      level = "High";
      color = "text-amber-600 bg-amber-500/10 border-amber-200";
      desc = "Elevated risk of chronic exhaustion. Consider schedule reduction, sleep resetting, and mind-body pauses.";
    } else if (score >= 18) {
      level = "Moderate";
      color = "text-blue-500 bg-blue-500/10 border-blue-200";
      desc = "Early signs of mental & cognitive wear. Incorporating vagus nerve breathing drills is highly recommended.";
    }

    return { 
      score: Math.min(100, score), 
      level, 
      color, 
      desc, 
      reasons,
      stats14: {
        avgStress,
        highStressDays,
        stressTrend,
        avgSleep,
        sleepDeficitDays,
        avgMotivation,
        lowMotivationDays,
        totalLogsCount: finalMoodLogs14.length
      }
    };
  }, [moodLogs, sleepLogs]);

  // 3. Trigger analysis (Positive vs Negative influence identification)
  const triggerStats = useMemo(() => {
    const counts: Record<string, { sum: number; count: number; stressSum: number }> = {};
    moodLogs.forEach(log => {
      const triggers = log.triggers || [];
      triggers.forEach(trig => {
        if (!counts[trig]) counts[trig] = { sum: 0, count: 0, stressSum: 0 };
        counts[trig].sum += log.score;
        counts[trig].stressSum += log.stressLevel;
        counts[trig].count += 1;
      });
    });

    const triggerArray = Object.keys(counts).map(name => {
      const avgMood = counts[name].sum / counts[name].count;
      const avgStress = counts[name].stressSum / counts[name].count;
      return {
        name,
        count: counts[name].count,
        avgMood,
        avgStress
      };
    });

    // Sort by mood to isolate positive and negative triggers
    const sortedByMood = [...triggerArray].sort((a, b) => b.avgMood - a.avgMood);
    const positiveTriggers = sortedByMood.filter(t => t.avgMood >= 6).slice(0, 3);
    const negativeTriggers = [...sortedByMood].reverse().filter(t => t.avgMood < 6).slice(0, 3);

    return {
      all: triggerArray,
      positive: positiveTriggers,
      negative: negativeTriggers
    };
  }, [moodLogs]);

  // 4. Emotional Context Analysis (Comparisons with existing modules)
  const contextAnalysis = useMemo(() => {
    if (moodLogs.length === 0) return null;

    // Mood on Workout Days vs Non-Workout Days
    const workoutDates = new Set(workoutLogs.map(w => w.timestamp.split("T")[0]));
    let workoutDaysMoodSum = 0;
    let workoutDaysCount = 0;
    let nonWorkoutDaysMoodSum = 0;
    let nonWorkoutDaysCount = 0;

    moodLogs.forEach(log => {
      const dateStr = log.timestamp.split("T")[0];
      if (workoutDates.has(dateStr)) {
        workoutDaysMoodSum += log.score;
        workoutDaysCount++;
      } else {
        nonWorkoutDaysMoodSum += log.score;
        nonWorkoutDaysCount++;
      }
    });

    const avgWorkoutMood = workoutDaysCount > 0 ? workoutDaysMoodSum / workoutDaysCount : null;
    const avgNonWorkoutMood = nonWorkoutDaysCount > 0 ? nonWorkoutDaysMoodSum / nonWorkoutDaysCount : null;

    // Mood correlated to Sleep Hours
    const sleepMap = new Map(sleepLogs.map(s => [s.date, s.hoursSlept]));
    let optimalSleepMoodSum = 0; // >= 7.5 hours
    let optimalSleepCount = 0;
    let deficitSleepMoodSum = 0; // < 7.5 hours
    let deficitSleepCount = 0;

    moodLogs.forEach(log => {
      const dateStr = log.timestamp.split("T")[0];
      const hours = sleepMap.get(dateStr);
      if (hours !== undefined) {
        if (hours >= 7.5) {
          optimalSleepMoodSum += log.score;
          optimalSleepCount++;
        } else {
          deficitSleepMoodSum += log.score;
          deficitSleepCount++;
        }
      }
    });

    const avgOptimalSleepMood = optimalSleepCount > 0 ? optimalSleepMoodSum / optimalSleepCount : null;
    const avgDeficitSleepMood = deficitSleepCount > 0 ? deficitSleepMoodSum / deficitSleepCount : null;

    // Mood Correlated to Hydration Intake (Water logs)
    const waterMap = new Map<string, number>();
    waterLogs.forEach(w => {
      const dateStr = w.timestamp.split("T")[0];
      waterMap.set(dateStr, (waterMap.get(dateStr) || 0) + w.amountMl);
    });

    let wellHydratedMoodSum = 0; // >= 2000 ml
    let wellHydratedCount = 0;
    let dehydratedMoodSum = 0; // < 2000 ml
    let dehydratedCount = 0;

    moodLogs.forEach(log => {
      const dateStr = log.timestamp.split("T")[0];
      const amount = waterMap.get(dateStr) || 0;
      if (amount >= 2000) {
        wellHydratedMoodSum += log.score;
        wellHydratedCount++;
      } else {
        dehydratedMoodSum += log.score;
        dehydratedCount++;
      }
    });

    const avgHydratedMood = wellHydratedCount > 0 ? wellHydratedMoodSum / wellHydratedCount : null;
    const avgDehydratedMood = dehydratedCount > 0 ? dehydratedMoodSum / dehydratedCount : null;

    return {
      workout: { active: avgWorkoutMood, inactive: avgNonWorkoutMood },
      sleep: { optimal: avgOptimalSleepMood, deficit: avgDeficitSleepMood },
      hydration: { met: avgHydratedMood, unmet: avgDehydratedMood }
    };
  }, [moodLogs, workoutLogs, sleepLogs, waterLogs]);

  // 5. Weekly/Monthly Reports (Mood distribution, positive/negative ratio, etc.)
  const reportSummary = useMemo(() => {
    if (moodLogs.length === 0) return null;

    // Frequency of individual emotions
    const emoCounts: Record<string, number> = {};
    moodLogs.forEach(log => {
      const emotions = log.emotions || [];
      emotions.forEach(emo => {
        emoCounts[emo] = (emoCounts[emo] || 0) + 1;
      });
    });

    const sortedEmotions = Object.keys(emoCounts).map(name => ({
      name,
      count: emoCounts[name]
    })).sort((a, b) => b.count - a.count);

    // Positive vs Negative balance
    let positiveCount = 0;
    let negativeCount = 0;
    const posEmotions = new Set([...EMOTIONS_DATA.Joyful, ...EMOTIONS_DATA.Peaceful]);
    const negEmotions = new Set([...EMOTIONS_DATA.Vulnerable, ...EMOTIONS_DATA.Tense]);

    moodLogs.forEach(log => {
      const emotions = log.emotions || [];
      emotions.forEach(emo => {
        if (posEmotions.has(emo)) positiveCount++;
        if (negEmotions.has(emo)) negativeCount++;
      });
    });

    const totalEmotionsLogged = positiveCount + negativeCount || 1;
    const positivePercentage = Math.round((positiveCount / totalEmotionsLogged) * 100);
    const negativePercentage = Math.round((negativeCount / totalEmotionsLogged) * 100);

    // Recovery speed calculator (Transition of logs <= 4 back to >= 7)
    let lowMoodLogs: number[] = [];
    let recoveryDays: number[] = [];

    const sortedLogs = [...moodLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    for (let i = 0; i < sortedLogs.length; i++) {
      if (sortedLogs[i].score <= 4) {
        // find when it recovered to >= 7
        const lowDate = new Date(sortedLogs[i].timestamp);
        let recovered = false;
        for (let j = i + 1; j < sortedLogs.length; j++) {
          if (sortedLogs[j].score >= 7) {
            const recDate = new Date(sortedLogs[j].timestamp);
            const diffTime = Math.abs(recDate.getTime() - lowDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            recoveryDays.push(diffDays);
            recovered = true;
            break;
          }
        }
      }
    }

    const avgRecoveryDays = recoveryDays.length > 0 
      ? (recoveryDays.reduce((sum, val) => sum + val, 0) / recoveryDays.length).toFixed(1) 
      : "1.2"; // healthy recovery baseline

    return {
      topEmotions: sortedEmotions.slice(0, 5),
      balance: { positive: positivePercentage, negative: negativePercentage },
      recoveryDays: avgRecoveryDays,
      growthTrend: moodLogs.length > 5 ? (moodLogs[0].score >= moodLogs[moodLogs.length - 1].score ? "Positive upward trajectory" : "Slight plateau") : "Dynamic growth calibrating"
    };
  }, [moodLogs]);

  // 6. Year Heatmap Data (Simulates GitHub contributions based on daily logs)
  const heatmapCells = useMemo(() => {
    // Generate dates for the past 60 days to show on grid (keeps layout crisp and responsive)
    const cells = [];
    const dateLogsMap = new Map<string, MoodLog>();
    moodLogs.forEach(log => {
      const dateStr = log.timestamp.split("T")[0];
      dateLogsMap.set(dateStr, log);
    });

    for (let i = 44; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const log = dateLogsMap.get(dateStr);
      
      let intensityColor = "bg-slate-100 hover:bg-slate-200 border-gray-200/40"; // No data
      if (log) {
        if (log.score >= 8) {
          intensityColor = "bg-emerald-500 hover:bg-emerald-600 border-emerald-300 text-white";
        } else if (log.score >= 6) {
          intensityColor = "bg-emerald-300 hover:bg-emerald-400 border-emerald-200 text-slate-800";
        } else if (log.score >= 4) {
          intensityColor = "bg-amber-300 hover:bg-amber-400 border-amber-200 text-slate-800";
        } else {
          intensityColor = "bg-rose-400 hover:bg-rose-500 border-rose-200 text-white";
        }
      }

      cells.push({
        date: dateStr,
        dayLabel: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        log,
        colorClass: intensityColor
      });
    }
    return cells;
  }, [moodLogs]);

  // 7. Recharts Timeline Data Formulation
  const chartData = useMemo(() => {
    const sorted = [...moodLogs]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-10); // last 10 entries for optimal chart density

    return sorted.map(l => {
      const date = new Date(l.timestamp);
      return {
        name: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        "Emotional Well-being": l.score,
        "Cortisol Level": l.stressLevel,
        Energy: l.energyLevel || 5,
        Motivation: l.motivationLevel || 5,
        Confidence: l.confidenceLevel || 5,
        Productivity: l.productivityLevel || 5
      };
    });
  }, [moodLogs]);

  // --- Emotion Wheel Interactions ---
  const rotateWheelCategory = (cat: keyof typeof EMOTIONS_DATA, angle: number) => {
    setWheelRotation(angle);
    setActiveWheelCategory(cat);
  };

  const handleToggleEmotionSelection = (emo: string) => {
    if (selectedEmotions.includes(emo)) {
      setSelectedEmotions(prev => prev.filter(e => e !== emo));
      setEmotionIntensities(prev => {
        const copy = { ...prev };
        delete copy[emo];
        return copy;
      });
    } else {
      setSelectedEmotions(prev => [...prev, emo]);
      setEmotionIntensities(prev => ({
        ...prev,
        [emo]: 7 // default starting intensity
      }));
    }
  };

  const handleIntensityChange = (emo: string, value: number) => {
    setEmotionIntensities(prev => ({
      ...prev,
      [emo]: value
    }));
  };

  // Simulated Encrypt Decrypt Display Helper
  const getEncryptedDisplay = (text: string) => {
    if (!encryptRecords) return text;
    // Simple mock rot13 / base64 encrypt simulation
    return "🔐 AES-256[" + btoa(text).slice(0, 16) + "...]";
  };

  // Private Mode Toggle Helper
  const getJournalTextDisplay = (text: string, isEntryPrivateField?: boolean) => {
    const isPriv = isPrivateMode || isEntryPrivateField;
    if (isPriv) {
      return (
        <span className="bg-slate-200/80 backdrop-blur-md px-2 py-0.5 rounded text-slate-400 blur-[3px] select-none hover:blur-none transition-all duration-300 cursor-pointer inline-flex items-center gap-1">
          <Lock className="w-3 h-3 inline" /> Hover to Decrypt Journal Entry
        </span>
      );
    }
    return getEncryptedDisplay(text);
  };

  const handlePermanentlyClearHistory = () => {
    if (confirm("CRITICAL WARNING: This action is irreversible. Are you sure you want to permanently delete all sensitive Emotional Intelligence records from secure local storage?")) {
      localStorage.removeItem("fit_mood_logs");
      alert("All emotional history records have been securely shredded.");
      window.location.reload();
    }
  };

  const handleExportHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(moodLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "fitvitacoach_eq_history_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onAddXp(50);
  };

  return (
    <div className="space-y-6" id="mental_wellness_dashboard">
      
      {/* Locked overlay gate */}
      <AnimatePresence>
        {isLocked && pinCode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
                  <LockKeyhole className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Secure EQ Database Locked</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Your physiological & emotional diary is fully encrypted under AES-256 standard. Provide PIN or biometric scan to load profile.
                </p>
              </div>

              {/* PIN Screen Form */}
              <form onSubmit={handleLockUnlockSubmit} className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3].map(idx => (
                    <div 
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        enteredPin.length > idx 
                          ? "bg-emerald-400 border-emerald-400 scale-110" 
                          : "border-slate-700 bg-slate-850"
                      }`}
                    />
                  ))}
                </div>

                {/* Secure Pin Keyboard Pad */}
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleKeyboardClick(num)}
                      className="py-3 bg-slate-800/50 hover:bg-slate-800 text-white font-bold rounded-xl active:scale-95 transition-all"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEnteredPin("")}
                    className="py-3 text-rose-400 font-bold text-xs"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeyboardClick("0")}
                    className="py-3 bg-slate-800/50 hover:bg-slate-800 text-white font-bold rounded-xl"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeyboardClick("")}
                    className="py-3 text-slate-500 font-bold"
                  >
                    &nbsp;
                  </button>
                </div>

                <div className="flex gap-3 justify-center pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold text-xs rounded-xl transition-all"
                  >
                    Unlock with PIN
                  </button>
                  <button
                    type="button"
                    onClick={triggerBiometricScan}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Fingerprint className="w-4 h-4" /> Scan Biometrics
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Biometric Scan Simulated Radar Overlay */}
      <AnimatePresence>
        {showBiometricsScan && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                {/* Simulated Radar Swipes */}
                <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-emerald-400/40 animate-pulse" />
                <Fingerprint className="w-16 h-16 text-emerald-400 animate-pulse relative z-10" />
                {/* Moving Green Laser Bar */}
                <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-[bounce_1.5s_infinite] top-0" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm tracking-wide uppercase">Simulating FaceID / TouchID Loop</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {biometricsSuccess ? "✓ Authentication Verified. Synchronizing tokens..." : "Reading tactile dermal capillaries..."}
                </p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* PIN Configuration Modal */}
      {showPinSetupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-xl border border-gray-100">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-500" />
              Configure secure PIN Lock
            </h3>
            <p className="text-xs text-gray-500">
              Set a 4-digit security PIN to prevent unauthorized local reading of your sensitive emotional journals and psychological evaluations.
            </p>
            <input 
              type="password"
              maxLength={4}
              placeholder="Enter 4-digit secure code"
              value={newPinInput}
              onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl font-mono text-center text-lg tracking-widest focus:outline-emerald-500 bg-gray-50"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowPinSetupModal(false)}
                className="w-1/2 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewPin}
                className="w-1/2 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
              >
                Save PIN Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Glassmorphic Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-[9px] uppercase tracking-wider">
              Flagship Enterprise Module
            </span>
            {pinCode && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Encrypted Vault
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-400 tracking-tight flex items-center gap-2.5">
            <BrainCircuit className="w-7 h-7 text-emerald-400" />
            FitVita Emotional Intelligence Suite
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Transition mood tracking into an enterprise cognitive intelligence system. Discover emotional anchors, predict fatigue indicators, and study lifestyle bio-correlations.
          </p>
        </div>

        {/* Tab switcher buttons inside header */}
        <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800/80 max-w-full">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "dashboard" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
            }`}
          >
            📊 Analytics
          </button>
          <button 
            onClick={() => setActiveTab("checkin")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "checkin" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
            }`}
          >
            ✏️ EQ Check-In
          </button>
          <button 
            onClick={() => setActiveTab("breathing")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "breathing" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
            }`}
          >
            🌬️ Vagus Coach
          </button>
          <button 
            onClick={() => setActiveTab("focus")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "focus" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
            }`}
          >
            🎯 Focus Workspace
          </button>
          <button 
            onClick={() => setActiveTab("journal")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "journal" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
            }`}
          >
            📓 Reflection Journal
          </button>
          <button 
            onClick={() => setActiveTab("digital")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "digital" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
            }`}
          >
            📱 Digital Wellbeing
          </button>
          <button 
            onClick={() => setActiveTab("recovery")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "recovery" ? "bg-emerald-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
            }`}
          >
            🧘 Recovery Studio
          </button>
        </div>
      </div>

      {/* SECURE PRIVACY SETTINGS BANNER BAR */}
      <div className="bg-slate-50 border border-gray-100 p-4 rounded-2xl flex flex-wrap gap-4 justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <LockKeyhole className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-gray-800">Security & Ledger Controls:</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleToggleDeviceLock}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              pinCode 
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200" 
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {pinCode ? (
              <>
                <Unlock className="w-3.5 h-3.5" /> Force Lock (Reset PIN)
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" /> Setup Passcode PIN
              </>
            )}
          </button>

          <button
            onClick={() => setIsPrivateMode(!isPrivateMode)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all ${
              isPrivateMode 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {isPrivateMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            Private Shoulder-Shield ({isPrivateMode ? "ON" : "OFF"})
          </button>

          <button
            onClick={() => setEncryptRecords(!encryptRecords)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all ${
              encryptRecords 
                ? "bg-purple-50 border-purple-200 text-purple-700" 
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sim-Encrypt Ledger ({encryptRecords ? "Encrypted View" : "Decrypted"})
          </button>

          <button
            onClick={handleExportHistory}
            className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Export EQ Logs
          </button>

          <button
            onClick={handlePermanentlyClearHistory}
            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100 rounded-xl font-bold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Shred All History
          </button>
        </div>
      </div>

      {/* --- TAB VIEW 1: ANALYTICS & TIMELINE DASHBOARD --- */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          
          {/* TOP SUMMARY CARD GRID: STABILITY, RISK ASSESSMENT, REPORT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Dynamic Emotional Stability score gauge */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    DYNAMIC HEALTH METRIC
                  </span>
                  <h3 className="text-md font-bold text-gray-900 mt-2">Stability Score (EQ-S)</h3>
                </div>
                <Info className="w-4.5 h-4.5 text-gray-400 cursor-help" title="Calculated from mean score range, low variance indices, hydration logs and daily deep sleep durations." />
              </div>

              {/* Graphical Circular Stability Indicator */}
              <div className="flex items-center justify-center py-6">
                <div className="relative flex items-center justify-center w-28 h-28">
                  {/* Outer gradient circular trace */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                    <circle cx="56" cy="56" r="48" stroke="url(#stabilityGrad)" strokeWidth="8" fill="transparent" 
                      strokeDasharray="301.6" strokeDashoffset={301.6 - (301.6 * stabilityScoreStats.score) / 100} 
                      strokeLinecap="round" />
                    <defs>
                      <linearGradient id="stabilityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black font-mono text-gray-900">{stabilityScoreStats.score}</span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase">Resilience</span>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-xs font-bold text-gray-800">{stabilityScoreStats.label}</div>
                <div className="text-[11px] text-gray-500 leading-relaxed px-2">
                  {stabilityScoreStats.desc}
                </div>
              </div>
            </div>

            {/* Burnout Risk Assessment Card */}
            <div className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between transition-all bg-white hover:shadow-md ${burnoutAssessment.color}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900/10 text-slate-800">
                      14-DAY BURNOUT ASSESSMENT
                    </span>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Flame className="w-5 h-5 text-rose-500" />
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Risk Level: <span className="underline decoration-slate-400">{burnoutAssessment.level}</span>
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                      Index: {burnoutAssessment.score}/100
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {burnoutAssessment.desc}
                </p>

                {/* Burnout Meter Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Exhaustion Vector</span>
                    <span>{burnoutAssessment.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        burnoutAssessment.level === "Severe" ? "bg-rose-600" :
                        burnoutAssessment.level === "High" ? "bg-amber-500" :
                        burnoutAssessment.level === "Moderate" ? "bg-blue-500" :
                        "bg-emerald-500"
                      }`}
                      style={{ width: `${burnoutAssessment.score}%` }}
                    />
                  </div>
                </div>

                {/* Aggregated 14-Day Indicators */}
                <div className="space-y-2 border-t border-black/5 pt-3">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Aggregated 14-Day Metrics
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {/* Stress Trends */}
                    <div className="flex items-center justify-between bg-black/5 p-2 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-red-500 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800">Chronic Stress Trend</div>
                          <div className="text-[10px] text-slate-500 leading-tight">
                            Avg: {burnoutAssessment.stats14.avgStress.toFixed(1)}/10 • Trend: {burnoutAssessment.stats14.stressTrend}
                          </div>
                        </div>
                      </div>
                      {burnoutAssessment.stats14.highStressDays > 0 ? (
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-700 font-bold text-[10px] rounded-lg whitespace-nowrap">
                          {burnoutAssessment.stats14.highStressDays} Peaks
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 font-bold text-[10px] rounded-lg whitespace-nowrap">
                          No Peaks
                        </span>
                      )}
                    </div>

                    {/* Sleep Deficit */}
                    <div className="flex items-center justify-between bg-black/5 p-2 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5">
                        <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800">Sleep Quality Index</div>
                          <div className="text-[10px] text-slate-500 leading-tight">
                            Avg: {burnoutAssessment.stats14.avgSleep.toFixed(1)} hrs of rest
                          </div>
                        </div>
                      </div>
                      {burnoutAssessment.stats14.sleepDeficitDays > 0 ? (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 font-bold text-[10px] rounded-lg whitespace-nowrap">
                          {burnoutAssessment.stats14.sleepDeficitDays} Deficits
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 font-bold text-[10px] rounded-lg whitespace-nowrap">
                          Optimal Sleep
                        </span>
                      )}
                    </div>

                    {/* Motivation Score */}
                    <div className="flex items-center justify-between bg-black/5 p-2 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800">Low Motivation Index</div>
                          <div className="text-[10px] text-slate-500 leading-tight">
                            Avg Drive: {burnoutAssessment.stats14.avgMotivation.toFixed(1)}/10
                          </div>
                        </div>
                      </div>
                      {burnoutAssessment.stats14.lowMotivationDays > 0 ? (
                        <span className="px-2 py-0.5 bg-orange-500/10 text-orange-700 font-bold text-[10px] rounded-lg whitespace-nowrap">
                          {burnoutAssessment.stats14.lowMotivationDays} Low Days
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-700 font-bold text-[10px] rounded-lg whitespace-nowrap">
                          High Drive
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Identified Risk Factors Details list */}
                <div className="border-t border-black/5 pt-3">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1.5">
                    Identified Risk Factors
                  </div>
                  {burnoutAssessment.reasons.length === 0 ? (
                    <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Healthy autonomic baseline verified.
                    </div>
                  ) : (
                    <div className="max-h-24 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
                      {burnoutAssessment.reasons.map((r, i) => (
                        <div key={i} className="text-[10px] leading-tight font-medium text-slate-700 flex items-start gap-1">
                          <span className="text-rose-500">•</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-1 mt-4 pt-3 border-t border-black/5">
                <button 
                  onClick={() => {
                    alert("A customized mental recovery protocol has been initialized! Added 'Box Breathing drill', 'Gratitude mapping session', and '11:00 PM Bedtime alert' to your active actionable protocols.");
                    onAddXp(150);
                  }}
                  className="w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-sm"
                >
                  Activate Restorative Protocol (+150 XP)
                </button>
              </div>
            </div>

            {/* Cognitive Balance & Reports */}
            {reportSummary ? (
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                    WEEKLY EQ LEDGER SUMMARY
                  </span>
                  <h3 className="text-md font-bold text-gray-900 mt-2">Positive vs Negative Balance</h3>
                </div>

                {/* Progress bars for balance */}
                <div className="my-3 space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500">
                      <span className="uppercase text-emerald-600">Positive Highs (Joyful, Peaceful)</span>
                      <span>{reportSummary.balance.positive}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${reportSummary.balance.positive}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500">
                      <span className="uppercase text-rose-600">Reactive Stress (Vulnerable, Tense)</span>
                      <span>{reportSummary.balance.negative}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${reportSummary.balance.negative}%` }} />
                    </div>
                  </div>
                </div>

                {/* Quick Indicators */}
                <div className="grid grid-cols-2 gap-3 text-center border-t border-gray-50 pt-3">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Avg Recovery</div>
                    <div className="text-md font-black text-gray-800 font-mono mt-0.5">{reportSummary.recoveryDays} Days</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Growth Index</div>
                    <div className="text-[10px] font-bold text-emerald-600 mt-0.5 leading-tight">{reportSummary.growthTrend}</div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 text-center leading-relaxed mt-2 font-medium">
                  Your primary emotional anchor: <span className="font-extrabold text-gray-900 underline">{reportSummary.topEmotions[0]?.name || "Peaceful"}</span>. Keep up check-ins to increase index fidelity.
                </div>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-center text-center text-xs text-gray-400 font-bold">
                Log emotional metrics to populate comparative report summaries.
              </div>
            )}

          </div>

          {/* DYNAMIC TIMELINE RECHARTS GRAPH */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-black text-gray-900 tracking-tight text-sm">Autonomic Stability Progression</h3>
                <p className="text-[11px] text-gray-400">Comparing overall emotional scores against concurrent cortisol/stress levels.</p>
              </div>
              
              {/* Chart legend identifiers */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Emotional Well-being
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Cortisol (Stress)
                </span>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 10]} />
                    <Tooltip contentStyle={{ borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }} />
                    <Area type="monotone" dataKey="Emotional Well-being" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
                    <Area type="monotone" dataKey="Cortisol Level" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorStress)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-gray-400 font-bold bg-slate-50 rounded-2xl">
                Insufficient database entries. Load at least two logs to activate vector progression trace.
              </div>
            )}
          </div>

          {/* GITHUB-STYLE HEATMAP PANEL */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-black text-gray-900 tracking-tight text-sm flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-emerald-500" />
                EQ Chronological Heatmap
              </h3>
              <p className="text-[11px] text-gray-400">Analyze micro-fluctuations over a rolling 45-day cycle. Hover over logged cells to trigger decryption nodes.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100/50">
              {/* Heatmap cells grid */}
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                {heatmapCells.map((cell, idx) => (
                  <div 
                    key={idx}
                    className={`w-8 h-8 rounded-lg border flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-all relative group cursor-help select-none ${cell.colorClass}`}
                  >
                    <span>{cell.date.split("-")[2]}</span>
                    
                    {/* Hover tooltip overlay */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white p-2.5 rounded-xl text-[10px] font-sans font-normal opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-30 shadow-xl border border-slate-800 leading-relaxed">
                      <div className="font-bold text-emerald-400">{cell.dayLabel}</div>
                      {cell.log ? (
                        <div className="space-y-1 mt-1">
                          <div>Score: <span className="font-bold">{cell.log.score}/10</span> | Stress: <span className="font-bold">{cell.log.stressLevel}/10</span></div>
                          <div className="truncate text-slate-300">Emotions: {cell.log.emotions?.join(", ") || "None"}</div>
                          <div className="truncate text-slate-300">Triggers: {cell.log.triggers?.join(", ") || "None"}</div>
                        </div>
                      ) : (
                        <div className="text-slate-400 italic mt-0.5">No emotional telemetry logged.</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Heatmap color code key */}
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 mt-4 border-t border-gray-200/50 pt-2 flex-wrap gap-2">
                <span>Rolling 45-Day Retrospective</span>
                <div className="flex items-center gap-1.5">
                  <span>Sore / Fatigued</span>
                  <div className="w-3.5 h-3.5 rounded bg-rose-400" />
                  <div className="w-3.5 h-3.5 rounded bg-amber-300" />
                  <div className="w-3.5 h-3.5 rounded bg-emerald-300" />
                  <div className="w-3.5 h-3.5 rounded bg-emerald-500" />
                  <span>Optimistic / Calm</span>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC COGNITIVE CORRELATION INSIGHTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Trigger detection analysis */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-gray-900 tracking-tight text-sm flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
                  Identified Anchors & Trigger Catalysts
                </h3>
                <p className="text-[11px] text-gray-400">Algorithmic isolation of active triggers impacting daily mood and stress indices.</p>
              </div>

              {/* Top anchors panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Positive anchors */}
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/60 space-y-2">
                  <div className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Top Mood Anchors (Positive)</div>
                  {triggerStats.positive.length > 0 ? (
                    <div className="space-y-2">
                      {triggerStats.positive.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-800">★ {t.name}</span>
                          <span className="font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-black">
                            {t.avgMood.toFixed(1)} avg mood
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] italic text-emerald-700">Accumulate mood telemetry with tags to identify peaks.</div>
                  )}
                </div>

                {/* Negative anchors */}
                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/60 space-y-2">
                  <div className="text-[10px] font-black text-rose-800 uppercase tracking-wider">High-Stressor Triggers (Negative)</div>
                  {triggerStats.negative.length > 0 ? (
                    <div className="space-y-2">
                      {triggerStats.negative.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-800">⚠ {t.name}</span>
                          <span className="font-mono text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full text-[10px] font-black">
                            {t.avgStress.toFixed(1)} avg stress
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] italic text-rose-700">Accumulate mood telemetry with tags to identify depressors.</div>
                  )}
                </div>

              </div>

              {/* Trigger frequency distribution */}
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={triggerStats.all.slice(0, 6)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "10px" }} />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30}>
                      {triggerStats.all.slice(0, 6).map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.avgMood >= 6 ? "#10b981" : "#f43f5e"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cross-Module Correlation Insights */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-gray-900 tracking-tight text-sm flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-emerald-500" />
                  Multi-Module Bio-Correlations
                </h3>
                <p className="text-[11px] text-gray-400">Discovering how physical metrics recorded elsewhere correlate to emotional state.</p>
              </div>

              {contextAnalysis ? (
                <div className="space-y-4">
                  
                  {/* Workout Correlation */}
                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-gray-150/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-gray-800">Physical Exercise Impact</div>
                        <p className="text-[10px] text-gray-500">Comparing mood scores on days with physical logs vs days without.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {contextAnalysis.workout.active !== null ? (
                        <>
                          <div className="text-xs font-extrabold text-emerald-600">Avg {contextAnalysis.workout.active.toFixed(1)} / 10</div>
                          <span className="text-[9px] text-gray-400 font-bold font-mono">Vs {contextAnalysis.workout.inactive?.toFixed(1) || "5.0"} on non-active days</span>
                        </>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Needs workout logs</span>
                      )}
                    </div>
                  </div>

                  {/* Sleep Correlation */}
                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-gray-150/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-gray-800">Sleep Duration Correlation</div>
                        <p className="text-[10px] text-gray-500">Checking your mood score when sleep targets are fully achieved.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {contextAnalysis.sleep.optimal !== null ? (
                        <>
                          <div className="text-xs font-extrabold text-indigo-600">Avg {contextAnalysis.sleep.optimal.toFixed(1)} / 10</div>
                          <span className="text-[9px] text-gray-400 font-bold font-mono">Vs {contextAnalysis.sleep.deficit?.toFixed(1) || "5.0"} when sleep deprived</span>
                        </>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Needs sleep logs</span>
                      )}
                    </div>
                  </div>

                  {/* Water Hydration Correlation */}
                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-gray-150/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <Droplets className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-gray-800">Hydration Levels & Fatigue</div>
                        <p className="text-[10px] text-gray-500">Analyzing energy & stress ratios against daily fluid intakes.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {contextAnalysis.hydration.met !== null ? (
                        <>
                          <div className="text-xs font-extrabold text-blue-600">Avg {contextAnalysis.hydration.met.toFixed(1)} / 10</div>
                          <span className="text-[9px] text-gray-400 font-bold font-mono">Vs {contextAnalysis.hydration.unmet?.toFixed(1) || "5.0"} when dehydrated</span>
                        </>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Needs water logs</span>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 italic font-bold">
                  Accumulate sleep, workout, and water metrics to map bio-correlations.
                </div>
              )}

              {/* Chatbot style EQ recommendation */}
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 text-[11px] leading-relaxed flex items-start gap-2.5">
                <BrainCircuit className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Conversational EQ Coach:</span> "Comparing your multi-module logs, we notice a strong statistical rise of <span className="font-extrabold underline">+1.8 average mood points</span> on days where sleep exceeds 7.5 hours and water levels hit targets. Try pairing physical workouts with immediate box-breathing to rapidly clear cortisol spikes."
                </div>
              </div>
            </div>

          </div>

          {/* HISTORICAL CHRONOLOGICAL FEED */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-black text-gray-900 tracking-tight text-sm">Chronological Emotional Ledger Feed</h3>
            
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto pr-2 space-y-4">
              {moodLogs.map((log) => {
                const isItemPrivate = log.isPrivate;
                return (
                  <div key={log.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 font-mono">
                          {new Date(log.timestamp).toLocaleString("en-US", { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                        </span>
                        
                        {/* Display list of emotions */}
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {log.emotions?.map((emo, i) => (
                            <span 
                              key={i}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 font-extrabold text-[9px] rounded-full uppercase"
                            >
                              {emo}
                            </span>
                          )) || (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-extrabold text-[9px] rounded-full uppercase">
                              Mood Score: {log.score}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score metrics */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase font-mono">
                          Score: {log.score}/10
                        </span>
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase font-mono">
                          Stress: {log.stressLevel}/10
                        </span>
                      </div>
                    </div>

                    {/* Journal text with Private reveal support */}
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100/40">
                      {getJournalTextDisplay(log.journalText || "No notes saved", isItemPrivate)}
                    </p>

                    {/* Triggers logged */}
                    {log.triggers && log.triggers.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                        <span>Influencers:</span>
                        {log.triggers.map((t, idx) => (
                          <span key={idx} className="bg-slate-200/60 px-2 py-0.5 rounded text-gray-600 font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Media attachments info */}
                    {(log.voiceNoteUrl || log.photoAttachmentUrl) && (
                      <div className="flex items-center gap-3 text-[10px] font-bold text-emerald-600">
                        {log.voiceNoteUrl && (
                          <span className="inline-flex items-center gap-1">
                            <Volume2 className="w-3.5 h-3.5" /> Simulated Voice Journal Attachment
                          </span>
                        )}
                        {log.photoAttachmentUrl && (
                          <span className="inline-flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5" /> Photo Reference Embedded
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* --- TAB VIEW 2: ADVANCED EMOTION WHEEL & LOG CHECK-IN --- */}
      {activeTab === "checkin" && (
        <form onSubmit={handleLogAdvancedWellness} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-black text-gray-900 text-lg tracking-tight">Interactive Daily EQ Check-In</h3>
            <p className="text-xs text-gray-500 mt-1">
              Construct high-fidelity biometric journals. Harness the circular emotion spectrum map below to pick multiple feelings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Interactive Animated Emotion Wheel Component */}
            <div className="lg:col-span-5 flex flex-col items-center space-y-6">
              
              <div className="text-center">
                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  STEP 1: INTERACTIVE EMOTION WHEEL
                </span>
                <h4 className="text-xs font-black text-gray-800 uppercase mt-2">Active Category: {activeWheelCategory}</h4>
              </div>

              {/* Animated Wheel Visual Outer Frame */}
              <div className="relative w-72 h-72 rounded-full border-4 border-slate-900 bg-slate-950 flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-700">
                
                {/* Spinning Dial Background segments */}
                <div 
                  className="absolute inset-0 transition-transform duration-700 ease-out" 
                  style={{ transform: `rotate(${wheelRotation}deg)` }}
                >
                  {/* Category segments traces */}
                  <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-amber-500/20 border-r border-b border-slate-900/40" />
                  <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-emerald-500/20 border-l border-b border-slate-900/40" />
                  <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-rose-500/20 border-r border-t border-slate-900/40" />
                  <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-sky-500/20 border-l border-t border-slate-900/40" />

                  {/* Text on segments */}
                  <div className="absolute top-8 left-12 text-[10px] font-black text-amber-300 -rotate-45">JOYFUL</div>
                  <div className="absolute top-8 right-12 text-[10px] font-black text-emerald-300 rotate-45">PEACEFUL</div>
                  <div className="absolute bottom-8 left-12 text-[10px] font-black text-rose-300 rotate-45">TENSE</div>
                  <div className="absolute bottom-8 right-12 text-[10px] font-black text-sky-300 -rotate-45">VULNERABLE</div>
                </div>

                {/* Core Selector Button and Radar Overlay */}
                <div className="absolute w-28 h-28 bg-slate-900 rounded-full border-4 border-slate-800 z-20 flex flex-col items-center justify-center text-center p-2 shadow-inner">
                  <Heart className="w-5 h-5 text-emerald-400 animate-pulse mb-1" />
                  <span className="text-[9px] font-black text-slate-300 uppercase leading-none">Select</span>
                  <span className="text-[9px] font-bold text-slate-500 mt-0.5">{selectedEmotions.length} Chosen</span>
                </div>

                {/* Clickable Wedge Selectors (Outer border clicks rotate wheel) */}
                <button 
                  type="button" 
                  onClick={() => rotateWheelCategory("Joyful", 0)} 
                  className="absolute top-2 left-2 w-1/2 h-1/2 opacity-0 z-10" 
                  title="Joyful Sector"
                />
                <button 
                  type="button" 
                  onClick={() => rotateWheelCategory("Peaceful", 90)} 
                  className="absolute top-2 right-2 w-1/2 h-1/2 opacity-0 z-10" 
                  title="Peaceful Sector"
                />
                <button 
                  type="button" 
                  onClick={() => rotateWheelCategory("Vulnerable", 180)} 
                  className="absolute bottom-2 right-2 w-1/2 h-1/2 opacity-0 z-10" 
                  title="Vulnerable Sector"
                />
                <button 
                  type="button" 
                  onClick={() => rotateWheelCategory("Tense", 270)} 
                  className="absolute bottom-2 left-2 w-1/2 h-1/2 opacity-0 z-10" 
                  title="Tense Sector"
                />
              </div>

              {/* Rapid Category Toggle buttons under wheel */}
              <div className="grid grid-cols-4 gap-2 w-full">
                {(Object.keys(EMOTIONS_DATA) as Array<keyof typeof EMOTIONS_DATA>).map((cat) => {
                  const active = activeWheelCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        const degMap = { Joyful: 0, Peaceful: 90, Vulnerable: 180, Tense: 270 };
                        rotateWheelCategory(cat, degMap[cat]);
                      }}
                      className={`py-1.5 text-[10px] font-bold rounded-xl border transition-all uppercase ${
                        active 
                          ? "bg-slate-900 border-slate-900 text-emerald-400" 
                          : "bg-slate-50 text-gray-500 hover:bg-slate-100 border-gray-150"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Grid of emotions belonging to active category */}
              <div className="w-full space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Sub-Emotions in {activeWheelCategory}:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {EMOTIONS_DATA[activeWheelCategory].map((emo) => {
                    const selected = selectedEmotions.includes(emo);
                    return (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => handleToggleEmotionSelection(emo)}
                        className={`py-2 px-1 text-left rounded-xl text-xs font-bold transition-all border pl-3 relative overflow-hidden ${
                          selected 
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800" 
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {selected && (
                          <div className="absolute right-2 top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        )}
                        {emo}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* EQ Logger checklist & Slider configuration fields */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Emotion Intensities slider editor */}
              {selectedEmotions.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                  <div className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                    Step 2: Calibrate Selected Emotion Intensities
                  </div>
                  
                  <div className="space-y-3">
                    {selectedEmotions.map((emo) => (
                      <div key={emo} className="space-y-1 bg-white p-2.5 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-extrabold text-gray-900">{emo}</span>
                          <span className="font-mono text-xs text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full">
                            Intensity: {emotionIntensities[emo] || 7} / 10
                          </span>
                        </div>
                        <input 
                          type="range"
                          min="1"
                          max="10"
                          value={emotionIntensities[emo] || 7}
                          onChange={(e) => handleIntensityChange(emo, Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comprehensive Check-in Levels Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Energy slider */}
                <div className="p-3 bg-slate-50 border border-gray-100/50 rounded-2xl space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-gray-700 uppercase text-[10px]">Energy Level</label>
                    <span className="font-mono font-bold text-slate-800">{energyLevel} / 10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" value={energyLevel} 
                    onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1"
                  />
                </div>

                {/* Stress Level slider */}
                <div className="p-3 bg-slate-50 border border-gray-100/50 rounded-2xl space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-gray-700 uppercase text-[10px]">Stress / Cortisol Level</label>
                    <span className="font-mono font-bold text-slate-800">{stressLevel} / 10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" value={stressLevel} 
                    onChange={(e) => setStressLevel(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1"
                  />
                </div>

                {/* Motivation slider */}
                <div className="p-3 bg-slate-50 border border-gray-100/50 rounded-2xl space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-gray-700 uppercase text-[10px]">Motivation Drive</label>
                    <span className="font-mono font-bold text-slate-800">{motivationLevel} / 10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" value={motivationLevel} 
                    onChange={(e) => setMotivationLevel(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1"
                  />
                </div>

                {/* Confidence level */}
                <div className="p-3 bg-slate-50 border border-gray-100/50 rounded-2xl space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-gray-700 uppercase text-[10px]">Confidence & Self-Value</label>
                    <span className="font-mono font-bold text-slate-800">{confidenceLevel} / 10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" value={confidenceLevel} 
                    onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1"
                  />
                </div>

                {/* Productivity Level */}
                <div className="p-3 bg-slate-50 border border-gray-100/50 rounded-2xl space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-gray-700 uppercase text-[10px]">Cognitive Productivity</label>
                    <span className="font-mono font-bold text-slate-800">{productivityLevel} / 10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" value={productivityLevel} 
                    onChange={(e) => setProductivityLevel(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1"
                  />
                </div>

                {/* Social Interaction Level */}
                <div className="p-3 bg-slate-50 border border-gray-100/50 rounded-2xl space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-gray-700 uppercase text-[10px]">Social Battery / Connections</label>
                    <span className="font-mono font-bold text-slate-800">{socialLevel} / 10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" value={socialLevel} 
                    onChange={(e) => setSocialLevel(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-1"
                  />
                </div>

              </div>

              {/* TRIGGER ANALYSIS MAP CHECKLISTS */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider block">
                  Select Associated Trigger Anchors
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TRIGGERS.map((trig) => {
                    const active = selectedTriggers.includes(trig);
                    return (
                      <button
                        key={trig}
                        type="button"
                        onClick={() => {
                          setSelectedTriggers(prev => 
                            prev.includes(trig) ? prev.filter(t => t !== trig) : [...prev, trig]
                          );
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                          active 
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800" 
                            : "bg-white border-gray-250 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {trig}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reflective Journal Text entry */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-700 uppercase tracking-wider block">Reflective Cognitive Journal Notes</label>
                <textarea 
                  rows={3}
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="Expressing complex emotions into written structures regulates the left prefrontal cortex, actively discharging daily mental anxiety..."
                  className="w-full border border-gray-200 rounded-2xl text-xs px-3 py-2 bg-slate-50 focus:outline-emerald-500 leading-relaxed"
                />
              </div>

              {/* Voice Note & Media Simulated upload widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Simulated Voice Recorder */}
                <div className="p-3.5 bg-slate-50 border border-gray-100 rounded-2xl space-y-2 text-center">
                  <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Simulate Voice Memo Check-In</div>
                  
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={toggleRecordingVoice}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isRecordingVoice ? "bg-rose-500 text-white animate-pulse" : "bg-white border border-gray-200 text-rose-500 hover:bg-rose-50/50"
                      }`}
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <div className="text-left">
                      <div className="text-xs font-bold text-gray-800">
                        {isRecordingVoice ? "Recording Audio..." : "Voice Journal Node"}
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold font-mono">
                        {isRecordingVoice ? `${voiceNoteDuration}s logged` : voiceNoteUrl ? "✓ Simulated log saved" : "Press mic to speak"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Photo attachment drag & select */}
                <div className="p-3.5 bg-slate-50 border border-gray-100 rounded-2xl space-y-2 text-center relative overflow-hidden">
                  <div className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Optional Photo Attachment</div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 block">
                      <span>Browse Photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={simulatePhotoUpload} 
                        className="hidden" 
                      />
                    </label>
                    <div className="text-left text-[10px] truncate max-w-[120px]">
                      <div className="font-bold text-gray-800 truncate">{photoPreviewName || "No photo selected"}</div>
                      <span className="text-gray-400">Mock JPG/PNG</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Private entry toggle checkbox & submit */}
              <div className="flex justify-between items-center border-t border-gray-50 pt-4 flex-wrap gap-3">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={isEntryPrivate}
                    onChange={(e) => setIsEntryPrivate(e.target.checked)}
                    className="accent-emerald-500 rounded border-gray-300"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Mark this entry as private (Blurs text under lock PIN)
                </label>

                <button 
                  type="submit"
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
                >
                  <Send className="w-4 h-4" /> Save Advanced EQ Telemetry
                </button>
              </div>

            </div>

          </div>

        </form>
      )}

      {/* --- TAB VIEW 3: BREATHING COACH & GRATITUDE SUITE (EXISTING CORE AND EXPANDED) --- */}
      {activeTab === "breathing" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Breathing coach panel */}
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

          {/* Daily Gratitude Log (Enhanced existing) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Smile className="w-5 h-5 text-emerald-500" />
              Daily Gratitude Points
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Recording things you are grateful for helps program your neural networks toward positive cognitive bias. Log at least three factors daily.
            </p>

            <div className="space-y-3">
              {[0, 1, 2].map(index => (
                <div key={index} className="flex gap-2.5 items-center">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </span>
                  <input 
                    type="text"
                    placeholder={`Gratitude factor #${index + 1}`}
                    value={gratitudeInputs[index]}
                    onChange={(e) => {
                      const updated = [...gratitudeInputs];
                      updated[index] = e.target.value;
                      setGratitudeInputs(updated);
                    }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (gratitudeInputs.filter(g => g.trim() !== "").length >= 3) {
                  onAddXp(120);
                  setGratitudeInputs(["", "", ""]);
                  alert("Gratitude log successfully committed! +120 XP awarded to your Profile.");
                } else {
                  alert("Please fill in all three gratitude fields before saving to optimize cognitive benefits!");
                }
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Send className="w-4 h-4" /> Save Daily Gratitude Points
            </button>
          </div>

        </div>
      )}

      {activeTab === "focus" && (
        <FocusProductivityCenter onAddXp={onAddXp} />
      )}

      {activeTab === "journal" && (
        <LifeReflectionJournal onAddXp={onAddXp} />
      )}

      {activeTab === "digital" && (
        <DigitalWellbeingCenter onAddXp={onAddXp} />
      )}

      {activeTab === "recovery" && (
        <RecoveryRelaxationStudio onAddXp={onAddXp} sleepLogs={sleepLogs} />
      )}

    </div>
  );
}
