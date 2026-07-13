export interface UserProfile {
  name: string;
  role: "SMI Fahim" | "Registered User" | "Premium User" | "Doctor" | "Nutritionist" | "Administrator";
  age: number;
  gender: "Male" | "Female" | "Other";
  weight: number; // kg
  height: number; // cm
  goal: "Weight Loss" | "Muscle Gain" | "Heart Healthy" | "PCOS Management" | "Diabetes Care" | "General Wellness";
  dietType: "Standard" | "Vegetarian" | "Vegan" | "Keto" | "Low Carb" | "Diabetic-Friendly";
  allergies: string[];
  activityLevel: "Sedentary" | "Lightly Active" | "Moderately Active" | "Highly Active";
  conditions: string[];
  dailyCalorieTarget: number;
  waterTargetMl: number;
  sleepTargetHours: number;
  stepTarget: number;
}

export interface FoodLog {
  id: string;
  timestamp: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  foodName: string;
  calories: number;
  protein: number; // g
  carbs: number; // g
  fat: number; // g
  fiber?: number; // g
  sugar?: number; // g
  servingSize: string;
}

export interface WorkoutLog {
  id: string;
  timestamp: string;
  exerciseName: string;
  category: "Strength" | "Cardio" | "Yoga/Pilates" | "Stretch" | "HIIT";
  durationMinutes: number;
  caloriesBurned: number;
  notes?: string;
}

export interface WaterLog {
  id: string;
  timestamp: string;
  amountMl: number;
}

export interface SleepLog {
  id: string;
  date: string;
  hoursSlept: number;
  qualityScore: number; // 0-100
  deepSleepPercent?: number;
  remSleepPercent?: number;
}

export interface MoodLog {
  id: string;
  timestamp: string;
  score: number; // 1-10
  stressLevel: number; // 1-10
  journalText?: string;
}

export interface Habit {
  id: string;
  name: string;
  category: "Morning" | "Night" | "Productivity" | "Lifestyle" | "Nutrition";
  completedDays: string[]; // dates e.g. "2026-07-13"
  streak: number;
  frequency: "Daily" | "Weekly";
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  refillCount: number;
  instructions: string;
  loggedDays: string[]; // dates e.g. "2026-07-13"
}

export interface Recipe {
  id: string;
  title: string;
  category: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTimeMinutes: number;
  ingredients: string[];
  steps: string[];
  isRegional?: boolean;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  bought: boolean;
  estimatedPriceBDT: number;
  expiryDate?: string;
  alternativeName?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  xpValue: number;
}
