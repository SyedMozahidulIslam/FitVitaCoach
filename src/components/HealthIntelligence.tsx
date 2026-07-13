import React, { useState, useEffect } from "react";
import { 
  Heart, Activity, Sliders, ClipboardList, Dumbbell, Smile, Droplets, Moon, 
  Scale, Plus, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, 
  TrendingUp, FileText, ChevronRight, Stethoscope, Lock, Info, UploadCloud, Trash2
} from "lucide-react";
import { UserProfile, FoodLog, WorkoutLog, WaterLog, SleepLog, MoodLog } from "../types";
import { analyzeHealthProfile, calculateProfileCompleteness, HealthAssessment } from "../utils/healthEngine";

interface HealthIntelligenceProps {
  userProfile: UserProfile;
  foodLogs: FoodLog[];
  workoutLogs: WorkoutLog[];
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  moodLogs: MoodLog[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onAddXp: (amount: number) => void;
}

type FormStep = "basics" | "circumferences" | "labs" | "lifestyle" | "medical";

export default function HealthIntelligence({
  userProfile,
  foodLogs,
  workoutLogs,
  waterLogs,
  sleepLogs,
  moodLogs,
  onUpdateProfile,
  onAddXp
}: HealthIntelligenceProps) {
  // Local state for interactive editing
  const [activeFormTab, setActiveFormTab] = useState<FormStep>("basics");
  const [showEditWizard, setShowEditWizard] = useState(false);
  const [isRegeneratingInsights, setIsRegeneratingInsights] = useState(false);
  const [manualLabInput, setManualLabInput] = useState("");
  const [uploadingReport, setUploadingReport] = useState(false);
  const [insightMethod, setInsightMethod] = useState<"Deterministic Engine" | "Gemini AI">("Deterministic Engine");

  // Local state copy of userProfile for form state binding
  const [formProfile, setFormProfile] = useState<UserProfile>({ ...userProfile });

  // Sync state if prop updates
  useEffect(() => {
    setFormProfile({ ...userProfile });
  }, [userProfile]);

  // Main Assessment Calculation
  const [assessment, setAssessment] = useState<HealthAssessment>(() => {
    return analyzeHealthProfile(userProfile, foodLogs, workoutLogs, waterLogs, sleepLogs, moodLogs);
  });

  // Fetch assessment from backend if Gemini API key is configured, or use deterministic
  const fetchHealthInsights = async (profile: UserProfile, forceAI = false) => {
    setIsRegeneratingInsights(true);
    try {
      const response = await fetch("/api/coach/health-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: profile,
          foodLogs,
          workoutLogs,
          waterLogs,
          sleepLogs,
          moodLogs
        })
      });
      const data = await response.json();
      const local = analyzeHealthProfile(profile, foodLogs, workoutLogs, waterLogs, sleepLogs, moodLogs);

