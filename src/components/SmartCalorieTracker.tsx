import React, { useState } from "react";
import { 
  Flame, Plus, Camera, Search, Sparkles, Trash2, 
  ChevronRight, Apple, Check, AlertCircle, RefreshCw
} from "lucide-react";
import { FoodLog, UserProfile } from "../types";

interface SmartCalorieTrackerProps {
  userProfile: UserProfile;
  foodLogs: FoodLog[];
  onAddFoodLog: (log: Omit<FoodLog, "id" | "timestamp">) => void;
  onDeleteFoodLog: (id: string) => void;
  onAddXp: (amount: number) => void;
}

// Predefined regional foods database
const REGIONAL_FOOD_DATABASE = [
  { name: "Steamed Lal Chal Rice (Red Rice)", calories: 150, protein: 3, carbs: 33, fat: 1, fiber: 2.5, category: "Bangladeshi" },
  { name: "Sautéed Lal Shak (Red Amaranth Leaves)", calories: 45, protein: 2.5, carbs: 7, fat: 0.5, fiber: 3, category: "Bangladeshi" },
  { name: "Baked Hilsha Fish (Ilish Sarse)", calories: 240, protein: 22, carbs: 4, fat: 16, fiber: 0, category: "Bangladeshi" },
  { name: "Lentil Dal (Wholesome Masoor Dal)", calories: 120, protein: 8, carbs: 20, fat: 1.5, fiber: 4, category: "Bangladeshi" },
  { name: "Chapati/Handmade Whole-wheat Roti", calories: 110, protein: 3.5, carbs: 22, fat: 0.5, fiber: 3, category: "Indian/Bangladeshi" },
  { name: "Oats Khichuri with Winter Veggies", calories: 210, protein: 7, carbs: 38, fat: 3, fiber: 6, category: "Diet Friendly" },
  { name: "Egg White Scramble with Spinach", calories: 95, protein: 12, carbs: 2, fat: 4.5, fiber: 1, category: "Gym Staples" },
  { name: "Baked Salmon with Broccoli", calories: 290, protein: 25, carbs: 5, fat: 18, fiber: 2.5, category: "European" },
  { name: "Mediterranean Chickpea Salad", calories: 180, protein: 6, carbs: 24, fat: 7, fiber: 5, category: "Mediterranean" },
  { name: "Avocado Wheat Toast", calories: 230, protein: 5, carbs: 28, fat: 12, fiber: 6, category: "American" },
];

