"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Lock, HeartPulse, LogOut, AlertCircle, CreditCard, RotateCcw } from "lucide-react";
import { encryptPayload } from "@/lib/crypto";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // -- PAGE STATE --
  const [isLoading, setIsLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [vaultState, setVaultState] = useState<"none" | "active" | "triggered">("none");
  const [vaultId, setVaultId] = useState<string | null>(null);
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
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email ?? "");
        setUserId(user.id);

        const { data: profile } = await supabase
          .from("profiles")
          .select("has_paid")
          .eq("id", user.id)
          .single();
          
        if (profile) setHasPaid(profile.has_paid);

        const { data: vault } = await supabase
          .from("vaults")
          .select("id, next_check_in_due, status")
          .eq("user_id", user.id)
          .in("status", ["active", "triggered"])
          .maybeSingle();

        if (vault) {
          setVaultId(vault.id);
          setVaultState(vault.status as "active" | "triggered");
          if (vault.status === "active") {
            setNextCheckInDue(new Date(vault.next_check_in_due).toLocaleDateString());
          }
        }
      }
      setIsLoading(false);
    };

    fetchDashboardData();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleResetTimer = async () => {
    setActionLoading(true);
    setMessage("");
    setError("");

    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 30); 

    const { error } = await supabase
      .from("vaults")
      .update({ next_check_in_due: newDate.toISOString() })
      .eq("id", vaultId);

    if (error) {
      setError(error.message);
    } else {
      setNextCheckInDue(newDate.toLocaleDateString());
      setMessage("Timer successfully reset for another 30 days!");
    }
    setActionLoading(false);
  };

  const handleArchiveVault = async () => {
    setActionLoading(true);
    const { error } = await supabase
      .from("vaults")
      .update({ status: "archived" })
      .eq("id", vaultId);

    if (!error) {
      setVaultState("none");
      setVaultId(null);
    }
    setActionLoading(false);
  };

  const handleSaveVault = async () => {
    setActionLoading(true);
    setError("");
    
    if (!passphrase || !emergencyEmail) {
      setError("Master passphrase and emergency email are required.");
      setActionLoading(false);
      return;
    }

    try {
      if (!userId) throw new Error("Not authenticated");

      const payload = JSON.stringify({ financials, clients, letter, runbook });
      const encryptedPayload = await encryptPayload(payload, passphrase);

      const nextCheckIn = new Date();
      nextCheckIn.setDate(nextCheckIn.getDate() + 30); 

      const { data, error: dbError } = await supabase.from("vaults").insert({
        user_id: userId,
        encrypted_payload: encryptedPayload,
        emergency_email: emergencyEmail,
        cadence_days: 30,
        next_check_in_due: nextCheckIn.toISOString(),
        status: "active",
      }).select("id").single();

      if (dbError) throw dbError;

      setVaultId(data.id);
      setVaultState("active");
      setNextCheckInDue(nextCheckIn.toLocaleDateString());
    } catch (err: any) {
      setError(err.message || "Failed to encrypt and save vault.");
    }
    setActionLoading(false);
  };

  const Header = () => (
    <header className="w-full max-w-4xl mx-auto flex justify-between items-center py-4 mb-8 border-b border-neutral-800">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-emerald-500 w-6 h-6" /> 
        <div>
          <h1 className="font-bold text-lg leading-none">SoloSwitch Vault</h1>
          <span className="text-xs text-neutral-500">Zero-Knowledge Business Handover</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        {userEmail && <span className="text-sm text-neutral-500 hidden sm:inline-block">{userEmail}</span>}
        <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </header>
  );

  if (isLoading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono text-emerald-500">Loading secure environment...</div>;

  if (!hasPaid) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col p-6">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <ShieldCheck className="text-emerald-500 w-16 h-16 mb-6" />
          <h2 className="text-3xl font-bold mb-2">Secure Your Legacy</h2>
          <p className="text-neutral-400 mb-8 max-w-md text-center">
            Get lifetime access to the SoloSwitch zero-knowledge deadman engine. No recurring fees, no plain-text database rows.
          </p>
          <button 
            onClick={() => {
              // Replace this string with your actual Dodo Payments test/live link!
              const dodoLink = "https://test.checkout.dodopayments.com/buy/prd_12345";
              if (userId) {
                window.location.href = `${dodoLink}?metadata[user_id]=${userId}`;
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded flex items-center gap-2 transition"
          >
            <CreditCard className="w-5 h-5" /> Pay $59 for Lifetime Access
          </button>
        </div>
      </div>
    );
  }

  if (vaultState === "triggered") {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-mono flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-neutral-900 border border-red-900 p-8 rounded-lg text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-red-400">Vault Triggered</h2>
            <p className="text-neutral-400 text-sm mb-6">
              Your deadman timer expired and your vault was sent to your emergency contact. Welcome back. Archive this event to create a new vault.
            </p>
            <button 
              onClick={handleArchiveVault}
              disabled={actionLoading}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded transition flex justify-center items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Archive & Start Fresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (vaultState === "active") {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-mono flex flex-col">
        <Header />
        <div className="max-w-2xl mx-auto w-full space-y-6 mt-4">
          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg text-center shadow-2xl">
            <Lock className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold tracking-tight mb-2">Vault is Active & Monitored</h2>
            <p className="text-neutral-400 text-sm mb-6">Your encrypted payload is securely stored.</p>
            
            <div className="inline-block bg-neutral-950 border border-neutral-800 px-6 py-4 rounded-lg text-emerald-400 mb-6">
              <span className="block text-neutral-500 uppercase text-xs mb-1">Next Check-in Due</span>
              <span className="text-xl font-bold">{nextCheckInDue}</span>
            </div>
            
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            {message && <p className="text-emerald-400 text-sm mb-4">{message}</p>}

            <button 
              onClick={handleResetTimer}
              disabled={actionLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-4 rounded transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <HeartPulse className="w-5 h-5" /> I'm Alive (Reset Timer)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-mono flex flex-col">
      <Header />
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
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
            disabled={actionLoading || !passphrase || !emergencyEmail}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded transition disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> Encrypt & Activate Vault
          </button>
        </div>

      </div>
    </div>
  );
}