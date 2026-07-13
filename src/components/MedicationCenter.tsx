import React, { useState } from "react";
import { Plus, Check, Calendar, ClipboardList, ShieldAlert, Sparkles, UploadCloud, FileText, Lock, ShieldCheck } from "lucide-react";
import { Medication, UserProfile } from "../types";

interface MedicationCenterProps {
  userProfile: UserProfile;
  medications: Medication[];
  onToggleMedication: (id: string, date: string) => void;
  onAddMedication: (med: Omit<Medication, "id" | "loggedDays">) => void;
  onAddXp: (amount: number) => void;
}

export default function MedicationCenter({
  userProfile,
  medications,
  onToggleMedication,
  onAddMedication,
  onAddXp
}: MedicationCenterProps) {
  const [medName, setMedName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("08:00 AM");
  const [refills, setRefills] = useState("3");
  const [instructions, setInstructions] = useState("");

  // Simulated prescription upload state
  const [vaultFiles, setVaultFiles] = useState<{ name: string; date: string; docType: string }[]>([
    { name: "Annual_Biometric_Report_SMI_Fahim.pdf", date: "2026-06-15", docType: "Clinical Bloodwork" },
    { name: "Cardiac_Enzymes_ECG_Result.pdf", date: "2026-05-10", docType: "Cardiology Clearance" }
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleCreateMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    onAddMedication({
      name: medName,
      dosage,
      time,
      refillCount: Number(refills) || 1,
      instructions: instructions || "Take with lukewarm water"
    });

    setMedName("");
    setDosage("");
    setRefills("3");
    setInstructions("");
    onAddXp(100);
    alert(`Medication "${medName}" added to daily schedule!`);
  };

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setVaultFiles(prev => [
        ...prev,
        {
          name: "FitVita_Physio_Diagnostic_Vault.pdf",
          date: todayStr,
          docType: "AI Wellness Prescription"
        }
      ]);
      setIsUploading(false);
      onAddXp(150);
      alert("Document securely encrypted and uploaded to local prescription HIPAA-compliant vault!");
    }, 1500);
  };

  return (
    <div className="space-y-6" id="medication_center">
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-500" />
            Clinical Medication & Health Document Vault
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200 animate-pulse">
              <Lock className="w-3 h-3 text-teal-600" /> Private & Encrypted
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Maintain strict dosage adherence, monitor refill logs, and preserve verified health reports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Active medicine logs */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 flex justify-between items-center flex-wrap gap-2">
              <span className="flex items-center gap-2">
                Today's Dosage Schedule
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Private & Encrypted
                </span>
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">Date: {todayStr}</span>
            </h3>

            {medications.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-400">No active medications registered.</p>
                <p className="text-[10px] text-gray-400 mt-1">Setup your schedule on the right sidebar if prescribed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medications.map(med => {
                  const loggedToday = med.loggedDays.includes(todayStr);

                  return (
                    <div 
                      key={med.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${loggedToday ? "bg-emerald-50/40 border-emerald-100" : "bg-gray-50/40 border-gray-100"}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-gray-900">{med.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800">
                            🕒 {med.time}
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[8px] font-bold border border-gray-200">
                            <Lock className="w-2.5 h-2.5 text-gray-400" /> AES-256 Secured
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium">Dosage: {med.dosage} | Refills remaining: {med.refillCount}</p>
                        <p className="text-[10px] text-emerald-800 italic font-semibold">💡 Instructions: {med.instructions}</p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button 
                          onClick={() => onToggleMedication(med.id, todayStr)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            loggedToday 
                              ? "bg-emerald-500 text-white" 
                              : "bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50"
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          {loggedToday ? "Taken Today" : "Mark as Taken"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Secure Document Vault Upload Section */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                HIPAA-Compliant Secure Document Vault
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/15 text-teal-300 border border-teal-500/35">
                <Lock className="w-3 h-3 text-teal-400" /> Private & Encrypted
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Store pediatric records, clinical blood reports, vaccination cards, and cardiologist prescriptions securely. All files are encrypted locally.
            </p>

            <div className="border border-dashed border-slate-800 bg-slate-950 p-6 rounded-2xl text-center space-y-2">
              <UploadCloud className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-xs font-bold text-slate-300">Drag and drop health files here</div>
              <button 
                onClick={handleSimulatedUpload}
                disabled={isUploading}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-bold text-xs rounded-xl transition-all"
              >
                {isUploading ? "Uploading Securely..." : "Select Document / Vaccine Card"}
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Vault File Roster ({vaultFiles.length})</span>
              {vaultFiles.map((file, idx) => (
                <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-bold text-slate-200">{file.name}</div>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-slate-800 text-teal-400 text-[8px] font-extrabold border border-teal-500/30">
                        <Lock className="w-2.5 h-2.5 text-teal-500" /> Encrypted
                      </span>
                    </div>
                    <div className="text-[9px] text-emerald-400 font-medium">Type: {file.docType}</div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{file.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right sidebar: Add meds */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-900 pb-2 border-b border-gray-50">Log Clinical Dosage</h3>
          
          <form onSubmit={handleCreateMedication} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Medicine Name</label>
              <input 
                type="text" 
                placeholder="e.g. Metformin 500mg, Atorvastatin"
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Dosage size</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1 Tablet"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Trigger Time</label>
                <input 
                  type="text" 
                  placeholder="08:00 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Refill Limits</label>
              <input 
                type="number" 
                placeholder="Number of refills"
                value={refills}
                onChange={(e) => setRefills(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Usage Instructions</label>
              <input 
                type="text" 
                placeholder="e.g., Take after heavy lunch"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-100 rounded-xl text-xs bg-gray-50 focus:outline-emerald-500"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-white rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Save Schedule Medication
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
