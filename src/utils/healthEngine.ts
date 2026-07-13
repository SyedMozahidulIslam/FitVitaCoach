import { UserProfile, FoodLog, WorkoutLog, WaterLog, SleepLog, MoodLog } from "../types";

export interface HealthAssessment {
  overallScore: number;
  nutritionScore: number;
  fitnessScore: number;
  heartHealthScore: number;
  metabolicHealthScore: number;
  sleepScore: number;
  hydrationScore: number;
  mentalWellnessScore: number;
  lifestyleScore: number;
  accuracyLevel: number; // 0-100%

  insights: {
    strengths: string[];
    riskFactors: string[];
    recommendedImprovements: string[];
    dailyPriorities: string[];
    weeklyGoals: string[];
    preventiveSuggestions: string[];
    recommendedCheckups: string[];
  };
}

// Calculate Profile Completeness & Confidence/Accuracy level
export function calculateProfileCompleteness(profile: UserProfile): number {
  let score = 20; // Base weight for Age, Gender, Height, Weight (always present)

  // Extended Body Measurements (up to 12%)
  let circumferences = 0;
  if (profile.waistCm) circumferences += 2;
  if (profile.hipCm) circumferences += 2;
  if (profile.neckCm) circumferences += 2;
  if (profile.chestCm) circumferences += 2;
  if (profile.armCm) circumferences += 2;
  if (profile.thighCm) circumferences += 2;
  score += circumferences;

  // Extended Body Composition (up to 12%)
  let composition = 0;
  if (profile.bodyFatPercent) composition += 3;
  if (profile.muscleMassPercent) composition += 3;
  if (profile.bodyWaterPercent) composition += 3;
  if (profile.visceralFatLevel) composition += 3;
  score += composition;

  // Extended Clinical & Biometrics (up to 26%)
  let biometrics = 0;
  if (profile.bloodGroup) biometrics += 2;
  if (profile.restingHeartRate) biometrics += 2;
  if (profile.bloodPressureSystolic && profile.bloodPressureDiastolic) biometrics += 4;
  if (profile.bloodSugarFasting) biometrics += 2;
  if (profile.bloodSugarRandom) biometrics += 2;
  if (profile.hbA1c) biometrics += 4;
  if (profile.cholesterolTotal) biometrics += 2;
  if (profile.cholesterolHDL) biometrics += 2;
  if (profile.cholesterolLDL) biometrics += 2;
  if (profile.triglycerides) biometrics += 2;
  if (profile.spo2) biometrics += 1;
  if (profile.bodyTemperature) biometrics += 1;
  score += Math.min(26, biometrics);

  // Lifestyle & Habits (up to 15%)
  let lifestyle = 0;
  if (profile.dailyWaterIntakeMl) lifestyle += 1.5;
  if (profile.sleepDurationTargetHours) lifestyle += 1.5;
  if (profile.sleepQualityScore) lifestyle += 1.5;
  if (profile.stressLevel) lifestyle += 1.5;
  if (profile.moodScore) lifestyle += 1.5;
  if (profile.smokingHabit) lifestyle += 1.5;
  if (profile.alcoholHabit) lifestyle += 1.5;
  if (profile.caffeineIntake) lifestyle += 1.5;
  if (profile.occupation) lifestyle += 1;
  if (profile.foodPreference) lifestyle += 1;
  if (profile.foodAllergies && profile.foodAllergies.length > 0) lifestyle += 0.5;
  if (profile.religiousDietaryRestrictions && profile.religiousDietaryRestrictions.length > 0) lifestyle += 0.5;
  score += Math.min(15, lifestyle);

  // Medical History & Lab Reports (up to 15%)
  let medical = 0;
  if (profile.existingMedicalConditions && profile.existingMedicalConditions.length > 0) medical += 2;
  if (profile.familyMedicalHistory && profile.familyMedicalHistory.length > 0) medical += 2;
  if (profile.currentMedications && profile.currentMedications.length > 0) medical += 2;
  if (profile.vitaminsSupplements && profile.vitaminsSupplements.length > 0) medical += 2;
  if (profile.surgeryHistory && profile.surgeryHistory.length > 0) medical += 2;
  if (profile.vaccinationHistory && profile.vaccinationHistory.length > 0) medical += 2;
  if (profile.pregnancyStatus && profile.pregnancyStatus !== "Not Applicable") medical += 1;
  if (profile.recentLaboratoryReports && profile.recentLaboratoryReports.length > 0) medical += 2;
  score += Math.min(15, medical);

  return Math.min(100, Math.round(score));
}