export default function SmartCalorieTracker({
  userProfile,
  foodLogs,
  onAddFoodLog,
  onDeleteFoodLog,
  onAddXp
}: SmartCalorieTrackerProps) {
  // Input states
  const [searchQuery, setSearchQuery] = useState("");
  const [mealType, setMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Breakfast");
  const [foodNameInput, setFoodNameInput] = useState("");
  const [caloriesInput, setCaloriesInput] = useState("");
  const [proteinInput, setProteinInput] = useState("");
  const [carbsInput, setCarbsInput] = useState("");
  const [fatInput, setFatInput] = useState("");
  const [servingSizeInput, setServingSizeInput] = useState("1 Standard Serving");

  // AI recognition states
  const [aiInputText, setAiInputText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [simulationImage, setSimulationImage] = useState<string | null>(null);

  // Filter foods for current day
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = foodLogs.filter(log => log.timestamp.startsWith(today));
  const totalCalories = todayLogs.reduce((sum, f) => sum + f.calories, 0);

  // Handle standard addition
  const handleAddCustomFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodNameInput.trim()) return;

    onAddFoodLog({
      mealType,
      foodName: foodNameInput,
      calories: Number(caloriesInput) || 0,
      protein: Number(proteinInput) || 0,
      carbs: Number(carbsInput) || 0,
      fat: Number(fatInput) || 0,
      servingSize: servingSizeInput,
      fiber: 2,
      sugar: 1
    });

    // Reset fields
    setFoodNameInput("");
    setCaloriesInput("");
    setProteinInput("");
    setCarbsInput("");
    setFatInput("");
    onAddXp(150); // reward XP for logging
  };

  // Quick log a database food
  const handleQuickLogDatabaseItem = (item: typeof REGIONAL_FOOD_DATABASE[0]) => {
    onAddFoodLog({
      mealType,
      foodName: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      servingSize: "1 Standard Serving",
      fiber: item.fiber,
      sugar: 1
    });
    onAddXp(150);
  };

  // Call server-side API for Gemini food recognition
  const handleAiFoodAnalysis = async () => {
    const queryText = aiInputText.trim() || "A plate of white rice with fried rui fish and yellow lentil dal";
    setAiLoading(true);
    setAiResult(null);

    try {
      const response = await fetch("/api/coach/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodDescription: queryText,
          base64Image: simulationImage
        })
      });

      if (!response.ok) {
        throw new Error("Failed to analyze food via Gemini.");
      }

      const data = await response.json();
      setAiResult(data);
      onAddXp(300); // Higher XP for utilizing AI coaching tools
    } catch (error) {
      console.error("AI Food recognition error:", error);
    } finally {
      setAiLoading(false);
    }
  };

  // Add the AI recognized food directly to logs
  const handleAddAiResultToLogs = () => {
    if (!aiResult) return;
    onAddFoodLog({
      mealType,
      foodName: aiResult.foodName || "AI Recognized Meal",
      calories: Number(aiResult.calories) || 300,
      protein: Number(aiResult.protein) || 15,
      carbs: Number(aiResult.carbs) || 40,
      fat: Number(aiResult.fat) || 10,
      servingSize: aiResult.servingSize || "1 Serving",
      fiber: Number(aiResult.fiber) || 3,
      sugar: Number(aiResult.sugar) || 2
    });
    setAiResult(null);
    setAiInputText("");
    setSimulationImage(null);
  };

  // Filter food database on search query
  const filteredDb = REGIONAL_FOOD_DATABASE.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simulate picking a photo from camera roll (Mocking image upload with high quality food placeholders)
  const handleSimulateCamera = (imageName: string, description: string) => {
    setSimulationImage(imageName);
    setAiInputText(description);
  };

  return (
    <div className="space-y-6" id="smart_calorie_tracker">
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Apple className="w-6 h-6 text-emerald-500" />
            Smart Calorie & Nutrition Logger
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Analyze, track, and log food portions from around the world including premium regional dishes.
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-2xl border border-emerald-100 text-right">
          <div className="text-[10px] uppercase font-bold tracking-wider">Today's Intake</div>
          <div className="text-xl font-extrabold">{totalCalories} <span className="text-xs font-normal">/ {userProfile.dailyCalorieTarget} kcal</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Manual entry & Database search */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Quick-add preset database */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-gray-900">Preset Foods & Regional Favorites</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input 
                  type="text" 
                  placeholder="Search Bangladeshi, Indian, diet foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50/50 w-full sm:w-56 focus:outline-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
              {filteredDb.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-gray-50/50 hover:bg-emerald-50/40 rounded-2xl border border-gray-100 hover:border-emerald-100 transition-all flex justify-between items-center group"
                >
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <div className="text-xs font-bold text-gray-900 leading-tight mt-1">{item.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      C:{item.carbs}g | P:{item.protein}g | F:{item.fat}g
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-800 font-mono">{item.calories} kcal</span>
                    <button 
                      onClick={() => handleQuickLogDatabaseItem(item)}
                      className="p-1.5 bg-white hover:bg-emerald-500 hover:text-white rounded-lg text-emerald-600 transition-colors border border-gray-200 group-hover:border-emerald-200 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom manual food logger form */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900">Manual Nutrition Entry</h3>
            
            <form onSubmit={handleAddCustomFood} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Meal Session</label>
                  <select 
                    value={mealType} 
                    onChange={(e) => setMealType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                  >
                    <option value="Breakfast">Breakfast 🍳</option>
                    <option value="Lunch">Lunch 🍱</option>
                    <option value="Dinner">Dinner 🍛</option>
                    <option value="Snack">Snack 🍎</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Serving size estimate</label>
                  <input 
                    type="text" 
                    placeholder="e.g., 1 plate, 150 grams"
                    value={servingSizeInput}
                    onChange={(e) => setServingSizeInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Food Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Whole-wheat handmade Roti with vegetable curry"
                  value={foodNameInput}
                  onChange={(e) => setFoodNameInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Kcal</label>
                  <input 
                    type="number" 
                    placeholder="Cal" 
                    value={caloriesInput}
                    onChange={(e) => setCaloriesInput(e.target.value)}
                    className="w-full p-2 border border-gray-100 rounded-xl text-xs text-center bg-gray-50 focus:outline-emerald-500 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Protein (g)</label>
                  <input 
                    type="number" 
                    placeholder="Pro" 
                    value={proteinInput}
                    onChange={(e) => setProteinInput(e.target.value)}
                    className="w-full p-2 border border-gray-100 rounded-xl text-xs text-center bg-gray-50 focus:outline-emerald-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Carbs (g)</label>
                  <input 
                    type="number" 
                    placeholder="Carb" 
                    value={carbsInput}
                    onChange={(e) => setCarbsInput(e.target.value)}
                    className="w-full p-2 border border-gray-100 rounded-xl text-xs text-center bg-gray-50 focus:outline-emerald-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Fat (g)</label>
                  <input 
                    type="number" 
                    placeholder="Fat" 
                    value={fatInput}
                    onChange={(e) => setFatInput(e.target.value)}
                    className="w-full p-2 border border-gray-100 rounded-xl text-xs text-center bg-gray-50 focus:outline-emerald-500 font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-white rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Log Manual Food Item
              </button>
            </form>
          </div>

        </div>

        {/* Right column: AI camera analyzer & logs list */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AI recognition module */}
          <div className="bg-linear-to-b from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                AI Vision Food recognition
              </h3>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-900">
                Gemini 3.5 Engine
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Describe your plate or select one of our premium meal snap simulations to analyze complex regional proteins, fiber contents, and serving safety instantly.
            </p>

            {/* Quick simulated capture buttons */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Camera Roll Simulation Presets</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleSimulateCamera("https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400", "Homemade Beef Khichuri with Salad")}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${simulationImage ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900'}`}
                >
                  <span className="text-xs font-bold block text-slate-200">Beef Khichuri</span>
                  <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">📸 Select Photo</span>
                </button>
                <button 
                  onClick={() => handleSimulateCamera("https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400", "Grilled Tandoori Chicken Breast with steamed basmati and cucumber raita")}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${simulationImage ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900'}`}
                >
                  <span className="text-xs font-bold block text-slate-200">Tandoori Chicken</span>
                  <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">📸 Select Photo</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Or type descriptive text (e.g., '1 glass tok doi with honey')"
                value={aiInputText}
                onChange={(e) => setAiInputText(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-emerald-500"
              />
            </div>

            <button 
              onClick={handleAiFoodAnalysis}
              disabled={aiLoading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {aiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Scanning with Gemini...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" /> Snap & Analyze Food Plate
                </>
              )}
            </button>

            {/* AI Results Output panel */}
            {aiResult && (
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Identification Result</h4>
                    <div className="text-sm font-extrabold text-emerald-400 mt-0.5">{aiResult.foodName}</div>
                  </div>
                  <div className="bg-emerald-950 border border-emerald-900 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-mono">
                    Score: {aiResult.healthScore}/10
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center py-2 border-y border-slate-800/60 font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500">Calories</div>
                    <div className="text-xs font-bold text-white">{aiResult.calories}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Protein</div>
                    <div className="text-xs font-bold text-white">{aiResult.protein}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Carbs</div>
                    <div className="text-xs font-bold text-white">{aiResult.carbs}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Fat</div>
                    <div className="text-xs font-bold text-white">{aiResult.fat}g</div>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Micronutrients & Benefits</span>
                  <p className="text-slate-300 font-medium">{aiResult.keyMicros || "Fiber-rich, low sodium profile"}</p>
                </div>

                <div className="space-y-1 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Healthy Alternatives</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {aiResult.healthyAlternatives?.map((alt: string, i: number) => (
                      <li key={i}>{alt}</li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={handleAddAiResultToLogs}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" /> Accept & Log to Health Diary
                </button>
              </div>
            )}
          </div>

          {/* Today's logged foods list */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 flex justify-between items-center">
              <span>Today's Health Log</span>
              <span className="text-xs font-bold text-gray-400">({todayLogs.length} logged items)</span>
            </h3>

            {todayLogs.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Apple className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-400">No foods logged today yet.</p>
                <p className="text-[10px] text-gray-400 mt-1">Start by searching above or using the AI camera capture</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {todayLogs.map(log => (
                  <div 
                    key={log.id}
                    className="p-3 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase bg-gray-200 text-gray-700">
                          {log.mealType}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">{log.servingSize}</span>
                      </div>
                      <div className="text-xs font-bold text-gray-900 mt-1">{log.foodName}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        P: {log.protein}g | C: {log.carbs}g | F: {log.fat}g
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-gray-800 font-mono">{log.calories} kcal</span>
                      <button 
                        onClick={() => onDeleteFoodLog(log.id)}
                        className="text-gray-300 hover:text-rose-500 p-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
