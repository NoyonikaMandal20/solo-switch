"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Lock, HeartPulse, LogOut, AlertCircle } from "lucide-react";
import { encryptPayload } from "@/lib/crypto";
export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // -- PAGE STATE --
  const [isCheckingVault, setIsCheckingVault] = useState(true);
  const [hasActiveVault, setHasActiveVault] = useState(false);
  const [nextCheckInDue, setNextCheckInDue] = useState<string | null>(null);
  
  // -- FORM STATE --
  const [activeTab, setActiveTab] = useState("business");
  const [financials, setFinancials] = useState("");
  const [clients, setClients] = useState("");
  const [letter, setLetter] = useState("");
  const [runbook, setRunbook] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");
  const [passphrase, setPassphrase] = useState("");
  
  // -- UI STATE --
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 1. Check if user already has a vault on load
  useEffect(() => {
    const fetchVaultStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from("vaults")
          .select("next_check_in_due, status")
          .eq("user_id", user.id)
          .single();

        if (data && data.status === "active") {
          setHasActiveVault(true);
          setNextCheckInDue(new Date(data.next_check_in_due).toLocaleDateString());
        }
      }
      setIsCheckingVault(false);
    };

    fetchVaultStatus();
  }, [supabase]);

  // 2. The "I'm Alive" Reset Timer Function
  const handleResetTimer = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Add 30 days from today
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 30); 

      const { error } = await supabase
        .from("vaults")
        .update({ next_check_in_due: newDate.toISOString() })
        .eq("user_id", user.id);

      if (error) {
        setError(error.message);
      } else {
        setNextCheckInDue(newDate.toLocaleDateString());
        setMessage("Timer successfully reset for another 30 days!");
      }
    }
    setLoading(false);
  };

  // 3. The Sign Out Function
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // 4. The Save Vault Function
  const handleSaveVault = async () => {
    setLoading(true);
    setError("");
    
    if (!passphrase || !emergencyEmail) {
      setError("Master passphrase and emergency email are required.");
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Bundle and encrypt the payload
      const payload = JSON.stringify({ financials, clients, letter, runbook });
      const encryptedPayload = await encryptPayload(payload, passphrase);
      const nextCheckIn = new Date();
      nextCheckIn.setDate(nextCheckIn.getDate() + 30); // 30 day cadence

      const { error: dbError } = await supabase.from("vaults").insert({
        user_id: user.id,
        encrypted_payload: encryptedPayload,
        emergency_email: emergencyEmail,
        cadence_days: 30,
        next_check_in_due: nextCheckIn.toISOString(),
        status: "active",
      });

      if (dbError) throw dbError;

      setHasActiveVault(true);
      setNextCheckInDue(nextCheckIn.toLocaleDateString());
    } catch (err: any) {
      setError(err.message || "Failed to encrypt and save vault.");
    }
    setLoading(false);
  };

  // -- RENDER: LOADING STATE --
  if (isCheckingVault) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono text-emerald-500">
        Checking secure vault...
      </div>
    );
  }

  // -- RENDER: ACTIVE VAULT STATE --
  if (hasActiveVault) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-mono flex flex-col">
        {/* Header with Sign Out */}
        <header className="w-full max-w-4xl mx-auto flex justify-between items-center py-4 mb-8 border-b border-neutral-800">
          <div className="flex items-center gap-2 font-bold text-lg">
            <ShieldCheck className="text-emerald-500 w-6 h-6" /> SoloSwitch
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </header>

        <div className="max-w-2xl mx-auto w-full space-y-6 mt-4">
          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg text-center space-y-6 shadow-2xl">
            <Lock className="w-16 h-16 text-emerald-500 mx-auto" />
            
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Vault is Active & Monitored</h2>
              <p className="text-neutral-400 text-sm">
                Your encrypted payload is securely stored. The zero-knowledge deadman engine is monitoring your check-ins.
              </p>
            </div>
            
            <div className="inline-block bg-neutral-950 border border-neutral-800 px-6 py-4 rounded-lg text-sm text-emerald-400">
              <span className="block text-neutral-500 uppercase text-xs mb-1">Next Check-in Due</span>
              <span className="text-xl font-bold">{nextCheckInDue}</span>
            </div>
            
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-emerald-400 text-sm">{message}</p>}

            <div className="pt-4 border-t border-neutral-800">
              <button 
                onClick={handleResetTimer}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-4 rounded transition disabled:opacity-50"
              >
                <HeartPulse className="w-5 h-5" /> I'm Alive (Reset Timer)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -- RENDER: SETUP NEW VAULT FORM --
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-mono flex flex-col">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto flex justify-between items-center py-4 mb-8 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-500 w-6 h-6" /> 
          <div>
            <h1 className="font-bold text-lg leading-none">SoloSwitch Vault</h1>
            <span className="text-xs text-neutral-500">Zero-Knowledge Business Handover</span>
          </div>
        </div>
        <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </header>

      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        {/* Tabs */}
        <div className="flex gap-6 border-b border-neutral-800 pb-2">
          <button 
            onClick={() => setActiveTab("business")}
            className={`text-sm font-bold flex items-center gap-2 pb-2 -mb-2 ${activeTab === "business" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-neutral-500"}`}
          >
            1. Business & Financials
          </button>
          <button 
            onClick={() => setActiveTab("runbook")}
            className={`text-sm font-bold flex items-center gap-2 pb-2 -mb-2 ${activeTab === "runbook" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-neutral-500"}`}
          >
            &gt;_ 2. Developer Runbook & Secrets
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "business" ? (
            <>
              <div className="space-y-2">
                <label className="text-xs uppercase text-neutral-500 font-bold">Financial Accounts & Payout Instructions</label>
                <textarea 
                  value={financials}
                  onChange={(e) => setFinancials(e.target.value)}
                  className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded p-4 text-sm focus:border-emerald-500 focus:outline-none" 
                  placeholder="Stripe Dashboard URL, Bank accounts, Wise routing..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase text-neutral-500 font-bold">Pending Client Handover & Contracts</label>
                <textarea 
                  value={clients}
                  onChange={(e) => setClients(e.target.value)}
                  className="w-full h-24 bg-neutral-900 border border-neutral-800 rounded p-4 text-sm focus:border-emerald-500 focus:outline-none" 
                  placeholder="List of active agency clients, outstanding balances..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase text-neutral-500 font-bold">Letter / Instructions for Loved Ones</label>
                <textarea 
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                  className="w-full h-32 bg-neutral-900 border border-neutral-800 rounded p-4 text-sm focus:border-emerald-500 focus:outline-none" 
                  placeholder="Step-by-step instructions on what to do with the company..."
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-xs uppercase text-neutral-500 font-bold">Developer Runbook & API Keys</label>
              <textarea 
                value={runbook}
                onChange={(e) => setRunbook(e.target.value)}
                className="w-full h-64 bg-neutral-900 border border-neutral-800 rounded p-4 text-sm focus:border-emerald-500 focus:outline-none font-mono" 
                placeholder="AWS credentials, Vercel logic, Domain registrars, DB passwords..."
              />
            </div>
          )}
        </div>

        {/* Security Rules (Always visible at bottom) */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm mb-4">
            <AlertCircle className="w-4 h-4" /> Security & Trigger Rules
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase text-neutral-500 font-bold">Emergency Contact Email</label>
              <input 
                type="email"
                value={emergencyEmail}
                onChange={(e) => setEmergencyEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-sm focus:border-emerald-500 focus:outline-none" 
                placeholder="partner@gmail.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase text-neutral-500 font-bold">Master Passphrase (Do not lose this)</label>
              <input 
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-sm focus:border-emerald-500 focus:outline-none" 
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

          <button 
            onClick={handleSaveVault}
            disabled={loading || !passphrase || !emergencyEmail}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded transition disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> Encrypt & Activate Vault
          </button>
        </div>

      </div>
    </div>
  );
}