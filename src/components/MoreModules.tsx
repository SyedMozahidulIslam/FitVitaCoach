import React, { useState } from "react";
import { 
  ShoppingBag, Calendar, UserCheck, ShieldAlert, Heart, Accessibility, 
  Plus, Check, Trash2, Smartphone, Sparkles, RefreshCw, QrCode 
} from "lucide-react";
import { UserProfile, GroceryItem } from "../types";

interface MoreModulesProps {
  userProfile: UserProfile;
  onChangeProfile: (profile: Partial<UserProfile>) => void;
  onAddXp: (amount: number) => void;
}

export default function MoreModules({
  userProfile,
  onChangeProfile,
  onAddXp
}: MoreModulesProps) {
  const [activeTab, setActiveTab] = useState<"grocery" | "women" | "emergency" | "doctor" | "wearable" | "accessibility">("grocery");

  // --- Grocery State ---
  const [groceries, setGroceries] = useState<GroceryItem[]>([
    { id: "1", name: "Red Rice (Lal Chal)", category: "Grains", bought: false, estimatedPriceBDT: 180, expiryDate: "2026-08-10", alternativeName: "Brown basmati rice" },
    { id: "2", name: "Masoor Dal (Organic lentils)", category: "Proteins", bought: true, estimatedPriceBDT: 140, expiryDate: "2026-09-01", alternativeName: "Green gram mung dal" },
    { id: "3", name: "Tok Doi (Plain sour curd)", category: "Dairy", bought: false, estimatedPriceBDT: 90, expiryDate: "2026-07-20", alternativeName: "Greek unsweetened yogurt" },
  ]);
  const [groceryName, setGroceryName] = useState("");
  const [groceryPrice, setGroceryPrice] = useState("100");
  const [groceryCat, setGroceryCat] = useState("Fresh Veggies");

  const handleAddGrocery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groceryName.trim()) return;
    setGroceries(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        name: groceryName,
        category: groceryCat,
        bought: false,
        estimatedPriceBDT: Number(groceryPrice) || 100,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        alternativeName: "Organic alternative"
      }
    ]);
    setGroceryName("");
    onAddXp(50);
  };

  const handleToggleGrocery = (id: string) => {
    setGroceries(prev => prev.map(item => item.id === id ? { ...item, bought: !item.bought } : item));
  };

  const handleDeleteGrocery = (id: string) => {
    setGroceries(prev => prev.filter(item => item.id !== id));
  };

  // --- Women's Health State ---
  const [cycleLength, setCycleLength] = useState(28);
  const [lastPeriodDate, setLastPeriodDate] = useState("2026-07-01");
  const [symptoms, setSymptoms] = useState<string[]>([]);

  // Calculate Ovulation Date (approx 14 days after last period start)
  const calcOvulationDate = () => {
    try {
      const baseDate = new Date(lastPeriodDate);
      baseDate.setDate(baseDate.getDate() + 14);
      return baseDate.toDateString();
    } catch {
      return "Pending calculation";
    }
  };

  // --- Wearable Sync States ---
  const [wearableType, setWearableType] = useState<"Apple Health" | "Google Fit" | "Fitbit" | "Garmin">("Apple Health");
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done">("idle");

  const handleTriggerSync = () => {
    setSyncStatus("syncing");
    setTimeout(() => {
      setSyncStatus("done");
      onAddXp(200);
      alert(`${wearableType} syncing completed! Dynamic telemetry loaded.`);
    }, 2000);
  };

  // --- Accessibility Settings ---
  const [fontSize, setFontSize] = useState<"standard" | "large" | "extra-large">("standard");
  const [colorBlind, setColorBlind] = useState(false);
  const [screenReaderActive, setScreenReaderActive] = useState(false);

  return (
    <div className="space-y-6" id="more_modules_root">
      
      {/* Sidebar-style Nav Header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-4 overflow-x-auto">
        <div className="flex gap-2 min-w-[700px] md:min-w-0">
          {[
            { id: "grocery", label: "Grocery & Pantry", icon: ShoppingBag },
            { id: "women", label: "Women's Health", icon: Calendar },
            { id: "emergency", label: "Emergency Profile", icon: ShieldAlert },
            { id: "doctor", label: "Nutritionist Portal", icon: UserCheck },
            { id: "wearable", label: "Wearables Sync", icon: Heart },
            { id: "accessibility", label: "Accessibility Mode", icon: Accessibility }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id 
                    ? "bg-emerald-500 text-white shadow-sm" 
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* 1. GROCERY AND PANTRY PLANNER */}
        {activeTab === "grocery" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="grocery_panel">
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-bold text-gray-900">Grocery Shopping Planner & Expiry Track</h3>
              <p className="text-xs text-gray-500">Auto-calculated pantry budget based on standard dietitian meal lists.</p>

              <div className="space-y-3">
                {groceries.map(item => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleToggleGrocery(item.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          item.bought ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-gray-300 text-gray-300"
                        }`}
                      >
                        {item.bought && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <div>
                        <div className={`font-bold ${item.bought ? "line-through text-gray-400" : "text-gray-900"}`}>{item.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Category: {item.category} | Expiry: {item.expiryDate}
                        </div>
                        {item.alternativeName && (
                          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">💡 Alternative: {item.alternativeName}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-gray-800 font-mono">৳ {item.estimatedPriceBDT} BDT</span>
                      <button onClick={() => handleDeleteGrocery(item.id)} className="text-gray-300 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="p-4 bg-emerald-50 rounded-2xl flex justify-between items-center text-xs font-bold text-emerald-950">
                <span>Estimated Shopping Budget</span>
                <span className="font-mono text-base text-emerald-800">
                  ৳ {groceries.reduce((sum, item) => sum + (item.bought ? 0 : item.estimatedPriceBDT), 0)} BDT
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <h4 className="font-bold text-gray-900">Add Shopping Target</h4>
              <form onSubmit={handleAddGrocery} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Item Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Organic red lentils"
                    value={groceryName}
                    onChange={(e) => setGroceryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Estimated Price (BDT)</label>
                  <input 
                    type="number" 
                    value={groceryPrice}
                    onChange={(e) => setGroceryPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
                  <select 
                    value={groceryCat}
                    onChange={(e) => setGroceryCat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                  >
                    <option value="Fresh Veggies">Fresh Veggies 🥦</option>
                    <option value="Proteins">Proteins & Fish 🐟</option>
                    <option value="Grains">Grains & Pulses 🌾</option>
                    <option value="Dairy">Dairy & Curds 🥛</option>
                  </select>
                </div>

                <button type="submit" className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors">
                  Add to List
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 2. WOMEN'S HEALTH MODULE */}
        {activeTab === "women" && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6" id="women_panel">
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-rose-500" />
                Women's Wellness & Menstrual tracker
              </h3>
              <p className="text-xs text-gray-400">Calculate fertile windows, predict upcoming cycles, and monitor symptoms with extreme precision.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100/80">
                <h4 className="text-xs uppercase tracking-wider font-extrabold text-gray-500">Calculator parameters</h4>
                
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Last period start date</label>
                    <input 
                      type="date"
                      value={lastPeriodDate}
                      onChange={(e) => setLastPeriodDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-emerald-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Average cycle length (days)</label>
                    <input 
                      type="number"
                      value={cycleLength}
                      onChange={(e) => setCycleLength(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-extrabold text-rose-800">Predicted Fertile Windows</h4>
                  <div className="text-2xl font-extrabold text-rose-950 mt-2">{calcOvulationDate()}</div>
                  <p className="text-[10px] text-rose-700 font-medium mt-1">Expected Peak Ovulation & Fertility Window.</p>
                </div>

                <div className="text-[10px] text-rose-900 leading-relaxed italic bg-white/60 p-2.5 rounded-xl border border-rose-100/30">
                  ⚠️ Note: This is an estimated mathematical forecast. Consult a certified gynecologist for medical family planning advice.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. EMERGENCY PROFILE CARD */}
        {activeTab === "emergency" && (
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-6" id="emergency_panel">
            <div className="space-y-1">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Emergency Medical Profile (QR Enabled)
              </h3>
              <p className="text-xs text-slate-400">Offline-ready profile designed to convey essential data to emergency physicians instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile card details */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-3 font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 font-bold">NAME:</span>
                  <span className="text-xs font-bold text-slate-200">{userProfile.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 font-bold">BLOOD GROUP:</span>
                  <span className="text-xs font-bold text-rose-500">O+ (Positive)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 font-bold">KEY ALLERGIES:</span>
                  <span className="text-xs font-bold text-slate-200">{userProfile.allergies.join(", ") || "None registered"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs text-slate-500 font-bold">EMERGENCY CONTACT:</span>
                  <span className="text-xs font-bold text-emerald-400">+880-1712345678</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500 font-bold">INSURANCE STATUS:</span>
                  <span className="text-xs font-bold text-slate-200">MetLife Premium Health</span>
                </div>
              </div>

              {/* QR Emergency Code Card */}
              <div className="bg-white text-slate-950 p-5 rounded-2xl flex flex-col items-center justify-center space-y-3 text-center">
                <QrCode className="w-28 h-28 text-slate-950" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Emergency QR Identifier</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Medic scanning displays Blood, Allergy, Contact & Caretaker specs offline.</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 4. DOCTOR & NUTRITIONIST PORTAL PREVIEW */}
        {activeTab === "doctor" && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6" id="doctor_panel">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                Practitioner & Dietitian Portal
              </h3>
              <p className="text-xs text-gray-400">Direct workspace preview for medical advisors, physicians, and fitness coaches reviewing patient logs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center space-y-1">
                <div className="text-lg font-bold text-gray-900">14</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">Active Patients</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center space-y-1">
                <div className="text-lg font-bold text-gray-900">03</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">Consultation Requests</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center space-y-1">
                <div className="text-lg font-bold text-gray-900">98%</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">Roster Compliance</div>
              </div>

            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Roster Active Patients Queue</span>
              
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/60 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-gray-900">Tasnim Alam (34 y/o)</span>
                  <p className="text-[9px] text-emerald-800 font-semibold mt-0.5">Focus: High Hypertension & PCOS diet plans</p>
                </div>
                <button className="px-3 py-1 bg-white hover:bg-emerald-500 hover:text-white border border-gray-200 rounded-lg text-[10px] font-bold transition-all">
                  Load Client Logs
                </button>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-gray-900">Dr. Safat Zamil (52 y/o)</span>
                  <p className="text-[9px] text-gray-500 mt-0.5">Focus: Caloric maintenance, lipid profile management</p>
                </div>
                <button className="px-3 py-1 bg-white hover:bg-emerald-500 hover:text-white border border-gray-200 rounded-lg text-[10px] font-bold transition-all">
                  Load Client Logs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. WEARABLES HEALTH SYNC */}
        {activeTab === "wearable" && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6" id="wearable_panel">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                <Smartphone className="w-5 h-5 text-blue-500" />
                Wearable Hardware Synchronization
              </h3>
              <p className="text-xs text-gray-400">Bridge steps, active calorie expenditure, cardiac performance, and circadian sleep phases instantly.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: "Apple Health", color: "bg-rose-50 border-rose-100 text-rose-700" },
                { name: "Google Fit", color: "bg-blue-50 border-blue-100 text-blue-700" },
                { name: "Fitbit", color: "bg-teal-50 border-teal-100 text-teal-700" },
                { name: "Garmin Connect", color: "bg-slate-50 border-slate-200 text-slate-800" },
              ].map(device => (
                <button 
                  key={device.name}
                  onClick={() => setWearableType(device.name as any)}
                  className={`p-4 rounded-2xl border text-center font-bold text-xs transition-all ${
                    wearableType === device.name ? "ring-2 ring-emerald-500 " + device.color : "bg-gray-50/50 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {device.name}
                </button>
              ))}
            </div>

            <div className="p-6 bg-slate-900 text-white rounded-2xl text-center space-y-4">
              <div>
                <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full">
                  Bridge Protocol: Bluetooth BLE / REST
                </span>
                <h4 className="text-sm font-bold text-slate-200 mt-2">Active Bridge: {wearableType}</h4>
              </div>

              {syncStatus === "syncing" ? (
                <div className="flex flex-col items-center justify-center space-y-2 py-4">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="text-xs text-slate-400">Syncing telemetry data...</span>
                </div>
              ) : (
                <button 
                  onClick={handleTriggerSync}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all"
                >
                  Sync Telemetry Metrics Now
                </button>
              )}
            </div>
          </div>
        )}

        {/* 6. ACCESSIBILITY OPTIONS */}
        {activeTab === "accessibility" && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6" id="accessibility_panel">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                <Accessibility className="w-5 h-5 text-emerald-600" />
                In-App Accessibility Preferences
              </h3>
              <p className="text-xs text-gray-400">Optimize typographic layouts and visual configurations for cognitive ease, visual clarity, or assistive devices.</p>
            </div>

            <div className="space-y-4">
              
              {/* Font scaling */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Text Font Size Scaling</label>
                <div className="flex gap-2">
                  {["standard", "large", "extra-large"].map(size => (
                    <button 
                      key={size}
                      onClick={() => setFontSize(size as any)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        fontSize === size ? "bg-emerald-500 text-white border-emerald-500" : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-transparent"
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Blind preset toggling */}
              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-xs font-bold text-gray-900">Color Blind Assist Mode (Deuteranopia)</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">Increases red/green contrast boundaries across health charts.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={colorBlind} 
                  onChange={() => setColorBlind(!colorBlind)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
              </div>

              {/* Screen reader tags */}
              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-xs font-bold text-gray-900">Screen Reader ARIA Enhancement</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">Injects verbose audio-descriptions for non-visual exploration.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={screenReaderActive} 
                  onChange={() => setScreenReaderActive(!screenReaderActive)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
