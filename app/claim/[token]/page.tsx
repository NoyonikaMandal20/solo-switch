"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { decryptPayload } from "@/lib/crypto";
import { DecryptedVaultPayload } from "@/types/vault";
import { ShieldAlert, Unlock, AlertTriangle } from "lucide-react";

export default function ClaimPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vaultData, setVaultData] = useState<any>(null);
  
  const [passphrase, setPassphrase] = useState("");
  const [decrypting, setDecrypting] = useState(false);
  const [decryptedPayload, setDecryptedPayload] = useState<DecryptedVaultPayload | null>(null);

  useEffect(() => {
    async function fetchVault() {
      const supabase = createClient();
      // Fetch the encrypted payload using the public claim token
      const { data, error: fetchError } = await supabase
        .from("vaults")
        .select("encrypted_payload, claim_token_expires_at")
        .eq("claim_token", token)
        .single();

      if (fetchError || !data) {
        setError("Invalid or missing claim token. This vault does not exist.");
        setLoading(false);
        return;
      }

      if (new Date(data.claim_token_expires_at) < new Date()) {
        setError("This claim link has expired (7-day limit).");
        setLoading(false);
        return;
      }

      setVaultData(data);
      setLoading(false);
    }

    if (token) fetchVault();
  }, [token]);

  const handleDecrypt = async () => {
    if (!passphrase) return;
    setDecrypting(true);
    setError("");

    try {
      // Run AES-256-GCM decryption in the browser
      const decryptedString = await decryptPayload(vaultData.encrypted_payload, passphrase);
      const parsed = JSON.parse(decryptedString) as DecryptedVaultPayload;
      setDecryptedPayload(parsed);
    } catch (err) {
      setError("Incorrect Master Passphrase. Decryption failed.");
    } finally {
      setDecrypting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-mono">Verifying secure link...</div>;

  // Render Error State
  if (error && !decryptedPayload) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6 font-mono">
        <div className="bg-red-950/30 border border-red-900 p-6 rounded max-w-md text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-red-400">Access Denied</h2>
          <p className="text-neutral-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Render Decryption UI
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-mono">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center space-y-4 border-b border-neutral-800 pb-8">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-2xl font-bold">Emergency Vault Unlocked</h1>
          <p className="text-neutral-400 text-sm">
            The Deadman timer for this account has expired. Enter the Master Passphrase provided by the founder to decrypt the handover instructions.
          </p>
        </div>

        {/* State 1: Ask for Password */}
        {!decryptedPayload ? (
          <div className="max-w-md mx-auto space-y-4 bg-neutral-900 p-6 rounded border border-neutral-800">
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-2">Master Passphrase</label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter passphrase..."
                className="w-full bg-neutral-950 border border-neutral-700 rounded p-3 text-sm focus:border-rose-500 focus:outline-none transition"
              />
            </div>
            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            <button
              onClick={handleDecrypt}
              disabled={decrypting || !passphrase}
              className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-medium px-4 py-3 rounded text-sm transition disabled:opacity-50"
            >
              <Unlock className="w-4 h-4" /> {decrypting ? "Decrypting..." : "Decrypt Vault"}
            </button>
          </div>
        ) : (
          /* State 2: Show Decrypted Data */
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-emerald-950/30 border border-emerald-900 p-4 rounded text-emerald-400 text-sm text-center">
              Success: Vault decrypted locally. This data was not transmitted in plaintext over the network.
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-neutral-800 pb-2">Business & Financial Handover</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs uppercase text-neutral-500 mb-1">Financial Accounts & Payouts</h3>
                  <pre className="bg-neutral-900 border border-neutral-800 p-4 rounded text-sm whitespace-pre-wrap">{decryptedPayload.business.bankingAndPayouts || "None provided."}</pre>
                </div>
                <div>
                  <h3 className="text-xs uppercase text-neutral-500 mb-1">Instructions for Loved Ones</h3>
                  <pre className="bg-neutral-900 border border-neutral-800 p-4 rounded text-sm whitespace-pre-wrap">{decryptedPayload.business.generalInstructions || "None provided."}</pre>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-neutral-800 pb-2">Developer Runbook & Secrets</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs uppercase text-neutral-500 mb-1">Emergency Kill Switch SOP</h3>
                  <pre className="bg-neutral-900 border border-neutral-800 p-4 rounded text-sm whitespace-pre-wrap">{decryptedPayload.developer.killSwitchSOP || "None provided."}</pre>
                </div>
                <div>
                  <h3 className="text-xs uppercase text-neutral-500 mb-1">Environment Variables & API Keys</h3>
                  <pre className="bg-neutral-900 border border-neutral-800 p-4 rounded text-sm whitespace-pre-wrap text-emerald-400">{decryptedPayload.developer.envSecrets || "None provided."}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}