// Compute the comprehensive health assessment locally
export function analyzeHealthProfile(
  profile: UserProfile,
  foodLogs: FoodLog[],
  workoutLogs: WorkoutLog[],
  waterLogs: WaterLog[],
  sleepLogs: SleepLog[],
  moodLogs: MoodLog[]
): HealthAssessment {
  const accuracyLevel = calculateProfileCompleteness(profile);

  // --- 1. Nutrition Score (Base: 75) ---
  let nutritionScore = 75;
  const recentCal = foodLogs.slice(-3).reduce((s, f) => s + f.calories, 0) / Math.max(1, Math.min(3, foodLogs.slice(-3).length));
  if (recentCal > 0) {
    const calDiff = Math.abs(recentCal - profile.dailyCalorieTarget);
    if (calDiff <= 200) nutritionScore += 15;
    else if (calDiff > 500) nutritionScore -= 15;
  }

  if (profile.cholesterolTotal && profile.cholesterolTotal > 200) nutritionScore -= 5;
  if (profile.cholesterolLDL && profile.cholesterolLDL > 130) nutritionScore -= 5;
  if (profile.cholesterolHDL && profile.cholesterolHDL < 40) nutritionScore -= 5;
  if (profile.triglycerides && profile.triglycerides > 150) nutritionScore -= 5;
  if (profile.hbA1c && profile.hbA1c > 5.7) nutritionScore -= 10;
  if (profile.bloodSugarFasting && profile.bloodSugarFasting > 100) nutritionScore -= 5;
  
  if (profile.foodAllergies && profile.foodAllergies.length > 0) nutritionScore += 2; // awareness added
  nutritionScore = Math.max(15, Math.min(100, nutritionScore));

  // --- 2. Fitness Score (Base: 60) ---
  let fitnessScore = 60;
  const actMap = {
    "Sedentary": -10,
    "Lightly Active": 5,
    "Moderately Active": 15,
    "Highly Active": 25
  };
  fitnessScore += actMap[profile.activityLevel] || 0;

  if (profile.restingHeartRate) {
    if (profile.restingHeartRate >= 50 && profile.restingHeartRate <= 64) fitnessScore += 10;
    else if (profile.restingHeartRate > 80) fitnessScore -= 10;
  }

  if (profile.bodyFatPercent) {
    const isMale = profile.gender === "Male";
    if (isMale) {
      if (profile.bodyFatPercent >= 10 && profile.bodyFatPercent <= 18) fitnessScore += 10;
      else if (profile.bodyFatPercent > 25) fitnessScore -= 10;
    } else {
      if (profile.bodyFatPercent >= 18 && profile.bodyFatPercent <= 26) fitnessScore += 10;
      else if (profile.bodyFatPercent > 32) fitnessScore -= 10;
    }
  }

  // Workouts count in last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentWorkoutsCount = workoutLogs.filter(w => new Date(w.timestamp) >= sevenDaysAgo).length;
  if (recentWorkoutsCount >= 3) fitnessScore += 15;
  else if (recentWorkoutsCount > 0) fitnessScore += 5;
  else fitnessScore -= 10;

  fitnessScore = Math.max(15, Math.min(100, fitnessScore));

  // --- 3. Heart Health Score (Base: 80) ---
  let heartHealthScore = 80;
  if (profile.restingHeartRate) {
    if (profile.restingHeartRate >= 55 && profile.restingHeartRate <= 68) heartHealthScore += 10;
    else if (profile.restingHeartRate > 75) heartHealthScore -= 5;
    else if (profile.restingHeartRate > 85) heartHealthScore -= 15;
  }

  if (profile.bloodPressureSystolic && profile.bloodPressureDiastolic) {
    const sys = profile.bloodPressureSystolic;
    const dia = profile.bloodPressureDiastolic;
    if (sys < 120 && dia < 80) heartHealthScore += 10; // Optimal
    else if (sys >= 130 || dia >= 85) heartHealthScore -= 15; // Stage 1 / Elevated
    else if (sys >= 140 || dia >= 90) heartHealthScore -= 30; // Stage 2
  }

  if (profile.cholesterolTotal && profile.cholesterolTotal > 240) heartHealthScore -= 10;
  if (profile.cholesterolLDL && profile.cholesterolLDL > 160) heartHealthScore -= 10;
  if (profile.triglycerides && profile.triglycerides > 150) heartHealthScore -= 5;
  if (profile.spo2) {
    if (profile.spo2 >= 96) heartHealthScore += 5;
    else if (profile.spo2 < 93) heartHealthScore -= 20;
  }

  if (profile.smokingHabit === "Daily") heartHealthScore -= 25;
  else if (profile.smokingHabit === "Occasional") heartHealthScore -= 10;

  heartHealthScore = Math.max(15, Math.min(100, heartHealthScore));

  // --- 4. Metabolic Health Score (Base: 85) ---
  let metabolicHealthScore = 85;
  if (profile.bloodSugarFasting) {
    const bsf = profile.bloodSugarFasting;
    if (bsf >= 70 && bsf < 100) metabolicHealthScore += 10; // Normal
    else if (bsf >= 100 && bsf < 126) metabolicHealthScore -= 15; // Pre-diabetes
    else if (bsf >= 126) metabolicHealthScore -= 30; // Diabetes
  }

  if (profile.hbA1c) {
    const h = profile.hbA1c;
    if (h < 5.7) metabolicHealthScore += 10;
    else if (h >= 5.7 && h < 6.5) metabolicHealthScore -= 20;
    else if (h >= 6.5) metabolicHealthScore -= 35;
  }

  if (profile.visceralFatLevel) {
    if (profile.visceralFatLevel <= 9) metabolicHealthScore += 5;
    else if (profile.visceralFatLevel >= 10 && profile.visceralFatLevel <= 14) metabolicHealthScore -= 15;
    else if (profile.visceralFatLevel >= 15) metabolicHealthScore -= 25;
  }

  // Waist-to-Hip Ratio
  if (profile.waistCm && profile.hipCm) {
    const whr = profile.waistCm / profile.hipCm;
    const isMale = profile.gender === "Male";
    if (isMale) {
      if (whr > 0.90) metabolicHealthScore -= 15;
      else metabolicHealthScore += 5;
    } else {
      if (whr > 0.85) metabolicHealthScore -= 15;
      else metabolicHealthScore += 5;
    }
  }

  metabolicHealthScore = Math.max(15, Math.min(100, metabolicHealthScore));

  // --- 5. Sleep Score (Base: 70) ---
  let sleepScore = 70;
  const recentSleeps = sleepLogs.slice(-3);
  if (recentSleeps.length > 0) {
    const avgSleep = recentSleeps.reduce((s, l) => s + l.hoursSlept, 0) / recentSleeps.length;
    const avgQuality = recentSleeps.reduce((s, l) => s + l.qualityScore, 0) / recentSleeps.length;
    
    // Duration impact
    const diff = Math.abs(avgSleep - profile.sleepTargetHours);
    if (diff <= 1) sleepScore += 15;
    else if (diff > 2) sleepScore -= 15;

    // Quality impact
    if (avgQuality >= 85) sleepScore += 15;
    else if (avgQuality < 60) sleepScore -= 15;
  } else if (profile.sleepDurationTargetHours) {
    sleepScore += 5; // setup target
  }

  if (profile.caffeineIntake === "High (5+ cups)") sleepScore -= 10;
  if (profile.stressLevel === "High" || profile.stressLevel === "Extreme") sleepScore -= 10;

  sleepScore = Math.max(15, Math.min(100, sleepScore));

  // --- 6. Hydration Score (Base: 70) ---
  let hydrationScore = 70;
  const todayWater = waterLogs.filter(w => w.timestamp.startsWith(now.toISOString().split("T")[0])).reduce((s, w) => s + w.amountMl, 0);
  if (todayWater > 0) {
    const pct = todayWater / profile.waterTargetMl;
    if (pct >= 1.0) hydrationScore += 25;
    else if (pct >= 0.7) hydrationScore += 12;
    else hydrationScore -= 10;
  }
  if (profile.bodyWaterPercent) {
    if (profile.bodyWaterPercent >= 50 && profile.bodyWaterPercent <= 65) hydrationScore += 5;
  }

  hydrationScore = Math.max(15, Math.min(100, hydrationScore));

  // --- 7. Mental Wellness Score (Base: 75) ---
  let mentalWellnessScore = 75;
  if (profile.stressLevel === "Low") mentalWellnessScore += 15;
  else if (profile.stressLevel === "High") mentalWellnessScore -= 15;
  else if (profile.stressLevel === "Extreme") mentalWellnessScore -= 25;

  if (profile.moodScore) {
    if (profile.moodScore >= 8) mentalWellnessScore += 10;
    else if (profile.moodScore <= 4) mentalWellnessScore -= 15;
  }

  // Factor in recent mood logs
  if (moodLogs.length > 0) {
    const avgMood = moodLogs.slice(-3).reduce((s, m) => s + m.score, 0) / moodLogs.slice(-3).length;
    const avgStress = moodLogs.slice(-3).reduce((s, m) => s + m.stressLevel, 0) / moodLogs.slice(-3).length;
    if (avgMood >= 8) mentalWellnessScore += 5;
    if (avgStress > 7) mentalWellnessScore -= 10;
  }

  mentalWellnessScore = Math.max(15, Math.min(100, mentalWellnessScore));

  // --- 8. Lifestyle Score (Base: 75) ---
  let lifestyleScore = 75;
  if (profile.smokingHabit === "Never") lifestyleScore += 10;
  else if (profile.smokingHabit === "Daily") lifestyleScore -= 20;

  if (profile.alcoholHabit === "Never") lifestyleScore += 5;
  else if (profile.alcoholHabit === "Heavy") lifestyleScore -= 15;

  if (profile.caffeineIntake === "None" || profile.caffeineIntake === "Low (1-2 cups)") lifestyleScore += 5;
  else if (profile.caffeineIntake === "High (5+ cups)") lifestyleScore -= 10;

  if (profile.occupation) {
    const activeJobs = ["Athlete", "Manual Labor", "Fitness Trainer"];
    const sedentaryJobs = ["Desk Job", "Student", "Remote Developer"];
    if (activeJobs.some(j => profile.occupation!.toLowerCase().includes(j.toLowerCase()))) {
      lifestyleScore += 5;
    } else if (sedentaryJobs.some(j => profile.occupation!.toLowerCase().includes(j.toLowerCase()))) {
      lifestyleScore -= 5;
    }
  }

  if (profile.vaccinationHistory && profile.vaccinationHistory.length > 0) lifestyleScore += 5;
  if (profile.vitaminsSupplements && profile.vitaminsSupplements.length > 0) lifestyleScore += 5;

  lifestyleScore = Math.max(15, Math.min(100, lifestyleScore));

  // --- 9. Overall Weighted Health Score ---
  const overallScore = Math.round(
    nutritionScore * 0.15 +
    fitnessScore * 0.15 +
    heartHealthScore * 0.15 +
    metabolicHealthScore * 0.15 +
    sleepScore * 0.10 +
    hydrationScore * 0.10 +
    mentalWellnessScore * 0.10 +
    lifestyleScore * 0.10
  );

  // --- 10. Generate Deterministic Health Insights ---
  const strengths: string[] = [];
  const riskFactors: string[] = [];
  const recommendedImprovements: string[] = [];
  const dailyPriorities: string[] = [];
  const weeklyGoals: string[] = [];
  const preventiveSuggestions: string[] = [];
  const recommendedCheckups: string[] = [];

  // Strengths
  if (profile.restingHeartRate && profile.restingHeartRate <= 65) {
    strengths.push(`Excellent cardiovascular fitness with a resting heart rate of ${profile.restingHeartRate} BPM.`);
  }
  if (profile.smokingHabit === "Never" || !profile.smokingHabit) {
    strengths.push("Highly protective lifestyle choice of staying smoke-free.");
  }
  if (profile.bloodPressureSystolic && profile.bloodPressureSystolic < 120 && profile.bloodPressureDiastolic && profile.bloodPressureDiastolic < 80) {
    strengths.push(`Optimal clinical-grade blood pressure of ${profile.bloodPressureSystolic}/${profile.bloodPressureDiastolic} mmHg.`);
  } else if (profile.bloodPressureSystolic) {
    // default basic strength
    strengths.push("Consistent daily tracking of vital biometric signals.");
  }
  if (recentWorkoutsCount >= 3) {
    strengths.push(`Great exercise consistency, completing ${recentWorkoutsCount} workouts this past week.`);
  }
  if (overallScore >= 80) {
    strengths.push("High overall lifestyle consistency driving optimal vitality markers.");
  }

  // Risk Factors
  if (profile.hbA1c && profile.hbA1c >= 5.7) {
    const type = profile.hbA1c >= 6.5 ? "Diabetic range" : "Pre-diabetic range";
    riskFactors.push(`Elevated HbA1c at ${profile.hbA1c}% indicating clinical insulin resistance (${type}).`);
  }
  if (profile.bloodPressureSystolic && profile.bloodPressureSystolic >= 130) {
    riskFactors.push(`Elevated resting Blood Pressure (${profile.bloodPressureSystolic}/${profile.bloodPressureDiastolic} mmHg), increasing cardiac workload.`);
  }
  if (profile.cholesterolLDL && profile.cholesterolLDL > 130) {
    riskFactors.push(`Elevated LDL cholesterol (${profile.cholesterolLDL} mg/dL) posing long-term cardiovascular risks.`);
  }
  if (profile.visceralFatLevel && profile.visceralFatLevel >= 10) {
    riskFactors.push(`High Visceral Fat index (${profile.visceralFatLevel}), which contributes to metabolic syndrome risk.`);
  }
  if (profile.occupation && ["desk", "student", "developer", "remote"].some(w => profile.occupation!.toLowerCase().includes(w))) {
    riskFactors.push(`Extended occupational sedentary duration ("${profile.occupation}") leading to active-sitting compression.`);
  }
  if (profile.smokingHabit === "Daily" || profile.smokingHabit === "Occasional") {
    riskFactors.push("Active inhalation smoking, significantly elevating systemic oxidative stress.");
  }
  if (profile.existingMedicalConditions && profile.existingMedicalConditions.length > 0) {
    riskFactors.push(`Active management of diagnosed clinical conditions: ${profile.existingMedicalConditions.join(", ")}.`);
  }

  // Recommended Improvements & Daily Priorities
  if (profile.hbA1c && profile.hbA1c >= 5.7) {
    recommendedImprovements.push("Adopt a low-glycemic eating pattern; swap refined carbs for fiber-dense whole food options like local red rice (Lal Chal) or steel-cut oats.");
    dailyPriorities.push("Limit added sugars to under 15g and track fasting blood glucose.");
    weeklyGoals.push("Complete at least 150 minutes of Zone-2 brisk walking to expand mitochondrial glucose uptake.");
    recommendedCheckups.push("Fasting Blood Sugar and HbA1c clinical panel checkup in 3 months.");
  } else {
    recommendedImprovements.push("Optimize micronutrient intake by loading 50% of your lunch and dinner plates with local leafy green vegetables (shak).");
  }

  if (profile.bloodPressureSystolic && profile.bloodPressureSystolic >= 130) {
    recommendedImprovements.push("Support arterial health by increasing potassium-rich foods (local fresh bananas, coconut water, dark leafy greens) and restricting sodium intake to < 1500mg/day.");
    dailyPriorities.push("Log your blood pressure twice daily (morning and evening) in a calm state.");
    preventiveSuggestions.push("Limit caffeinated beverages to before 12:00 PM to protect arterial compliance.");
    recommendedCheckups.push("Ambulatory Blood Pressure Monitoring (ABPM) or cardiologist validation.");
  }

  if (profile.cholesterolLDL && profile.cholesterolLDL > 130) {
    recommendedImprovements.push("Increase soluble dietary fiber (beans, lentils, psyllium husk, local guava) to bind and clear circulating cholesterol.");
    preventiveSuggestions.push("Supplement with premium high-purity Omega-3 fish oil or plant-based algal oil to balance triglycerides.");
    recommendedCheckups.push("Full lipid fractions retest (including ApoB if advised by physician) in 60 days.");
  }

  if (profile.occupation && ["desk", "student", "developer", "remote"].some(w => profile.occupation!.toLowerCase().includes(w))) {
    dailyPriorities.push("Set a 50-minute micro-timer to stand up, stretch your hip flexors, and complete 10 bodyweight squats.");
    preventiveSuggestions.push("Consider investing in a height-adjustable standing desk or walking pad to increase non-exercise activity thermogenesis (NEAT).");
  }

  if (profile.waterTargetMl && todayWater < profile.waterTargetMl) {
    dailyPriorities.push(`Consume a glass of filtered water every 2 hours to reach your calibrated daily goal of ${profile.waterTargetMl}ml.`);
  } else {
    dailyPriorities.push("Keep water bottle adjacent to workspace to maintain peak baseline cell hydration.");
  }

  // General Goals if empty
  if (weeklyGoals.length === 0) {
    weeklyGoals.push("Log at least 3 strength-based exercise sessions and 2 active recovery days.");
    weeklyGoals.push("Achieve 100% adherence to scheduled clinical medications/supplements.");
  }
  if (dailyPriorities.length < 3) {
    dailyPriorities.push(`Reach your daily goal of ${profile.stepTarget} active step-counts.`);
    dailyPriorities.push(`Secure ${profile.sleepTargetHours} hours of high-quality restorative sleep.`);
  }
  if (preventiveSuggestions.length === 0) {
    preventiveSuggestions.push("Prioritize natural sunrise sunlight exposure for 10-15 minutes immediately upon waking to align circadian biology.");
    preventiveSuggestions.push("Integrate 10 minutes of box-breathing at sunset to activate parasympathetic nervous tone.");
  }
  if (recommendedCheckups.length === 0) {
    recommendedCheckups.push("Annual Comprehensive Metabolic Health Screening (Fasting Insulin, Vitamin D3, Lipid Profile).");
    recommendedCheckups.push("Biannual dental scaling and clinical eye examination.");
  }

  return {
    overallScore,
    nutritionScore,
    fitnessScore,
    heartHealthScore,
    metabolicHealthScore,
    sleepScore,
    hydrationScore,
    mentalWellnessScore,
    lifestyleScore,
    accuracyLevel,
    insights: {
      strengths: strengths.slice(0, 3),
      riskFactors: riskFactors.slice(0, 3),
      recommendedImprovements: recommendedImprovements.slice(0, 3),
      dailyPriorities: dailyPriorities.slice(0, 3),
      weeklyGoals: weeklyGoals.slice(0, 3),
      preventiveSuggestions: preventiveSuggestions.slice(0, 3),
      recommendedCheckups: recommendedCheckups.slice(0, 3)
    }
  };
}
