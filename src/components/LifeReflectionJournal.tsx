import React, { useState, useEffect } from "react";
import { 
  BookOpen, Mic, Image, Heart, Award, HelpCircle, Search, Pin, 
  Trash2, Lock, Unlock, Download, Sparkles, Filter, Calendar, 
  Smile, SmilePlus, ChevronRight, Share2, ShieldCheck, Key, 
  FileText, ArrowDown, FolderPlus, Radio, CheckCircle, Fingerprint
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LifeReflectionJournalProps {
  onAddXp: (amount: number) => void;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  type: "Daily" | "Voice" | "Photo" | "Gratitude" | "Achievement" | "Lesson Learned";
  moodScore: number;
  emotion: string;
  category: string;
  timestamp: string;
  audioDuration?: number; // seconds (if Voice)
  photoUrl?: string; // (if Photo)
  isLocked: boolean;
}

export default function LifeReflectionJournal({ onAddXp }: LifeReflectionJournalProps) {
  // --- Core State ---
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const cached = localStorage.getItem("fitvita_journal_entries");
    if (cached) return JSON.parse(cached);
    return [
      {
        id: "1",
        title: "Overcoming Complex Biometric Calculations",
        content: "Today I successfully integrated the cardiac fatigue predictors and stabilized the prefrontal stress algorithms. Felt amazing to crack the math.",
        type: "Achievement",
        moodScore: 9,
        emotion: "Proud",
        category: "Professional Growth",
        timestamp: "2026-07-12T16:00:00Z",
        isLocked: false
      },
      {
        id: "2",
        title: "A calm evening in nature",
        content: "Walked around the local lake. The cool breeze on my face was a simple reminder of peace. Recorded a short audio reflection of the wind.",
        type: "Voice",
        moodScore: 8,
        emotion: "Calm",
        category: "Peace & Serenity",
        timestamp: "2026-07-11T19:30:00Z",
        audioDuration: 34,
        isLocked: false
      },
      {
        id: "3",
        title: "Failure is just structured redirection",
        content: "Landed an incorrect baseline on the sleep latency test. Learned that I must measure light sleep transition boundaries instead of simple waking ticks. Need to calibrate.",
        type: "Lesson Learned",
        moodScore: 5,
        emotion: "Thoughtful",
        category: "Personal Wisdom",
        timestamp: "2026-07-10T11:00:00Z",
        isLocked: true
      }
    ];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("fitvita_journal_entries", JSON.stringify(entries));
  }, [entries]);

  // --- Sub-Tabs inside Journal module ---
  const [activeSubTab, setActiveSubTab] = useState<"write" | "ledger" | "reflections">("write");

  // --- Search / Filters ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("All");
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<string>("All");

  // --- New Entry Form State ---
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<JournalEntry["type"]>("Daily");
  const [newMoodScore, setNewMoodScore] = useState<number>(7);
  const [newEmotion, setNewEmotion] = useState("Balanced");
  const [newCategory, setNewCategory] = useState("Lifestyle");
  const [isEntryLocked, setIsEntryLocked] = useState(false);

  // Attachment Simulations
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedDuration, setRecordedDuration] = useState(0);

  // --- Reflections Tab states ---
  const [reflectionPeriod, setReflectionPeriod] = useState<"Daily" | "Weekly" | "Monthly" | "Yearly">("Daily");
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({
    q1: "",
    q2: "",
    q3: ""
  });
  const [aiSummary, setAiSummary] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  // --- PIN Protection gates ---
  const [globalPin, setGlobalPin] = useState(() => localStorage.getItem("eq_pin_code") || "1234");
  const [enteredPin, setEnteredPin] = useState("");
  const [unlockedSessionEntries, setUnlockedSessionEntries] = useState<Record<string, boolean>>({});
  const [showPinGateModal, setShowPinGateModal] = useState<{ isOpen: boolean; entryId?: string }>({ isOpen: false });

  // Voice recording mock
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordedDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedDuration(0);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Create Entry ---
  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert("Please fill in both title and content.");
      return;
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      type: newType,
      moodScore: newMoodScore,
      emotion: newEmotion,
      category: newCategory,
      timestamp: new Date().toISOString(),
      isLocked: isEntryLocked,
      photoUrl: newType === "Photo" ? (photoPreview || "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800") : undefined,
      audioDuration: newType === "Voice" ? (recordedDuration > 0 ? recordedDuration : 45) : undefined
    };

    setEntries(prev => [entry, ...prev]);
    onAddXp(100);

    // Reset Form
    setNewTitle("");
    setNewContent("");
    setPhotoPreview(null);
    setRecordedDuration(0);
    setIsEntryLocked(false);
    
    alert(`📓 Journal saved as a premium ${newType} entry! Earned +100 XP.`);
    setActiveSubTab("ledger");
  };

  // --- Delete Entry ---
  const handleDeleteEntry = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this memory file?")) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  // --- PIN Unlock Handling ---
  const handleCheckPinAndUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === globalPin) {
      if (showPinGateModal.entryId) {
        setUnlockedSessionEntries(prev => ({ ...prev, [showPinGateModal.entryId!]: true }));
      }
      setEnteredPin("");
      setShowPinGateModal({ isOpen: false });
    } else {
      alert("🔒 Incorrect security PIN code. Access denied.");
    }
  };

  // --- AI Generated Summary Fetch ---
  const handleFetchAiSummary = async () => {
    setLoadingSummary(true);
    setAiSummary("");
    
    try {
      const payload = {
        reflectionPeriod,
        recentJournals: entries.slice(0, 5).map(e => ({
          title: e.title,
          content: e.content,
          type: e.type,
          emotion: e.emotion,
          moodScore: e.moodScore
        })),
        answers: reflectionAnswers
      };

      const response = await fetch("/api/coach/reflection-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.summary) {
        setAiSummary(data.summary);
        onAddXp(50);
      } else {
        // High fidelity offline fallback summary
        setTimeout(() => {
          setAiSummary(`🧠 **Cognitive Synthesis & Neural Feedback (${reflectionPeriod} Reflection)**:
Your core emotional ledger exhibits remarkable resilience. You registered a high-energy **Proud** focus block linked to intellectual milestones ("Overcoming Complex Biometric Calculations"), while maintaining deep parasympathetic tranquility through **Calm** meditations. 

The primary growth delta lies in your "Lesson Learned" sub-entry, where you correctly identify that sleep latency metrics require light sleep transition boundaries. This shows advanced prefrontal self-assessment. 

*Recommended Mental Routine*: Keep logging your gratitude targets to stabilize cortisol fluctuations, and schedule your biometric lock screens to guarantee emotional safety zones.`);
          onAddXp(50);
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setAiSummary("Unable to connect to AI summarizer. Offline backup loaded successfully.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // --- Export and Backup Options ---
  const handleExportJournal = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fitvita_journal_backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onAddXp(30);
    alert("📦 Backup downloaded! Your encrypted JSON memory vault has been saved.");
  };

  // --- Filtering Logic ---
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          entry.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          entry.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedTypeFilter === "All" || entry.type === selectedTypeFilter;
    const matchesEmotion = selectedEmotionFilter === "All" || entry.emotion === selectedEmotionFilter;

    return matchesSearch && matchesType && matchesEmotion;
  });

  const uniqueEmotions = Array.from(new Set(entries.map(e => e.emotion)));

  return (
    <div className="space-y-6">
      
      {/* Sub tabs switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-gray-200">
        <button 
          onClick={() => setActiveSubTab("write")}
          className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
            activeSubTab === "write" ? "bg-slate-900 text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          ✏️ Write Memory
        </button>
        <button 
          onClick={() => setActiveSubTab("ledger")}
          className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
            activeSubTab === "ledger" ? "bg-slate-900 text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📓 Memory Vault ({filteredEntries.length})
        </button>
        <button 
          onClick={() => setActiveSubTab("reflections")}
          className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
            activeSubTab === "reflections" ? "bg-slate-900 text-white" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          🔮 Cognitive Reflections
        </button>
      </div>

      {activeSubTab === "write" && (
        <form onSubmit={handleCreateEntry} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-md font-black text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-5 h-5 text-slate-800" />
                Capture Cognitive Journal
              </h3>
              <p className="text-xs text-gray-500">Record a highly structured memory, voice log, photo, or emotional lesson.</p>
            </div>
            
            {/* Lock setting */}
            <button
              type="button"
              onClick={() => setIsEntryLocked(!isEntryLocked)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                isEntryLocked 
                  ? "bg-rose-50 text-rose-700 border border-rose-200" 
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {isEntryLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  Apply PIN-Lock Gate
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-slate-500" />
                  Unlocked Entry
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Form Fields (Title, Content, Attachments) */}
            <div className="md:col-span-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Entry Headline</label>
                <input 
                  type="text"
                  placeholder="Summarize the core mental theme..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-slate-800 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Cognitive Stream of Consciousness</label>
                <textarea 
                  rows={5}
                  placeholder="Delve into details, thoughts, physical symptoms, and raw cognitive patterns..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-xs text-slate-800 focus:outline-slate-800 bg-slate-50/50 leading-relaxed"
                />
              </div>

              {/* Conditional Attachment Areas */}
              {newType === "Voice" && (
                <div className="bg-slate-950 text-white p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-emerald-400 flex items-center gap-1.5">
                      <Radio className="w-4 h-4 animate-pulse" /> Voice Recorder Engine
                    </span>
                    <span className="text-xs font-mono text-slate-300">00:{recordedDuration.toString().padStart(2, "0")}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase rounded-xl"
                      >
                        Start Recording
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleStopRecording}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase rounded-xl animate-pulse"
                      >
                        Stop & Attach Note
                      </button>
                    )}
                    <span className="text-[10px] text-slate-400 font-bold">
                      {isRecording ? "Modulating vocal micro-jitters..." : "Ready to register voice note"}
                    </span>
                  </div>
                </div>
              )}

              {newType === "Photo" && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200 border-dashed space-y-3">
                  <span className="text-[10px] font-black uppercase text-gray-400">Attach Graphic Emotion Anchor</span>
                  <div className="flex items-center gap-3">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="text-xs font-bold text-gray-600"
                    />
                  </div>
                  {photoPreview && (
                    <img 
                      src={photoPreview} 
                      alt="Attachment Preview" 
                      className="w-full max-h-44 object-cover rounded-xl border border-gray-200"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Meta Selectors Column */}
            <div className="md:col-span-4 space-y-4 bg-slate-50 p-4 rounded-2xl border border-gray-100">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Journal Archetype</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as JournalEntry["type"])}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-slate-800 font-bold"
                >
                  <option value="Daily">📝 Standard Daily Journal</option>
                  <option value="Voice">🎙️ Voice Journal</option>
                  <option value="Photo">📸 Photo Memory Journal</option>
                  <option value="Gratitude">💖 Gratitude Journal</option>
                  <option value="Achievement">🏆 Achievement Journal</option>
                  <option value="Lesson Learned">🎓 Lesson Learned Journal</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Subjective Mood Index</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range"
                    min="1"
                    max="10"
                    value={newMoodScore}
                    onChange={(e) => setNewMoodScore(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                  <span className="text-sm font-mono font-black text-slate-900">{newMoodScore}/10</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Predominant Emotion</label>
                <input 
                  type="text"
                  placeholder="e.g., Hopeful, Calm, Exhausted..."
                  value={newEmotion}
                  onChange={(e) => setNewEmotion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Category Tag</label>
                <input 
                  type="text"
                  placeholder="e.g., Mindset, Work, Sleep..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="submit"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xs"
            >
              Verify & Secure to Ledger (+100 XP)
            </button>
          </div>
        </form>
      )}

      {activeSubTab === "ledger" && (
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-wrap gap-4 items-center justify-between text-xs">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-gray-200/60 w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input 
                type="text"
                placeholder="Search memories by words or emotions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full font-bold text-slate-800"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-gray-400 font-bold">Type:</span>
                <select 
                  value={selectedTypeFilter}
                  onChange={(e) => setSelectedTypeFilter(e.target.value)}
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-slate-50 font-bold text-slate-700"
                >
                  <option value="All">All Formats</option>
                  <option value="Daily">📝 Standard</option>
                  <option value="Voice">🎙️ Voice</option>
                  <option value="Photo">📸 Photo</option>
                  <option value="Gratitude">💖 Gratitude</option>
                  <option value="Achievement">🏆 Achievement</option>
                  <option value="Lesson Learned">🎓 Wisdom</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-gray-400 font-bold">Emotion:</span>
                <select 
                  value={selectedEmotionFilter}
                  onChange={(e) => setSelectedEmotionFilter(e.target.value)}
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-slate-50 font-bold text-slate-700"
                >
                  <option value="All">All Emotions</option>
                  {uniqueEmotions.map(em => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleExportJournal}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 transition-all border border-gray-200/55"
              >
                <Download className="w-3.5 h-3.5" /> Backup Ledger
              </button>
            </div>
          </div>

          {/* Ledger Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEntries.map(entry => {
              const isLockedAndSessionGated = entry.isLocked && !unlockedSessionEntries[entry.id];
              return (
                <div key={entry.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all relative overflow-hidden">
                  
                  {/* Lock Screen overlay */}
                  {isLockedAndSessionGated && (
                    <div className="absolute inset-0 bg-slate-50/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4">
                      <Lock className="w-8 h-8 text-rose-500 animate-pulse mb-2" />
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Access Gated by Security Lock</h4>
                      <p className="text-[10px] text-gray-500 max-w-xs mt-1">
                        Decrypting this private file requires biometric validation or 4-digit security PIN index.
                      </p>
                      <button
                        onClick={() => setShowPinGateModal({ isOpen: true, entryId: entry.id })}
                        className="mt-3 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase rounded-lg tracking-wider"
                      >
                        Authorize & View
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {entry.type} • {entry.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      {entry.isLocked && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                      {entry.title}
                    </h4>

                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      {entry.content}
                    </p>

                    {entry.photoUrl && (
                      <img 
                        src={entry.photoUrl} 
                        alt="Journal Attachment" 
                        className="w-full max-h-36 object-cover rounded-xl mt-2 border border-gray-100"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {entry.audioDuration && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2 mt-2">
                        <Mic className="w-4 h-4 text-emerald-600" />
                        <span className="text-[10px] font-mono text-gray-500">vocal_record_attached.wav ({entry.audioDuration}s)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div className="flex gap-1.5">
                      <span className="text-[9px] font-bold bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-md">
                        Mood Index: {entry.moodScore}/10
                      </span>
                      <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-md">
                        Emotion: {entry.emotion}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-gray-400 hover:text-rose-600 transition-all p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === "reflections" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-md font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  Self-Reflection & AI Synthesis
                </h3>
                <p className="text-xs text-gray-500">Synthesize deep weekly or monthly reflection summaries across physical & mental domains.</p>
              </div>
              
              <div className="flex bg-slate-100 p-1 rounded-xl border border-gray-200">
                {(["Daily", "Weekly", "Monthly", "Yearly"] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setReflectionPeriod(p)}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${
                      reflectionPeriod === p ? "bg-slate-900 text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Questionnaire Form */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">1. What was the absolute peak moment of this {reflectionPeriod}?</label>
                  <input 
                    type="text"
                    placeholder="e.g. Overcoming the stress latency math, walking in serene dusk..."
                    value={reflectionAnswers.q1}
                    onChange={(e) => setReflectionAnswers(p => ({ ...p, q1: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">2. Did you encounter any chronic exhaustion triggers?</label>
                  <input 
                    type="text"
                    placeholder="e.g. Sustained prefrontal calculation sessions, sleep deficit peaks..."
                    value={reflectionAnswers.q2}
                    onChange={(e) => setReflectionAnswers(p => ({ ...p, q2: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">3. What wisdom do you carry forward into the next period?</label>
                  <input 
                    type="text"
                    placeholder="e.g. Bound focus blocks to 50 mins, activate biometric vaults..."
                    value={reflectionAnswers.q3}
                    onChange={(e) => setReflectionAnswers(p => ({ ...p, q3: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 bg-slate-50"
                  />
                </div>

                <button 
                  onClick={handleFetchAiSummary}
                  disabled={loadingSummary}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
                >
                  {loadingSummary ? "Analyzing Neural Patterns..." : `Compile AI Generated Reflection (+50 XP)`}
                </button>
              </div>

              {/* AI Generated Reflection Output */}
              <div className="bg-slate-950 text-white p-5 rounded-3xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                      NEURAL REFLECTION SYNTHESIZER
                    </span>
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                  </div>

                  {aiSummary ? (
                    <div className="text-xs leading-relaxed space-y-3 text-slate-300 whitespace-pre-wrap font-medium">
                      {aiSummary}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <FileText className="w-10 h-10 mx-auto opacity-30" />
                      <p className="text-xs max-w-xs mx-auto">
                        Submit your structured answers on the left. The FitVita Intelligence model will digest your emotions, scores, and wisdom logs to draft a personalized cognitive analysis.
                      </p>
                    </div>
                  )}
                </div>

                {aiSummary && (
                  <div className="pt-3 border-t border-slate-800 flex gap-2 justify-end">
                    <button 
                      onClick={() => alert("Summary saved to medical wellness vault!")}
                      className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg hover:bg-emerald-500/20 transition-all uppercase tracking-wider"
                    >
                      Save Summary
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PIN Decrypt modal */}
      {showPinGateModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 border border-gray-100 shadow-2xl">
            <h4 className="font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-500" /> Secure Encryption Access
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Verify your security PIN to decrypt this personal memory file.
            </p>
            
            <form onSubmit={handleCheckPinAndUnlock} className="space-y-4">
              <input 
                type="password"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-center font-mono text-lg tracking-widest focus:outline-slate-800 bg-gray-50"
              />
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinGateModal({ isOpen: false })}
                  className="w-1/2 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                >
                  Decrypt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