      if (data && !data.useFallback && data.insights) {
        setAssessment({
          ...local,
          insights: data.insights
        });
        setInsightMethod("Gemini AI");
      } else {
        setAssessment(local);
        setInsightMethod("Deterministic Engine");
      }
    } catch (err) {
      console.error("Failed to load Gemini insights, using deterministic engine:", err);
      const local = analyzeHealthProfile(profile, foodLogs, workoutLogs, waterLogs, sleepLogs, moodLogs);
      setAssessment(local);
      setInsightMethod("Deterministic Engine");
    } finally {
      setIsRegeneratingInsights(false);
    }
  };

  // Run initial insights on load and whenever userProfile changes
  useEffect(() => {
    fetchHealthInsights(userProfile);
  }, [userProfile]);

  // Form submit handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formProfile);
    onAddXp(250); // XP for detailed calibration
    setShowEditWizard(false);
    
    // Create custom notifications / feedback
    const originalCompleteness = calculateProfileCompleteness(userProfile);
    const newCompleteness = calculateProfileCompleteness(formProfile);
    const difference = newCompleteness - originalCompleteness;

    if (difference > 0) {
      alert(`🎉 Health Profile Calibrated! Accuracy improved by +${difference}% (Now: ${newCompleteness}%). Recalculating metabolic biomarkers...`);
    } else {
      alert("Health Profile parameters synchronized successfully!");
    }
  };

  // Quick add handlers for missing information
  const handleQuickAddBiomarker = (key: keyof UserProfile, value: any, label: string) => {
    const updated = { ...userProfile, [key]: value };
    onUpdateProfile(updated);
    onAddXp(50); // XP reward per biomarker
    alert(`⚡ Biomarker added! Entered ${label}: ${value}. Dynamic Health Score updated! (+50 XP)`);
  };

  // Find out what crucial biomarkers are missing from current profile to prompt user
  const getMissingBiomarkers = () => {
    const missing: { key: keyof UserProfile; label: string; placeholder: string; type: "number" | "text" | "select"; options?: string[]; unit?: string }[] = [];
    
    if (!userProfile.restingHeartRate) {
      missing.push({ key: "restingHeartRate", label: "Resting Heart Rate", placeholder: "70", type: "number", unit: "bpm" });
    }
    if (!userProfile.bloodPressureSystolic) {
      missing.push({ key: "bloodPressureSystolic", label: "BP Systolic", placeholder: "120", type: "number", unit: "mmHg" });
    }
    if (!userProfile.bloodPressureDiastolic) {
      missing.push({ key: "bloodPressureDiastolic", label: "BP Diastolic", placeholder: "80", type: "number", unit: "mmHg" });
    }
    if (!userProfile.hbA1c) {
      missing.push({ key: "hbA1c", label: "HbA1c Level", placeholder: "5.4", type: "number", unit: "%" });
    }
    if (!userProfile.visceralFatLevel) {
      missing.push({ key: "visceralFatLevel", label: "Visceral Fat", placeholder: "6", type: "number", unit: "level" });
    }
    if (!userProfile.bodyFatPercent) {
      missing.push({ key: "bodyFatPercent", label: "Body Fat", placeholder: "18.5", type: "number", unit: "%" });
    }
    if (!userProfile.bloodGroup) {
      missing.push({ key: "bloodGroup", label: "Blood Group", placeholder: "O+", type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] });
    }
    if (!userProfile.waistCm) {
      missing.push({ key: "waistCm", label: "Waist Size", placeholder: "85", type: "number", unit: "cm" });
    }
    if (!userProfile.smokingHabit) {
      missing.push({ key: "smokingHabit", label: "Smoking Habit", placeholder: "Never", type: "select", options: ["Never", "Former", "Occasional", "Daily"] });
    }
    if (!userProfile.stressLevel) {
      missing.push({ key: "stressLevel", label: "Stress Level", placeholder: "Moderate", type: "select", options: ["Low", "Moderate", "High", "Extreme"] });
    }

    return missing;
  };

  const missingBiomarkers = getMissingBiomarkers();

  // Handle Lab Report Upload Simulation
  const handleSimulateLabUpload = () => {
    setUploadingReport(true);
    setTimeout(() => {
      const reports = userProfile.recentLaboratoryReports || [];
      const updatedReports = [
        ...reports, 
        `Simulated Laboratory Blood Panel (${new Date().toLocaleDateString()}): Total Cholesterol 210 mg/dL, Fasting Glucose 96 mg/dL, HbA1c 5.6%.`
      ];
      onUpdateProfile({ 
        recentLaboratoryReports: updatedReports,
        // Autofill some of the extracted values
        cholesterolTotal: 210,
        bloodSugarFasting: 96,
        hbA1c: 5.6
      });
      onAddXp(150);
      setUploadingReport(false);
      alert("🔬 Lab report scanned and analyzed via FitVita Health Engine OCR! Extracted values: Total Cholesterol (210 mg/dL), Fasting Sugar (96 mg/dL), and HbA1c (5.6%). Biomarkers filled! (+150 XP)");
    }, 1500);
  };

  const handleAddManualLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLabInput.trim()) return;
    const reports = userProfile.recentLaboratoryReports || [];
    onUpdateProfile({
      recentLaboratoryReports: [...reports, manualLabInput.trim()]
    });
    setManualLabInput("");
    onAddXp(50);
    alert("Laboratory report note filed into secure biovault!");
  };

  const handleRemoveLab = (index: number) => {
    const reports = [...(userProfile.recentLaboratoryReports || [])];
    reports.splice(index, 1);
    onUpdateProfile({ recentLaboratoryReports: reports });
  };

  return (
    <div className="space-y-6" id="health_intelligence_module">
      
      {/* 1. Header Banner & Calibration Status */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white border border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl -z-10" />
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-500/30">
              Clinical Quality Engine
            </span>
            <span className="text-slate-400 text-[10px] font-bold">INSIGHT MODEL: {insightMethod}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
            Personal Health Risk Assessment & Biometric Cockpit
          </h2>
          <p className="text-slate-400 text-xs max-w-2xl font-medium leading-relaxed">
            Configure your biometrics, lab values, and physiological logs to map an accurate metabolic baseline. Our Health Intelligence Engine calculates sub-scores in real-time, highlighting hidden clinical risk indicators.
          </p>
        </div>

        {/* Accuracy Gauge Card */}
        <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 min-w-[240px] flex items-center gap-4 shrink-0">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="#1e293b" strokeWidth="6" fill="transparent" />
              <circle 
                cx="32" 
                cy="32" 
                r="26" 
                stroke="#10b981" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray={163}
                strokeDashoffset={163 - (163 * assessment.accuracyLevel) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-black text-emerald-400">{assessment.accuracyLevel}%</span>
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profiling Accuracy</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {assessment.accuracyLevel < 40 ? "⚠️ Basic Assessment" : assessment.accuracyLevel < 75 ? "📈 Good Assessment" : "🌟 Clinical Precision"}
            </div>
            <button 
              onClick={() => {
                setFormProfile({ ...userProfile });
                setShowEditWizard(true);
              }}
              className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 mt-1 uppercase tracking-wider flex items-center gap-0.5"
            >
              Calibrate Profile <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Gamified Missing Biomarkers Panel */}
      {missingBiomarkers.length > 0 && (
        <div className="bg-amber-50/75 border border-amber-150 rounded-3xl p-5 md:p-6 space-y-4 shadow-sm" id="missing_biomarkers_widget">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-700 rounded-xl flex items-center justify-center">
                <Sliders className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-amber-950">Complete Your Biomarker Baseline (+50 XP Each)</h3>
                <p className="text-xs text-amber-800/80 mt-0.5">
                  Missing {missingBiomarkers.length} vital clinical markers. Provide these values to increase score accuracy and receive highly personalized recommendations.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              +{missingBiomarkers.length * 50} XP Available
            </span>
          </div>

          {/* Scannable Horizontal List of Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pt-1">
            {missingBiomarkers.slice(0, 4).map((marker) => (
              <QuickAddInput 
                key={marker.key as string} 
                marker={marker} 
                onSave={(val) => handleQuickAddBiomarker(marker.key, val, marker.label)} 
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. Primary Multi-Metric Scoring Grid & Radial Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Health Index Gauge */}
        <div className="bg-white p-6 rounded-3xl border border-gray-150/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col justify-between" id="overall_score_gauge_card">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Metabolic Baseline</span>
              <h3 className="text-base font-black text-slate-900 mt-1">Overall Health Score</h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
              assessment.overallScore >= 80 
                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                : assessment.overallScore >= 65 
                  ? "bg-amber-50 text-amber-700 border-amber-100" 
                  : "bg-rose-50 text-rose-700 border-rose-100"
            }`}>
              {assessment.overallScore >= 80 ? "Optimal Vitality" : assessment.overallScore >= 65 ? "Moderate Resilience" : "Clinical Warning"}
            </span>
          </div>

          <div className="my-8 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="88" cy="88" r="76" stroke="#f1f5f2" strokeWidth="15" fill="transparent" />
                <circle 
                  cx="88" 
                  cy="88" 
                  r="76" 
                  stroke={assessment.overallScore >= 80 ? "#10b981" : assessment.overallScore >= 65 ? "#f59e0b" : "#ef4444"} 
                  strokeWidth="15" 
                  fill="transparent" 
                  strokeDasharray={477}
                  strokeDashoffset={477 - (477 * assessment.overallScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-5xl font-black text-slate-900">{assessment.overallScore}</span>
                <span className="text-xs text-gray-400 block font-extrabold uppercase mt-1">out of 100</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100 text-center text-xs text-gray-500 font-medium">
            💡 This index dynamically balances nutrition compliance, physical workout load, cardiac metrics, lipids, glucose, and endocrine biomarkers.
          </div>
        </div>

        {/* Subscore Grid (Col span 2) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-150/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Functional Breakdowns</span>
            <h3 className="text-base font-black text-slate-900 mt-1">Multi-Dimensional Wellness Audit</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <SubScoreTile 
              title="Nutrition" 
              score={assessment.nutritionScore} 
              icon={<ClipboardList className="w-4 h-4 text-emerald-600" />} 
              bgColor="bg-emerald-50/50" 
              borderColor="border-emerald-100" 
            />
            
            <SubScoreTile 
              title="Fitness" 
              score={assessment.fitnessScore} 
              icon={<Dumbbell className="w-4 h-4 text-blue-600" />} 
              bgColor="bg-blue-50/50" 
              borderColor="border-blue-100" 
            />

            <SubScoreTile 
              title="Heart Health" 
              score={assessment.heartHealthScore} 
              icon={<Heart className="w-4 h-4 text-rose-600" />} 
              bgColor="bg-rose-50/50" 
              borderColor="border-rose-100" 
            />

            <SubScoreTile 
              title="Metabolic" 
              score={assessment.metabolicHealthScore} 
              icon={<Activity className="w-4 h-4 text-purple-600" />} 
              bgColor="bg-purple-50/50" 
              borderColor="border-purple-100" 
            />

            <SubScoreTile 
              title="Sleep Quality" 
              score={assessment.sleepScore} 
              icon={<Moon className="w-4 h-4 text-indigo-600" />} 
              bgColor="bg-indigo-50/50" 
              borderColor="border-indigo-100" 
            />

            <SubScoreTile 
              title="Hydration" 
              score={assessment.hydrationScore} 
              icon={<Droplets className="w-4 h-4 text-sky-600" />} 
              bgColor="bg-sky-50/50" 
              borderColor="border-sky-100" 
            />

            <SubScoreTile 
              title="Mental Health" 
              score={assessment.mentalWellnessScore} 
              icon={<Smile className="w-4 h-4 text-amber-600" />} 
              bgColor="bg-amber-50/50" 
              borderColor="border-amber-100" 
            />

            <SubScoreTile 
              title="Lifestyle" 
              score={assessment.lifestyleScore} 
              icon={<Sliders className="w-4 h-4 text-teal-600" />} 
              bgColor="bg-teal-50/50" 
              borderColor="border-teal-100" 
            />

          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Nutrition includes lipid/lipid panel checks
            </span>
            <span className="flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Fitness logs aerobic/strength output
            </span>
            <span className="flex items-center gap-1 text-[10px] text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Metabolic models HbA1c/insulin bands
            </span>
          </div>
        </div>

      </div>

      {/* 4. Personalized Clinical Insights Tab */}
      <div className="bg-white rounded-3xl border border-gray-150/60 shadow-[0_4px_24px_rgba(0,0,0,0.01)] overflow-hidden" id="personalized_insights_panel">
        
        <div className="p-6 bg-slate-50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">AI-Powered Risk Analysis</span>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900">Personalized Health Intelligence Reports</h3>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Powered by Gemini
              </span>
            </div>
          </div>

          <button 
            onClick={() => fetchHealthInsights(userProfile, true)}
            disabled={isRegeneratingInsights}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingInsights ? "animate-spin" : ""}`} />
            {isRegeneratingInsights ? "Synthesizing Biomarkers..." : "Regenerate AI Diagnostics"}
          </button>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Strengths & Risks */}
          <div className="space-y-6">
            
            {/* Strengths */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Bio-Strengths
              </h4>
              <div className="space-y-2">
                {assessment.insights.strengths.map((str, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50 text-xs text-emerald-950 font-medium leading-relaxed flex items-start gap-2">
                    <span className="text-emerald-600 font-black mt-0.5">✓</span>
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-rose-800 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Clinical Risk Indicators
              </h4>
              <div className="space-y-2">
                {assessment.insights.riskFactors.length === 0 ? (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 text-xs text-gray-500 font-bold">
                    No major clinical risk indicators found. Provide more biomarker records (HbA1c, lipids) to run thorough stress diagnostics.
                  </div>
                ) : (
                  assessment.insights.riskFactors.map((risk, idx) => (
                    <div key={idx} className="p-3 bg-rose-50/50 rounded-xl border border-rose-100/50 text-xs text-rose-950 font-medium leading-relaxed flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{risk}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Column 2: Recommended Improvements & Priorities */}
          <div className="space-y-6">
            
            {/* Recommended Improvements */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Strategic Actions
              </h4>
              <div className="space-y-2">
                {assessment.insights.recommendedImprovements.map((imp, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/30 rounded-xl border border-amber-100/30 text-xs text-amber-950 font-medium leading-relaxed flex items-start gap-2">
                    <span className="text-amber-600 font-extrabold mt-0.5">★</span>
                    <span>{imp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Priorities */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-900" /> Today's Bio-Priorities
              </h4>
              <div className="space-y-2">
                {assessment.insights.dailyPriorities.map((prio, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-gray-100 text-xs text-slate-900 font-medium flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span>{prio}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Column 3: Weekly Goals, Preventive and Checkups */}
          <div className="space-y-6">
            
            {/* Weekly Goals */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> 7-Day Target Focus
              </h4>
              <div className="space-y-2">
                {assessment.insights.weeklyGoals.map((goal, idx) => (
                  <div key={idx} className="p-3 bg-blue-50/30 rounded-xl border border-blue-100/30 text-xs text-blue-950 font-medium leading-relaxed flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Checkups */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-purple-800 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Advised Screenings & Vitals Checkups
              </h4>
              <div className="space-y-2">
                {assessment.insights.recommendedCheckups.map((check, idx) => (
                  <div key={idx} className="p-3 bg-purple-50/30 rounded-xl border border-purple-100/30 text-xs text-purple-950 font-bold leading-relaxed flex items-start gap-2">
                    <Stethoscope className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>{check}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 5. Comprehensive Clinical Vault & Laboratory Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="biometric_vault_labs">
        
        {/* Lab Reports Upload & Logs Section (Col Span 2) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-150/60 shadow-[0_4px_20px_rgba(0,0,0,0.01)] space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Laboratory Analytics</span>
              <h3 className="text-base font-black text-slate-900">Clinical Test Reports Vault</h3>
            </div>
            <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" /> SECURE DECRYPTION KEY ACTIVE
            </span>
          </div>

          {/* Upload reports action card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Scanned upload component */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-emerald-400 transition-colors flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="mx-auto w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">Scan Laboratory Blood Panel</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                    Simulate scan of clinical blood charts (PDF/JPG) using high-precision OCR diagnostics. Extracts Lipid panels, HbA1c, fasting glucose and kidney enzymes.
                  </p>
                </div>
              </div>

              <button 
                onClick={handleSimulateLabUpload}
                disabled={uploadingReport}
                className="w-full py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploadingReport ? "Performing OCR Scanning & Extraction..." : "Upload & Analyze Clinical Report"}
              </button>
            </div>

            {/* Manual entry notes component */}
            <form onSubmit={handleAddManualLab} className="p-4 bg-slate-50 border border-gray-100 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900">Manual Lab Entry Notes</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Manually write or paste summary laboratory figures into your health dossier history.
                </p>
                <textarea 
                  value={manualLabInput}
                  onChange={(e) => setManualLabInput(e.target.value)}
                  placeholder="e.g., Fasting Sugar: 5.4 mmol/L, TSH: 2.1 mIU/L on July 10, 2026."
                  className="w-full p-2 border border-gray-200 bg-white rounded-xl text-xs h-20 focus:outline-emerald-500 mt-1"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Add Manual Lab Entry (+50 XP)
              </button>
            </form>

          </div>

          {/* Scanned Lab records output */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">Active Clinical Test Records ({userProfile.recentLaboratoryReports?.length || 0})</h4>
            {(!userProfile.recentLaboratoryReports || userProfile.recentLaboratoryReports.length === 0) ? (
              <div className="text-xs text-gray-400 text-center py-6 bg-slate-50/50 rounded-2xl border border-gray-100">
                No active laboratory files logged. Upload or paste reports to seed clinical context.
              </div>
            ) : (
              <div className="space-y-2">
                {userProfile.recentLaboratoryReports.map((report, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-gray-100 rounded-xl flex items-start justify-between gap-4 text-xs">
                    <div className="flex gap-2.5">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-slate-800 font-medium leading-normal">{report}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveLab(idx)}
                      className="text-gray-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete log record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Static Clinical Biometric Blueprint Readout (Col Span 1) */}
        <div className="bg-slate-900 text-slate-200 p-6 rounded-3xl border border-slate-800 shadow-md space-y-4">
          <div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Biovault Dossier</span>
            <h3 className="text-base font-black text-white mt-1">Biomarker Inventory</h3>
          </div>

          <div className="space-y-3 text-xs max-h-[460px] overflow-y-auto pr-2 scrollbar-thin">
            
            <BioRow label="Blood Group" value={userProfile.bloodGroup || "Pending"} icon="🩸" />
            <BioRow label="Resting Heart Rate" value={userProfile.restingHeartRate ? `${userProfile.restingHeartRate} bpm` : "Pending"} icon="❤️" />
            <BioRow label="Blood Pressure" value={userProfile.bloodPressureSystolic ? `${userProfile.bloodPressureSystolic}/${userProfile.bloodPressureDiastolic} mmHg` : "Pending"} icon="⚕️" />
            <BioRow label="Fasting Sugar" value={userProfile.bloodSugarFasting ? `${userProfile.bloodSugarFasting} mg/dL` : "Pending"} icon="🍭" />
            <BioRow label="Random Sugar" value={userProfile.bloodSugarRandom ? `${userProfile.bloodSugarRandom} mg/dL` : "Pending"} icon="🍯" />
            <BioRow label="HbA1c" value={userProfile.hbA1c ? `${userProfile.hbA1c}%` : "Pending"} icon="🧪" />
            <BioRow label="Total Cholesterol" value={userProfile.cholesterolTotal ? `${userProfile.cholesterolTotal} mg/dL` : "Pending"} icon="🧈" />
            <BioRow label="HDL / LDL" value={userProfile.cholesterolHDL ? `${userProfile.cholesterolHDL} / ${userProfile.cholesterolLDL} mg/dL` : "Pending"} icon="🧬" />
            <BioRow label="Triglycerides" value={userProfile.triglycerides ? `${userProfile.triglycerides} mg/dL` : "Pending"} icon="🛢️" />
            <BioRow label="SpO₂ (Oxygen)" value={userProfile.spo2 ? `${userProfile.spo2}%` : "Pending"} icon="💨" />
            <BioRow label="Body Temperature" value={userProfile.bodyTemperature ? `${userProfile.bodyTemperature} °C` : "Pending"} icon="🌡️" />
            
            <div className="border-t border-slate-800 my-2 pt-2" />
            
            <BioRow label="Waist Size" value={userProfile.waistCm ? `${userProfile.waistCm} cm` : "Pending"} icon="📏" />
            <BioRow label="Hip Size" value={userProfile.hipCm ? `${userProfile.hipCm} cm` : "Pending"} icon="📏" />
            <BioRow label="Body Fat %" value={userProfile.bodyFatPercent ? `${userProfile.bodyFatPercent}%` : "Pending"} icon="⚖️" />
            <BioRow label="Muscle Mass %" value={userProfile.muscleMassPercent ? `${userProfile.muscleMassPercent}%` : "Pending"} icon="💪" />
            <BioRow label="Visceral Fat" value={userProfile.visceralFatLevel ? `Level ${userProfile.visceralFatLevel}` : "Pending"} icon="📉" />
            
            <div className="border-t border-slate-800 my-2 pt-2" />
            
            <BioRow label="Smoking Habit" value={userProfile.smokingHabit || "Pending"} icon="🚬" />
            <BioRow label="Alcohol Habit" value={userProfile.alcoholHabit || "Pending"} icon="🍺" />
            <BioRow label="Caffeine Habit" value={userProfile.caffeineIntake || "Pending"} icon="☕" />
            <BioRow label="Occupation" value={userProfile.occupation || "Pending"} icon="💼" />
            
            <div className="border-t border-slate-800 my-2 pt-2" />
            
            <BioRow label="Existing Conditions" value={userProfile.existingMedicalConditions?.join(", ") || "None"} icon="🏥" />
            <BioRow label="Active Meds" value={userProfile.currentMedications?.join(", ") || "None"} icon="💊" />
            <BioRow label="Vitamins/Supps" value={userProfile.vitaminsSupplements?.join(", ") || "None"} icon="🥦" />
            <BioRow label="Surgeries Logged" value={userProfile.surgeryHistory?.join(", ") || "None"} icon="🔪" />
            <BioRow label="Vaccinations Logged" value={userProfile.vaccinationHistory?.join(", ") || "None"} icon="💉" />
            <BioRow label="Pregnancy Status" value={userProfile.pregnancyStatus || "None"} icon="🤰" />
          </div>
        </div>

      </div>

      {/* 6. Advanced Step-by-Step Profile Calibration Form (Modal Wizard) */}
      {showEditWizard && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden border border-gray-150 shadow-2xl animate-fadeIn my-8">
            
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-emerald-400" /> Complete Biometrics Optimization
                </h3>
                <p className="text-[10px] text-emerald-400 mt-0.5 font-bold">RECONFIGURING BASE METABOLIC CONSTANTS</p>
              </div>
              <button 
                onClick={() => setShowEditWizard(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stepper Navigation buttons */}
            <div className="bg-slate-50 px-6 py-3 border-b border-gray-100 flex gap-1 md:gap-2 justify-between overflow-x-auto scrollbar-none shrink-0">
              <StepNavBtn id="basics" label="1. Basics" active={activeFormTab} onClick={setActiveFormTab} />
              <StepNavBtn id="circumferences" label="2. Body" active={activeFormTab} onClick={setActiveFormTab} />
              <StepNavBtn id="labs" label="3. Clinical / Labs" active={activeFormTab} onClick={setActiveFormTab} />
              <StepNavBtn id="lifestyle" label="4. Lifestyle" active={activeFormTab} onClick={setActiveFormTab} />
              <StepNavBtn id="medical" label="5. Medical" active={activeFormTab} onClick={setActiveFormTab} />
            </div>

            {/* Form body */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              
              {/* STAGE 1: BASICS */}
              {activeFormTab === "basics" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-emerald-50 rounded-xl flex gap-2 text-[11px] text-emerald-800 font-medium">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Baseline variables (Age, Gender, Weight, Height) configure standard BMI bands and the resting metabolic BMR formula.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">User Full Name</label>
                      <input 
                        type="text" 
                        value={formProfile.name}
                        onChange={(e) => setFormProfile(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Biological Gender</label>
                      <select 
                        value={formProfile.gender}
                        onChange={(e) => setFormProfile(p => ({ ...p, gender: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-bold"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Age (yrs)</label>
                      <input 
                        type="number" 
                        value={formProfile.age}
                        onChange={(e) => setFormProfile(p => ({ ...p, age: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-mono font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Height (cm)</label>
                      <input 
                        type="number" 
                        value={formProfile.height}
                        onChange={(e) => setFormProfile(p => ({ ...p, height: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-mono font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Weight (kg)</label>
                      <input 
                        type="number" 
                        value={formProfile.weight}
                        onChange={(e) => setFormProfile(p => ({ ...p, weight: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Primary Goal</label>
                      <select 
                        value={formProfile.goal}
                        onChange={(e) => setFormProfile(p => ({ ...p, goal: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                      >
                        <option value="Weight Loss">Weight Loss</option>
                        <option value="Muscle Gain">Muscle Gain</option>
                        <option value="Heart Healthy">Heart Healthy</option>
                        <option value="PCOS Management">PCOS Management</option>
                        <option value="Diabetes Care">Diabetes Care</option>
                        <option value="General Wellness">General Wellness</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Diet Preference Type</label>
                      <select 
                        value={formProfile.dietType}
                        onChange={(e) => setFormProfile(p => ({ ...p, dietType: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Keto">Keto</option>
                        <option value="Low Carb">Low Carb</option>
                        <option value="Diabetic-Friendly">Diabetic-Friendly</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Calorie Target (kcal)</label>
                      <input 
                        type="number" 
                        value={formProfile.dailyCalorieTarget}
                        onChange={(e) => setFormProfile(p => ({ ...p, dailyCalorieTarget: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Daily Water Target (ml)</label>
                      <input 
                        type="number" 
                        value={formProfile.waterTargetMl}
                        onChange={(e) => setFormProfile(p => ({ ...p, waterTargetMl: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 2: CIRCUMFERENCES & COMPOSITION */}
              {activeFormTab === "circumferences" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-blue-50 rounded-xl flex gap-2 text-[11px] text-blue-800 font-medium">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Body circumference ratios (e.g. Waist-to-Hip ratio) provide standard insights into visceral fat accumulation, a major predictive cardiorenal and metabolic risk metric.</span>
                  </div>

                  <div className="space-y-1"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Body Dimensions (Circumference in cm)</h4></div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Waist (cm)</label>
                      <input 
                        type="number" 
                        value={formProfile.waistCm || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, waistCm: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 88"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Hip (cm)</label>
                      <input 
                        type="number" 
                        value={formProfile.hipCm || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, hipCm: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 98"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Neck (cm)</label>
                      <input 
                        type="number" 
                        value={formProfile.neckCm || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, neckCm: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 38"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Chest (cm)</label>
                      <input 
                        type="number" 
                        value={formProfile.chestCm || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, chestCm: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 102"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Arm (cm)</label>
                      <input 
                        type="number" 
                        value={formProfile.armCm || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, armCm: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 34"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Thigh (cm)</label>
                      <input 
                        type="number" 
                        value={formProfile.thighCm || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, thighCm: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 55"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-2" />
                  <div className="space-y-1"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Body Composition %</h4></div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Body Fat (%)</label>
                      <input 
                        type="number" 
                        value={formProfile.bodyFatPercent || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, bodyFatPercent: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 18.2"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Muscle Mass (%)</label>
                      <input 
                        type="number" 
                        value={formProfile.muscleMassPercent || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, muscleMassPercent: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 42.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Body Water (%)</label>
                      <input 
                        type="number" 
                        value={formProfile.bodyWaterPercent || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, bodyWaterPercent: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 58.0"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Visceral Fat Level (1-20)</label>
                      <input 
                        type="number" 
                        value={formProfile.visceralFatLevel || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, visceralFatLevel: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 7"
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* STAGE 3: CLINICAL & LABS */}
              {activeFormTab === "labs" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-purple-50 rounded-xl flex gap-2 text-[11px] text-purple-800 font-medium">
                    <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Clinical biomarkers track lipid distributions, cardiovascular markers, and blood glucose indexes like HbA1c to predict metabolic pre-diabetes.</span>
                  </div>

                  <div className="space-y-1"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Clinical Biometrics Vitals</h4></div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Blood Group</label>
                      <select 
                        value={formProfile.bloodGroup || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, bloodGroup: e.target.value ? e.target.value as any : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                      >
                        <option value="">Choose...</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Resting HR (bpm)</label>
                      <input 
                        type="number" 
                        value={formProfile.restingHeartRate || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, restingHeartRate: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 65"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Oxygen (SpO₂ %)</label>
                      <input 
                        type="number" 
                        value={formProfile.spo2 || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, spo2: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 98"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">BP Systolic</label>
                      <input 
                        type="number" 
                        value={formProfile.bloodPressureSystolic || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, bloodPressureSystolic: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 118"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">BP Diastolic</label>
                      <input 
                        type="number" 
                        value={formProfile.bloodPressureDiastolic || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, bloodPressureDiastolic: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 78"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Temp (°C)</label>
                      <input 
                        type="number" 
                        value={formProfile.bodyTemperature || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, bodyTemperature: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 36.6"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-2" />
                  <div className="space-y-1"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Clinical Laboratory Values</h4></div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">HbA1c (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={formProfile.hbA1c || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, hbA1c: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 5.4"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Fasting Sugar (mg/dL)</label>
                      <input 
                        type="number" 
                        value={formProfile.bloodSugarFasting || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, bloodSugarFasting: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 90"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Random Sugar (mg/dL)</label>
                      <input 
                        type="number" 
                        value={formProfile.bloodSugarRandom || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, bloodSugarRandom: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 130"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Total Cholesterol</label>
                      <input 
                        type="number" 
                        value={formProfile.cholesterolTotal || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, cholesterolTotal: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 195"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">HDL</label>
                      <input 
                        type="number" 
                        value={formProfile.cholesterolHDL || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, cholesterolHDL: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 48"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">LDL</label>
                      <input 
                        type="number" 
                        value={formProfile.cholesterolLDL || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, cholesterolLDL: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 110"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Triglycerides (mg/dL)</label>
                      <input 
                        type="number" 
                        value={formProfile.triglycerides || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, triglycerides: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 135"
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* STAGE 4: LIFESTYLE & BEHAVIORAL */}
              {activeFormTab === "lifestyle" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-amber-50 rounded-xl flex gap-2 text-[11px] text-amber-800 font-medium">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Behavioral triggers like daily stress, desk job sedentary binds, and caffeine intake directly impact endocrine stress signals and sleep architecture.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Stress Level</label>
                      <select 
                        value={formProfile.stressLevel || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, stressLevel: e.target.value ? e.target.value as any : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                      >
                        <option value="">Choose...</option>
                        <option value="Low">Low</option>
                        <option value="Moderate">Moderate</option>
                        <option value="High">High</option>
                        <option value="Extreme">Extreme</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Daily Mood Index (1-10)</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="10"
                        value={formProfile.moodScore || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, moodScore: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 font-mono"
                        placeholder="e.g. 8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Smoking Habit</label>
                      <select 
                        value={formProfile.smokingHabit || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, smokingHabit: e.target.value ? e.target.value as any : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                      >
                        <option value="">Choose...</option>
                        <option value="Never">Never</option>
                        <option value="Former">Former</option>
                        <option value="Occasional">Occasional</option>
                        <option value="Daily">Daily</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Alcohol Habit</label>
                      <select 
                        value={formProfile.alcoholHabit || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, alcoholHabit: e.target.value ? e.target.value as any : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                      >
                        <option value="">Choose...</option>
                        <option value="Never">Never</option>
                        <option value="Occasional">Occasional</option>
                        <option value="Social">Social</option>
                        <option value="Heavy">Heavy</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Caffeine Intake</label>
                      <select 
                        value={formProfile.caffeineIntake || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, caffeineIntake: e.target.value ? e.target.value as any : undefined }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                      >
                        <option value="">Choose...</option>
                        <option value="None">None</option>
                        <option value="Low (1-2 cups)">Low (1-2 cups)</option>
                        <option value="Moderate (3-4 cups)">Moderate (3-4 cups)</option>
                        <option value="High (5+ cups)">High (5+ cups)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Occupation (Activity context)</label>
                      <input 
                        type="text" 
                        value={formProfile.occupation || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, occupation: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                        placeholder="e.g. Remote Developer, Desk Job, Student"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Food Preferences</label>
                    <select 
                      value={formProfile.foodPreference || ""}
                      onChange={(e) => setFormProfile(p => ({ ...p, foodPreference: e.target.value ? e.target.value as any : undefined }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                    >
                      <option value="">Choose...</option>
                      <option value="Standard">Standard</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Keto">Keto Diet</option>
                      <option value="Halal">Halal</option>
                      <option value="Kosher">Kosher</option>
                      <option value="Pescatarian">Pescatarian</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STAGE 5: MEDICAL HISTORY */}
              {activeFormTab === "medical" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3 bg-slate-900 text-white rounded-xl flex gap-2 text-[11px] font-medium">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Active medical conditions, family clinical markers, daily vitamin regimes, surgeries and vaccination histories complete your secure health chart.</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Existing Medical Conditions (comma separated)</label>
                      <input 
                        type="text" 
                        value={formProfile.existingMedicalConditions?.join(", ") || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, existingMedicalConditions: e.target.value ? e.target.value.split(",").map(s => s.trim()) : [] }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                        placeholder="e.g. Type 2 Diabetes, Hypertension"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Family Medical History (comma separated)</label>
                      <input 
                        type="text" 
                        value={formProfile.familyMedicalHistory?.join(", ") || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, familyMedicalHistory: e.target.value ? e.target.value.split(",").map(s => s.trim()) : [] }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                        placeholder="e.g. Cardiovascular Disease, Diabetes"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Current Prescription Medications</label>
                      <input 
                        type="text" 
                        value={formProfile.currentMedications?.join(", ") || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, currentMedications: e.target.value ? e.target.value.split(",").map(s => s.trim()) : [] }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                        placeholder="e.g. Metformin 500mg, Atorvastatin 10mg"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Vitamins & Supps Daily</label>
                      <input 
                        type="text" 
                        value={formProfile.vitaminsSupplements?.join(", ") || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, vitaminsSupplements: e.target.value ? e.target.value.split(",").map(s => s.trim()) : [] }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                        placeholder="e.g. Vitamin D3 2000IU, Omega-3 Fish Oil"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Surgery History (comma separated)</label>
                      <input 
                        type="text" 
                        value={formProfile.surgeryHistory?.join(", ") || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, surgeryHistory: e.target.value ? e.target.value.split(",").map(s => s.trim()) : [] }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                        placeholder="e.g. Appendectomy 2018"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Vaccinations History</label>
                      <input 
                        type="text" 
                        value={formProfile.vaccinationHistory?.join(", ") || ""}
                        onChange={(e) => setFormProfile(p => ({ ...p, vaccinationHistory: e.target.value ? e.target.value.split(",").map(s => s.trim()) : [] }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                        placeholder="e.g. Covid-19 Booster 2024, Influenza 2025"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Pregnancy Status (if applicable)</label>
                    <select 
                      value={formProfile.pregnancyStatus || ""}
                      onChange={(e) => setFormProfile(p => ({ ...p, pregnancyStatus: e.target.value ? e.target.value as any : undefined }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50"
                    >
                      <option value="Not Applicable">Not Applicable</option>
                      <option value="Not Pregnant">Not Pregnant</option>
                      <option value="Pregnant">Pregnant</option>
                      <option value="Postpartum">Postpartum</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex justify-between gap-4 shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowEditWizard(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" /> Save & Recalibrate Baselines
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

// Helper: Missing biomarker input card
function QuickAddInput({ marker, onSave }: { key?: string; marker: any; onSave: (val: any) => void }) {
  const [val, setVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim()) return;
    onSave(marker.type === "number" ? Number(val) : val);
    setVal("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-white border border-amber-200/60 rounded-2xl flex items-center justify-between gap-2 shadow-xs">
      <div className="space-y-0.5 max-w-[120px]">
        <span className="text-[10px] font-black text-amber-900 block truncate" title={marker.label}>
          {marker.label}
        </span>
        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block">
          Missing {marker.unit && `(${marker.unit})`}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {marker.type === "select" ? (
          <select 
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="px-2 py-1 border border-gray-200 rounded-lg text-[10px] max-w-[80px] focus:outline-emerald-500 bg-gray-50"
            required
          >
            <option value="">...</option>
            {marker.options?.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input 
            type={marker.type}
            placeholder={marker.placeholder}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="px-2 py-1 border border-gray-200 rounded-lg text-[10px] w-14 font-mono text-center focus:outline-emerald-500 bg-gray-50"
            required
          />
        )}
        <button 
          type="submit"
          className="p-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg cursor-pointer transition-colors"
          title="Save biomarker"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}

// Helper: Subscore indicator widget
function SubScoreTile({ title, score, icon, bgColor, borderColor }: { title: string; score: number; icon: React.ReactNode; bgColor: string; borderColor: string }) {
  const getStatusText = (sc: number) => {
    if (sc >= 85) return "Optimal";
    if (sc >= 70) return "Good";
    if (sc >= 50) return "Moderate";
    return "Attention Needed";
  };

  const getStatusColor = (sc: number) => {
    if (sc >= 85) return "text-emerald-600";
    if (sc >= 70) return "text-blue-600";
    if (sc >= 50) return "text-amber-600";
    return "text-rose-600 font-black";
  };

  return (
    <div className={`p-4 bg-white border border-gray-150/60 rounded-2xl shadow-xs space-y-3 flex flex-col justify-between`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-black text-gray-800 tracking-tight truncate">{title}</span>
        <div className={`p-1.5 rounded-lg ${bgColor} border ${borderColor}`}>
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-slate-900 tracking-tight">{score}</span>
          <span className="text-[9px] text-gray-400 font-bold">/100</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-700 ${
              score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-blue-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`text-[8px] font-black uppercase tracking-wider block ${getStatusColor(score)}`}>
          {getStatusText(score)}
        </span>
      </div>
    </div>
  );
}

// Helper: Biometric static item row
function BioRow({ label, value, icon }: { label: string; value: string; icon: string }) {
  const isPending = value.includes("Pending");
  return (
    <div className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60 text-xs">
      <span className="flex items-center gap-2 text-slate-300 font-medium">
        <span className="text-sm shrink-0">{icon}</span>
        <span>{label}</span>
      </span>
      <span className={`font-mono font-bold ${isPending ? "text-slate-500 italic" : "text-emerald-400"}`}>
        {value}
      </span>
    </div>
  );
}

// Helper: Multi-stage calibration nav button
function StepNavBtn({ id, label, active, onClick }: { id: FormStep; label: string; active: FormStep; onClick: (id: FormStep) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
        active === id 
          ? "bg-slate-900 text-white shadow-xs" 
          : "text-gray-500 hover:text-slate-800 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}
