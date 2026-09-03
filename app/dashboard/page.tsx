"use client";

import { useState } from "react";
import { saveVault, checkInAlive } from "@/lib/vault";
import { ShieldCheck, Terminal, Briefcase, Key, HeartPulse, Save } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"business" | "dev">("business");
  
  // Business fields
  const [banking, setBanking] = useState("");
  const [clients, setClients] = useState("");
  const [instructions, setInstructions] = useState("");

  // Dev fields
  const [envSecrets, setEnvSecrets] = useState("");
  const [hosting, setHosting] = useState("");
  const [killSwitch, setKillSwitch] = useState("");

  // Config fields
  const [passphrase, setPassphrase] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [checkInDays, setCheckInDays] = useState(30);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleSave = async () => {
    if (!passphrase) {
      alert("Master Passphrase is required to encrypt your data locally!");
      return;
    }
    if (!emergencyEmail) {
      alert("Please provide an emergency contact email.");
      return;
    }

    setLoading(true);
    setStatusMsg("Encrypting locally & storing...");

    try {
      await saveVault({
        payload: {
          business: {
            bankingAndPayouts: banking,
            clientContacts: clients,
            generalInstructions: instructions,
          },
          developer: {
            envSecrets,
            hostingAndDomains: hosting,
            killSwitchSOP: killSwitch,
          },
          updatedAt: new Date().toISOString(),
        },
        passphrase,
        emergencyEmail,
        emergencyName,
        checkInDays,
      });
      setStatusMsg("Vault encrypted and locked successfully.");
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkInAlive();
      alert("Check-in confirmed! Deadman timer reset.");
    } catch (err: any) {
      alert(`Check-in failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-mono">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-800 pb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" /> SoloSwitch Vault
            </h1>
            <p className="text-neutral-400 text-sm mt-1">Zero-Knowledge Business Handover & Deadman Switch</p>
          </div>
          <button
            onClick={handleCheckIn}
            className="flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-700 hover:border-emerald-500 hover:text-emerald-400 px-4 py-2 rounded text-sm transition"
          >
            <HeartPulse className="w-4 h-4 text-rose-500" /> I'm Alive (Reset Timer)
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-neutral-800">
          <button
            onClick={() => setActiveTab("business")}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-medium transition ${
              activeTab === "business"
                ? "border-emerald-500 text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <Briefcase className="w-4 h-4" /> 1. Business & Financials
          </button>
          <button
            onClick={() => setActiveTab("dev")}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-medium transition ${
              activeTab === "dev"
                ? "border-emerald-500 text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <Terminal className="w-4 h-4" /> 2. Developer Runbook & Secrets
          </button>
        </div>

        {/* Tab 1: Business */}
        {activeTab === "business" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Financial Accounts & Payout Instructions</label>
              <textarea
                value={banking}
                onChange={(e) => setBanking(e.target.value)}
                placeholder="Stripe Dashboard URL, Bank accounts, Wise routing, where monthly profits accumulate..."
                rows={4}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-sm focus:border-neutral-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Pending Client Handover & Contracts</label>
              <textarea
                value={clients}
                onChange={(e) => setClients(e.target.value)}
                placeholder="List of active agency/SaaS clients, outstanding balances, who to notify..."
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-sm focus:border-neutral-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Letter / Instructions for Loved Ones</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Step-by-step instructions on what to do with the company..."
                rows={4}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-sm focus:border-neutral-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Developer Runbook */}
        {activeTab === "dev" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Critical API Keys & Secrets (.env format)</label>
              <textarea
                value={envSecrets}
                onChange={(e) => setEnvSecrets(e.target.value)}
                placeholder="STRIPE_SECRET_KEY=sk_live_...&#10;OPENAI_API_KEY=sk-...&#10;DATABASE_URL=postgres://..."
                rows={6}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-sm font-mono text-emerald-400 focus:border-neutral-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Hosting, DNS & Cloud Accounts</label>
              <textarea
                value={hosting}
                onChange={(e) => setHosting(e.target.value)}
                placeholder="Cloudflare account email, AWS root credentials, Vercel/Hetzner server access..."
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-sm focus:border-neutral-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Kill Switch SOP (Stop Cloud Billing)</label>
              <textarea
                value={killSwitch}
                onChange={(e) => setKillSwitch(e.target.value)}
                placeholder="1. Log into AWS and pause EC2 instances.&#10;2. Revoke Stripe checkout keys.&#10;3. Put maintenance page up on Cloudflare."
                rows={4}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-sm focus:border-neutral-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Settings & Master Key */}
        <div className="border-t border-neutral-800 pt-6 space-y-4">
          <h2 className="text-sm uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" /> Security & Trigger Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Master Encryption Passphrase (Don't lose this)</label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Used to encrypt AES-256 in your browser"
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-sm focus:border-neutral-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Emergency Contact Email</label>
              <input
                type="email"
                value={emergencyEmail}
                onChange={(e) => setEmergencyEmail(e.target.value)}
                placeholder="partner@example.com"
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-sm focus:border-neutral-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Emergency Contact Name</label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-sm focus:border-neutral-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Check-in Cadence</label>
              <select
                value={checkInDays}
                onChange={(e) => setCheckInDays(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-2.5 text-sm focus:border-neutral-500 focus:outline-none"
              >
                <option value={15}>Every 15 days</option>
                <option value={30}>Every 30 days (Standard)</option>
                <option value={60}>Every 60 days</option>
                <option value={90}>Every 90 days</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <span className="text-xs text-neutral-400">{statusMsg}</span>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded text-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {loading ? "Encrypting..." : "Save & Encrypt Vault"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}