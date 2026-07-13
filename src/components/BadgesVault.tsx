import React, { useState } from "react";
import { 
  Trophy, Droplets, Calendar, Sparkles, Flame, Heart, ShieldCheck, 
  Lock, Award, CheckCircle2, Star, RefreshCw, Milestone, FlameKindling
} from "lucide-react";
import { Habit, WaterLog, FoodLog, UserProfile } from "../types";

interface BadgesVaultProps {
  xpPoints: number;
  habits: Habit[];
  waterLogs: WaterLog[];
  foodLogs: FoodLog[];
  userProfile: UserProfile;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: "Hydration" | "Consistency" | "Fitness" | "XP" | "Wellness";
  requirement: string;
  unlocked: boolean;
  progress: number; // 0 to 100
  color: string; // e.g., 'blue', 'amber', 'emerald', 'purple', 'rose', 'teal'
  xpReward: number;
  iconType: "water" | "consistency" | "calendar" | "sparkles" | "flame" | "heart" | "shield";
}

export default function BadgesVault({
  xpPoints,
  habits,
  waterLogs,
  foodLogs,
  userProfile
}: BadgesVaultProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [celebratedBadge, setCelebratedBadge] = useState<Badge | null>(null);

  // Today's Date split
  const today = new Date().toISOString().split("T")[0];

  // Dynamic calculations
  const todayWater = waterLogs.filter(w => w.timestamp.startsWith(today)).reduce((s, w) => s + w.amountMl, 0);
  const maxHabitStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  const totalHabitsCompleted = habits.reduce((s, h) => s + h.completedDays.length, 0);
  const loggedFoodToday = foodLogs.some(f => f.timestamp.startsWith(today));

  // Determine badges list dynamically
  const badges: Badge[] = [
    {
      id: "hydration_hero",
      title: "Hydration Hero",
      description: "Hydrated effectively with 1000ml or more in a single day, fueling physical homeostasis.",
      category: "Hydration",
      requirement: "Log at least 1,000ml of water today or complete a hydration habit.",
      unlocked: todayWater >= 1000 || habits.some(h => h.name.toLowerCase().includes("water") && h.completedDays.includes(today)),
      progress: Math.min(100, Math.round((todayWater / 1000) * 100)),
      color: "blue",
      xpReward: 150,
      iconType: "water"
    },
    {
      id: "consistency_king",
      title: "Consistency King",
      description: "Demonstrated disciplined adherence by sustaining a 3-day streak on any core life habit.",
      category: "Consistency",
      requirement: "Achieve a habit streak of 3 days or higher.",
      unlocked: maxHabitStreak >= 3,
      progress: Math.min(100, Math.round((maxHabitStreak / 3) * 100)),
      color: "amber",
      xpReward: 200,
      iconType: "consistency"
    },
    {
      id: "habit_pioneer",
      title: "Habit Pioneer",
      description: "Successfully initiated habit transformation by clocking 5 total habit completions.",
      category: "Consistency",
      requirement: "Complete habits a total of 5 times or more.",
      unlocked: totalHabitsCompleted >= 5,
      progress: Math.min(100, Math.round((totalHabitsCompleted / 5) * 100)),
      color: "emerald",
      xpReward: 250,
      iconType: "calendar"
    },
    {
      id: "xp_enthusiast",
      title: "XP Enthusiast",
      description: "Climbed the developer/user health tier by accumulating 1,500 total Experience Points.",
      category: "XP",
      requirement: "Amass a total of 1,500 XP points.",
      unlocked: xpPoints >= 1500,
      progress: Math.min(100, Math.round((xpPoints / 1500) * 100)),
      color: "purple",
      xpReward: 100,
      iconType: "sparkles"
    },
    {
      id: "calorie_commander",
      title: "Calorie Commander",
      description: "Maintained optimal metabolic rate by tracking nutrition logs aligned with daily calorie target.",
      category: "Fitness",
      requirement: "Log food entries today while staying within target limits.",
      unlocked: loggedFoodToday,
      progress: loggedFoodToday ? 100 : 0,
      color: "rose",
      xpReward: 150,
      iconType: "flame"
    },
    {
      id: "apex_achiever",
      title: "Apex Achiever",
      description: "Unlocked the absolute pinnacle tier of gamified wellness with over 2,000 XP.",
      category: "XP",
      requirement: "Reach a milestone of 2,000 total XP points.",
      unlocked: xpPoints >= 2000,
      progress: Math.min(100, Math.round((xpPoints / 2000) * 100)),
      color: "teal",
      xpReward: 300,
      iconType: "shield"
    },
    {
      id: "longevity_sage",
      title: "Longevity Sage",
      description: "Acquired supreme physical optimization metrics indicating consistent compound lifestyle discipline.",
      category: "Wellness",
      requirement: "Reach 2,500 total XP or maintain any streak of 5 days.",
      unlocked: xpPoints >= 2500 || maxHabitStreak >= 5,
      progress: Math.min(100, Math.round((Math.max(xpPoints, maxHabitStreak * 500) / 2500) * 100)),
      color: "heart",
      xpReward: 500,
      iconType: "heart"
    }
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const filteredBadges = selectedCategory === "All" 
    ? badges 
    : badges.filter(b => b.category === selectedCategory);

  const getBadgeIcon = (type: string, unlocked: boolean) => {
    const cls = unlocked ? "w-7 h-7" : "w-7 h-7 opacity-40";
    switch(type) {
      case "water": return <Droplets className={`${cls} text-blue-500`} />;
      case "consistency": return <Trophy className={`${cls} text-amber-500`} />;
      case "calendar": return <Calendar className={`${cls} text-emerald-500`} />;
      case "sparkles": return <Sparkles className={`${cls} text-purple-500`} />;
      case "flame": return <Flame className={`${cls} text-rose-500`} />;
      case "heart": return <Heart className={`${cls} text-rose-600`} />;
      default: return <ShieldCheck className={`${cls} text-teal-500`} />;
    }
  };

  const getThemeColor = (color: string) => {
    switch(color) {
      case "blue": return { bg: "bg-blue-50/80 border-blue-100", accent: "text-blue-700 bg-blue-100/60", bar: "bg-blue-500" };
      case "amber": return { bg: "bg-amber-50/80 border-amber-100", accent: "text-amber-700 bg-amber-100/60", bar: "bg-amber-500" };
      case "emerald": return { bg: "bg-emerald-50/80 border-emerald-100", accent: "text-emerald-700 bg-emerald-100/60", bar: "bg-emerald-500" };
      case "purple": return { bg: "bg-purple-50/80 border-purple-100", accent: "text-purple-700 bg-purple-100/60", bar: "bg-purple-500" };
      case "rose": return { bg: "bg-rose-50/80 border-rose-100", accent: "text-rose-700 bg-rose-100/60", bar: "bg-rose-500" };
      case "teal": return { bg: "bg-teal-50/80 border-teal-100", accent: "text-teal-700 bg-teal-100/60", bar: "bg-teal-500" };
      default: return { bg: "bg-gray-50/80 border-gray-100", accent: "text-gray-700 bg-gray-100/60", bar: "bg-emerald-500" };
    }
  };

  return (
    <div className="space-y-6" id="badges_vault_container">
      
      {/* Vault Status Panel */}
      <div className="bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="badges_vault_hero">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <Award className="w-3.5 h-3.5" /> Virtual Badge System Enabled
          </span>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
            FitVita Interactive Trophy & Badge Vault
          </h2>
          <p className="text-xs text-gray-500 max-w-xl">
            Sustain milestones in water intake, habit consistency, and daily XP level-ups to unlock virtual medals. Your micro-habits compound into macro-achievements.
          </p>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex items-center gap-4 shrink-0 shadow-md">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl text-slate-950 animate-bounce">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black">{unlockedCount} / {badges.length}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Badges Unlocked</div>
            {/* Quick mini-progress indicator */}
            <div className="h-1.5 w-24 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full" 
                style={{ width: `${(unlockedCount / badges.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter Selector */}
      <div className="flex gap-2 pb-1 overflow-x-auto" id="badge_filters">
        {["All", "Hydration", "Consistency", "Fitness", "XP", "Wellness"].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat 
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/10" 
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-150/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="badges_grid">
        {filteredBadges.map(badge => {
          const theme = getThemeColor(badge.color);
          return (
            <div 
              key={badge.id}
              onClick={() => badge.unlocked && setCelebratedBadge(badge)}
              className={`p-6 rounded-[2rem] border transition-all flex flex-col justify-between h-[230px] relative overflow-hidden group ${
                badge.unlocked 
                  ? `${theme.bg} shadow-md hover:scale-[1.02] cursor-pointer` 
                  : "bg-gray-50/40 border-gray-200/60 opacity-65"
              }`}
            >
              {/* Background accent decor for unlocked */}
              {badge.unlocked && (
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/40 rounded-full blur-xl group-hover:scale-125 transition-all" />
              )}

              {/* Header block with badge status */}
              <div className="flex justify-between items-start">
                <div className={`p-3.5 rounded-2xl ${badge.unlocked ? 'bg-white shadow-xs' : 'bg-gray-200/50'} border border-gray-150/40`}>
                  {getBadgeIcon(badge.iconType, badge.unlocked)}
                </div>
                
                {badge.unlocked ? (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${theme.accent}`}>
                    <CheckCircle2 className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gray-200/60 text-gray-400 border border-gray-300/30">
                    <Lock className="w-3 h-3 text-gray-400" /> Locked
                  </span>
                )}
              </div>

              {/* Title & description */}
              <div className="space-y-1 my-3">
                <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                  {badge.title}
                  {badge.unlocked && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 animate-pulse" />}
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                  {badge.description}
                </p>
              </div>

              {/* Bottom stats/progress bar */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400">
                  <span className="truncate max-w-[170px]">Req: {badge.requirement}</span>
                  <span className="font-bold text-gray-700">{badge.progress}%</span>
                </div>
                
                <div className="h-2 w-full bg-gray-200/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${theme.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Aesthetic Milestone Celebrations */}
      {celebratedBadge && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full border border-gray-100 shadow-2xl relative text-center space-y-6 animate-fadeIn">
            
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setCelebratedBadge(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-yellow-50 flex items-center justify-center border-4 border-yellow-300 relative">
                {getBadgeIcon(celebratedBadge.iconType, true)}
                <div className="absolute -bottom-1 bg-yellow-400 text-slate-950 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                  🏆 Milestone
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                UNLOCKED AT Level {Math.floor(xpPoints / 1000) + 1}
              </span>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                Congratulations! You are a {celebratedBadge.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed px-2">
                {celebratedBadge.description}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-150/60 text-left space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-gray-600">
                <span>Earned Reward:</span>
                <span className="text-emerald-600">+{celebratedBadge.xpReward} XP Points</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-gray-600">
                <span>Milestone Type:</span>
                <span className="text-indigo-600">{celebratedBadge.category}</span>
              </div>
            </div>

            <button 
              onClick={() => setCelebratedBadge(null)}
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Acknowledge & Continue Scaling
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
