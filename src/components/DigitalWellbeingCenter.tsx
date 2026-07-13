import React, { useState, useEffect } from "react";
import { 
  Smartphone, Monitor, Eye, ShieldAlert, Award, Compass, Sparkles, 
  ToggleLeft, ToggleRight, ListTodo, VolumeX, PhoneOff, CheckCircle, 
  TrendingUp, BarChart3, AlertCircle, RefreshCw, Zap, Bell, Clock
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, Cell, PieChart, Pie
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

interface DigitalWellbeingCenterProps {
  onAddXp: (amount: number) => void;
}

interface DetoxChallenge {
  id: string;
  title: string;
  desc: string;
  xp: number;
  durationDays: number;
  isActive: boolean;
  isCompleted: boolean;
  category: "Social Media" | "Bedtime" | "Workplace" | "Physical Eye-care";
}

export default function DigitalWellbeingCenter({ onAddXp }: DigitalWellbeingCenterProps) {
  // --- Core State ---
  const [screenTimeMins, setScreenTimeMins] = useState<number>(195); // 3h 15m
  const [socialTimeMins, setSocialTimeMins] = useState<number>(110); // 1h 50m
  const [notificationPickups, setNotificationPickups] = useState<number>(45); // pick-ups count
  const [screenTargetMins, setScreenTargetMins] = useState<number>(180); // 3-hour limit
  const [focusModeActive, setFocusModeActive] = useState<boolean>(false);
  const [notificationsThrottled, setNotificationsThrottled] = useState<boolean>(false);

  // --- Device-Free Tracker State ---
  const [deviceFreeActive, setDeviceFreeActive] = useState<boolean>(false);
  const [deviceFreeSeconds, setDeviceFreeSeconds] = useState<number>(20 * 60); // 20 mins default
  const [deviceFreeInitial, setDeviceFreeInitial] = useState<number>(20 * 60);

  // --- Detox Challenges State ---
  const [challenges, setChallenges] = useState<DetoxChallenge[]>(() => {
    const cached = localStorage.getItem("fitvita_detox_challenges");
    if (cached) return JSON.parse(cached);
    return [
      { id: "1", title: "Sunday Digital Sabbatical", desc: "Keep device screen shut for 12 hours straight on Sunday.", xp: 250, durationDays: 1, isActive: false, isCompleted: false, category: "Social Media" },
      { id: "2", title: "Sunset Screen Squelch", desc: "No smartphone screens after 10:00 PM for 5 consecutive nights.", xp: 300, durationDays: 5, isActive: true, isCompleted: false, category: "Bedtime" },
      { id: "3", title: "Prefrontal Focus Blockout", desc: "Mute all notification banners during peak working hours (9 AM - 12 PM).", xp: 150, durationDays: 3, isActive: false, isCompleted: false, category: "Workplace" },
      { id: "4", title: "20-20-20 Micro-Pauses", desc: "Take a 20-second distant focus pause every 20 minutes of screen use.", xp: 100, durationDays: 7, isActive: true, isCompleted: false, category: "Physical Eye-care" }
    ];
  });

  // --- Eye Health Reminder States ---
  const [eyeReminderActive, setEyeReminderActive] = useState<boolean>(false);
  const [eyeSecondsLeft, setEyeSecondsLeft] = useState<number>(20 * 60); // 20 mins timer

  // --- Tab Selection ---
  const [activeTab, setActiveTab] = useState<"dashboard" | "detox" | "controls">("dashboard");

  // Save challenges to cache
  useEffect(() => {
    localStorage.setItem("fitvita_detox_challenges", JSON.stringify(challenges));
  }, [challenges]);

  // Screen Time incremental mockup
  useEffect(() => {
    let interval: NodeJS.Timeout;
    interval = setInterval(() => {
      if (!focusModeActive) {
        setScreenTimeMins(prev => prev + 1);
        if (Math.random() > 0.6) {
          setSocialTimeMins(prev => prev + 1);
        }
      }
    }, 120000); // add 1 minute every 2 minutes real-time for mock
    return () => clearInterval(interval);
  }, [focusModeActive]);

  // Device-Free Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (deviceFreeActive) {
      interval = setInterval(() => {
        setDeviceFreeSeconds(prev => {
          if (prev <= 1) {
            handleDeviceFreeComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [deviceFreeActive]);

  // Eye-health micro-break timer ticking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (eyeReminderActive) {
      interval = setInterval(() => {
        setEyeSecondsLeft(prev => {
          if (prev <= 1) {
            handleEyeBreakTrigger();
            return 20 * 60; // reset
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [eyeReminderActive]);

  const handleDeviceFreeComplete = () => {
    setDeviceFreeActive(false);
    const bonusXp = Math.round(deviceFreeInitial / 60) * 3;
    onAddXp(bonusXp);
    alert(`🌳 Fantastic! You successfully finished a ${Math.round(deviceFreeInitial / 60)}m Device-Free blockout. Earned +${bonusXp} XP!`);
    setDeviceFreeSeconds(20 * 60);
  };

  const handleEyeBreakTrigger = () => {
    onAddXp(10);
    alert("👁️ 20-20-20 Eye Health Alert! Rest your eyes now: Look at an object 20 feet away for 20 seconds. Earned +10 XP!");
  };

  // --- Algorithmic Digital Addiction Index ---
  const digitalAddictionScore = (() => {
    let score = 0;
    // Screen time weight
    score += Math.min(40, (screenTimeMins / 360) * 40);
    // Social Media weight
    score += Math.min(30, (socialTimeMins / screenTimeMins) * 30);
    // Notification pick-ups weight
    score += Math.min(30, (notificationPickups / 80) * 30);
    
    return Math.round(score);
  })();

  const addictionTier = () => {
    if (digitalAddictionScore >= 75) return { label: "Critical Hazard", color: "text-rose-600 bg-rose-50 border-rose-200" };
    if (digitalAddictionScore >= 45) return { label: "Moderate Reliance", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { label: "Healthy Autonomy", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  };

  // --- Toggle Challenge ---
  const handleToggleChallenge = (id: string) => {
    setChallenges(prev => prev.map(ch => {
      if (ch.id === id) {
        const updatedActive = !ch.isActive;
        if (updatedActive) {
          alert(`挑战激活! Challenge "${ch.title}" is now active in your behavioral pipeline.`);
        }
        return { ...ch, isActive: updatedActive };
      }
      return ch;
    }));
  };

  // --- Complete Challenge ---
  const handleCompleteChallenge = (id: string) => {
    setChallenges(prev => prev.map(ch => {
      if (ch.id === id) {
        onAddXp(ch.xp);
        alert(`🏆 Challenge Accomplished! Completed "${ch.title}"! Earned +${ch.xp} XP.`);
        return { ...ch, isCompleted: true, isActive: false };
      }
      return ch;
    }));
  };

  const formatMins = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return hrs > 0 ? `${hrs}h ${m}m` : `${m}m`;
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Chart data App Usage
  const appBreakdownData = [
    { name: "Social Networks", value: socialTimeMins, fill: "#f43f5e" },
    { name: "FitVita Health", value: 45, fill: "#10b981" },
    { name: "Productivity", value: 30, fill: "#0ea5e9" },
    { name: "Entertainment", value: screenTimeMins - socialTimeMins - 75, fill: "#eab308" }
  ];

  const recommendations = [
    { title: "Notification Squelch", desc: "You have picked up your device 45 times today. Throttle non-essential notification badges using the Throttler.", score: 90 },
    { title: "Eye Health Fatigue", desc: "Continuous screen gaze triggers ocular strain. Toggle the 20-20-20 Micro-break tracker to enforce healthy optical resets.", score: 85 },
    { title: "Detox Challenge Target", desc: "Activate 'Sunset Screen Squelch' to trigger pre-sleep melatonin production and improve deep sleep architecture.", score: 75 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Mini tabs switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-gray-200">
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
            activeTab === "dashboard" ? "bg-slate-900 text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📱 Screen Time Dashboard
        </button>
        <button 
          onClick={() => setActiveTab("detox")}
          className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
            activeTab === "detox" ? "bg-slate-900 text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          🌳 Detox Challenges
        </button>
        <button 
          onClick={() => setActiveTab("controls")}
          className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
            activeTab === "controls" ? "bg-slate-900 text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          ⚙️ Wellbeing Gates
        </button>
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main screen metrics column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Screen Time Main Meter */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    TOTAL MEASURED SCREEN ENGAGEMENT
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                    {formatMins(screenTimeMins)}
                    <span className="text-xs text-gray-500 font-bold">today</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    TARGET CEILING
                  </span>
                  <div className="text-md font-bold text-slate-800 mt-1">
                    {formatMins(screenTargetMins)}
                  </div>
                </div>
              </div>

              {/* Progress Bar limit */}
              <div className="space-y-1">
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      screenTimeMins > screenTargetMins ? "bg-rose-500" : "bg-slate-900"
                    }`}
                    style={{ width: `${Math.min(100, (screenTimeMins / screenTargetMins) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                  <span>Threshold Progress: {Math.round((screenTimeMins / screenTargetMins) * 100)}%</span>
                  {screenTimeMins > screenTargetMins && (
                    <span className="text-rose-500 font-black animate-pulse flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Screen Target Ceiling Breached
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div className="bg-slate-50 p-3 rounded-2xl border border-gray-200/40">
                  <span className="text-xs text-gray-500 block font-bold">Social Media Gaze</span>
                  <strong className="text-lg font-black text-slate-900 block mt-1">{formatMins(socialTimeMins)}</strong>
                  <span className="text-[9px] text-gray-400 leading-tight block mt-0.5">
                    {Math.round((socialTimeMins / screenTimeMins) * 100)}% of cumulative time
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-gray-200/40">
                  <span className="text-xs text-gray-500 block font-bold">Physical Pick-ups</span>
                  <strong className="text-lg font-black text-slate-900 block mt-1">{notificationPickups} pick-ups</strong>
                  <span className="text-[9px] text-gray-400 leading-tight block mt-0.5">
                    Average: 1 pick-up every 16 minutes
                  </span>
                </div>
              </div>
            </div>

            {/* App Usage Breakdown Chart */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                APP USAGE BREAKDOWN BY CLASSIFICATION
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appBreakdownData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={90} />
                    <Tooltip />
                    <Bar dataKey="value" name="Minutes" radius={[0, 4, 4, 0]}>
                      {appBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Addiction Index and Challenges Column */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Digital Addiction Score Card */}
            <div className={`p-6 rounded-3xl border shadow-xs space-y-4 transition-all ${addictionTier().color}`}>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider bg-slate-900/10 px-2 py-0.5 rounded-full text-slate-800">
                  ADDICTIONS LEDGER INDEX
                </span>
                <div className="flex justify-between items-center mt-2.5">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="w-5 h-5 text-slate-800" />
                    {addictionTier().label}
                  </h3>
                  <span className="text-xl font-mono font-black text-slate-800 bg-white/60 px-2.5 py-1 rounded-xl">
                    {digitalAddictionScore}/100
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Your calculated cognitive addiction score is derived from pick-ups count, total screens logged, and social app proportions. {digitalAddictionScore >= 45 ? "Slight neural dependence detected. Throttling quiet hours is advised." : "Excellent self-regulatory autonomy."}
              </p>

              <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    digitalAddictionScore >= 75 ? "bg-rose-500" :
                    digitalAddictionScore >= 45 ? "bg-amber-500" :
                    "bg-emerald-500"
                  }`} 
                  style={{ width: `${digitalAddictionScore}%` }}
                />
              </div>
            </div>

            {/* Smart Digital Recommendations */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <h4 className="text-xs font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> WELLBEING STRATEGIES
              </h4>

              <div className="space-y-3.5">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-xs font-black text-white block">{rec.title}</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {rec.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "detox" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-md font-black text-slate-900 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-slate-800" />
              Active Digital Detox Challenges
            </h3>
            <p className="text-xs text-gray-500">Lock yourself out of non-essential triggers to reset dopamine baselines and optical focus.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map(ch => (
                <div key={ch.id} className={`p-5 rounded-3xl border flex flex-col justify-between space-y-3 relative overflow-hidden transition-all hover:shadow-md ${
                  ch.isCompleted ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-gray-200/60"
                }`}>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black uppercase text-gray-400">
                        {ch.category} • {ch.durationDays} Day{ch.durationDays > 1 ? "s" : ""}
                      </span>
                      {ch.isCompleted ? (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase">
                          Completed
                        </span>
                      ) : ch.isActive ? (
                        <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md uppercase animate-pulse">
                          Active Loop
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-gray-400 bg-slate-200 px-2 py-0.5 rounded-md uppercase">
                          Dormant
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-slate-900">{ch.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">{ch.desc}</p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200/50">
                    <span className="text-xs font-mono font-black text-slate-900">+{ch.xp} XP reward</span>
                    
                    {!ch.isCompleted && (
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleToggleChallenge(ch.id)}
                          className={`px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all ${
                            ch.isActive ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-white hover:bg-slate-800"
                          }`}
                        >
                          {ch.isActive ? "Pause" : "Activate"}
                        </button>
                        {ch.isActive && (
                          <button 
                            onClick={() => handleCompleteChallenge(ch.id)}
                            className="px-3 py-1.5 text-[10px] font-black bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg uppercase tracking-wider"
                          >
                            Verify Claim
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "controls" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Real-time Focus Blockout Gates */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5 border-b border-gray-100 pb-3">
              <PhoneOff className="w-4 h-4 text-slate-800" />
              Device-Free Time Lockout
            </h4>
            <p className="text-xs text-gray-500">
              Flip your smartphone face down. We simulate a total peripheral sensory lockout. Touch target: 20 minutes minimum.
            </p>

            <div className="py-8 flex flex-col items-center justify-center space-y-4 bg-slate-50 rounded-2xl border border-gray-100">
              <div className="w-36 h-36 rounded-full border-4 border-slate-950 flex flex-col items-center justify-center relative bg-white shadow-inner">
                <span className="text-2xl font-mono font-black text-slate-900">
                  {formatSeconds(deviceFreeSeconds)}
                </span>
                <span className="text-[8px] font-black uppercase text-slate-400 mt-1">
                  {deviceFreeActive ? "Lock active" : "Unlocked"}
                </span>
              </div>

              <div className="flex gap-2">
                {!deviceFreeActive ? (
                  <button 
                    onClick={() => {
                      setDeviceFreeActive(true);
                      onAddXp(15);
                    }}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Initiate Device-Free Block
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setDeviceFreeActive(false);
                      setDeviceFreeSeconds(20 * 60);
                    }}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all animate-pulse"
                  >
                    Break Sensory Gate (Abort)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Eye Health and Notification Filters */}
          <div className="space-y-6">
            
            {/* Eye Break config */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-slate-800" />
                    20-20-20 Eye Health Guardian
                  </h4>
                  <p className="text-[10px] text-gray-500">Receive periodic optic relaxation alerts every 20 minutes</p>
                </div>
                
                <button
                  onClick={() => {
                    setEyeReminderActive(!eyeReminderActive);
                    onAddXp(20);
                  }}
                  className="text-slate-800"
                >
                  {eyeReminderActive ? (
                    <ToggleRight className="w-9 h-9 text-emerald-500 fill-current" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-300" />
                  )}
                </button>
              </div>

              {eyeReminderActive && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-200/60 flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-600">Next ocular recalibration sweep in:</span>
                  <strong className="font-mono text-slate-900 bg-white border px-2 py-0.5 rounded-lg">
                    {formatSeconds(eyeSecondsLeft)}
                  </strong>
                </div>
              )}
            </div>

            {/* Notification Filter */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3">
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-slate-800" />
                    Prefrontal Notification Throttler
                  </h4>
                  <p className="text-[10px] text-gray-500">Mute dynamic background banners during focus loops</p>
                </div>

                <button
                  onClick={() => {
                    setNotificationsThrottled(!notificationsThrottled);
                    onAddXp(15);
                  }}
                  className="text-slate-800"
                >
                  {notificationsThrottled ? (
                    <ToggleRight className="w-9 h-9 text-slate-900 fill-current" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-300" />
                  )}
                </button>
              </div>

              <div className="space-y-1.5">
                {[
                  { app: "Social Messenger (Meta)", limit: "Silent block active", active: notificationsThrottled },
                  { app: "System Mail (IMAP)", limit: "Digest every 2 hours", active: notificationsThrottled },
                  { app: "FitVita Health alerts", limit: "Unrestricted biometric sweeps", active: false }
                ].map((app, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-lg border border-gray-200/50">
                    <span className="font-bold text-slate-700">{app.app}</span>
                    <span className={`font-black ${app.active ? "text-rose-500 animate-pulse" : "text-emerald-600"}`}>
                      {app.active ? app.limit : "Unrestricted flow"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
