import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, RefreshCw, HelpCircle, BrainCircuit, Bot, User } from "lucide-react";
import { UserProfile } from "../types";

interface AICoachChatProps {
  userProfile: UserProfile;
}

interface Message {
  role: "user" | "model";
  content: string;
}

const QUICK_PROMPTS = [
  "Suggest a high-protein Bangladeshi dinner using Ilish or Chicken.",
  "Design an active warm-up routine for stiff lower joints.",
  "Give me science-backed techniques to reduce high cortisol spikes.",
  "What are the benefits of Lal Chal (Red Rice) over white polished rice?",
];

export default function AICoachChat({ userProfile }: AICoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: `Hello! I am **FitVitaCoach**, your elite AI Wellness & Nutrition Coach. 🧠🌱

I'm programmed with deep knowledge of dietary science, cardiology, athletic training, and sleep hygiene. 

How can I help you optimize your health metrics today? Ask me about custom meal structures, local foods, joint-friendly workouts, or cortisol control techniques.`
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    const userText = textToSend.trim();
    if (!userText) return;

    // Add user message locally
    const updatedMessages = [...messages, { role: "user" as const, content: userText }];
    setMessages(updatedMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          userProfile
        })
      });

      if (!response.ok) {
        throw new Error("Failed to secure answer from FitVitaCoach.");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "model" as const, content: data.text || "I was unable to structure an answer. Let me try again." }]);
    } catch (error) {
      console.error("AI Coach Chat Error:", error);
      setMessages(prev => [
        ...prev,
        { 
          role: "model" as const, 
          content: "⚠️ I encountered a local connectivity issue, but as your digital health coach, I recommend focusing on drinking a glass of water and taking a 5-minute stretch. Let's try chatting again once connection returns." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="ai_coach_chat">
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            24/7 Virtual Health Coach & AI Companion
          </h2>
          <p className="text-xs text-slate-400">
            Powered by advanced Gemini 3.5 Models. Get real-time nutrition tips, physiological posture checks, and metabolic critiques.
          </p>
        </div>
        <span className="px-3 py-1 bg-emerald-950 border border-emerald-900 text-emerald-400 font-bold text-xs rounded-full uppercase tracking-wider">
          Clinically Informed
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Active Chat Box */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-xs flex flex-col h-[520px] overflow-hidden">
          
          {/* Chat Messages Log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  msg.role === "user" ? "bg-emerald-500 text-white" : "bg-slate-900 text-emerald-400"
                }`}>
                  {msg.role === "user" ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
                </div>

                {/* Bubble content */}
                <div className={`p-4 rounded-3xl text-xs leading-relaxed space-y-2 ${
                  msg.role === "user" 
                    ? "bg-emerald-500 text-white rounded-tr-none font-medium" 
                    : "bg-white border border-gray-150 text-slate-800 rounded-tl-none font-normal shadow-2xs"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 bg-white border border-gray-150 rounded-3xl rounded-tl-none shadow-2xs">
                  <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1.5">
                    Analyzing biomarkers & cooking databases...
                  </span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Typing Action Form */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex gap-2"
            >
              <input 
                type="text" 
                placeholder="Ask FitVitaCoach about meal recipes, joint stiffness or bedtime routines..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-150 rounded-2xl text-xs bg-gray-50 focus:bg-white focus:outline-emerald-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-100 text-white disabled:text-gray-400 rounded-2xl transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Quick Action Prompt Cards */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
            <BrainCircuit className="w-5 h-5 text-emerald-600" />
            Quick Trigger Coach Inquiries
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Select a specialized sports science or dietetics prompt preset below to consult FitVitaCoach instantly.
          </p>

          <div className="space-y-2.5">
            {QUICK_PROMPTS.map((promptText, i) => (
              <button 
                key={i}
                onClick={() => handleSendMessage(promptText)}
                disabled={isLoading}
                className="w-full p-3 bg-gray-50/50 hover:bg-emerald-50/40 text-left rounded-2xl border border-gray-100 hover:border-emerald-100 transition-all text-xs font-semibold text-gray-700 block leading-snug"
              >
                {promptText}
              </button>
            ))}
          </div>

          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-[11px] text-emerald-950 font-medium leading-relaxed mt-2">
            💡 <span className="font-bold">Coach Tip:</span> Be specific about ingredients you have in your kitchen or any injuries you want me to account for!
          </div>
        </div>

      </div>
    </div>
  );
}
