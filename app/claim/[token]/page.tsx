"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, Lock, ShieldAlert, CheckCircle } from "lucide-react";
import { decryptPayload } from "@/lib/crypto";

export default function ClaimPage() {
  const params = useParams();
  const token = params.token as string;
  const supabase = createClient();

  // -- PAGE STATE --
  const [pageStatus, setPageStatus] = useState<"loading" | "valid" | "expired" | "invalid">("loading");
  const [encryptedPayload, setEncryptedPayload] = useState<string | null>(null);

  // -- DECRYPTION STATE --
  const [passphrase, setPassphrase] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState("");
  const [decryptedData, setDecryptedData] = useState<{
    financials?: string;
    clients?: string;
    letter?: string;
    runbook?: string;
  } | null>(null);

  useEffect(() => {
    const fetchVaultToken = async () => {
      if (!token) return;

      const { data: vault, error } = await supabase
        .from("vaults")
        .select("encrypted_payload, claim_token_expires_at, status")
        .eq("claim_token", token)
        .single();

      if (error || !vault) {
        setPageStatus("invalid");
        return;
      }

      // 1. Expiration Check Logic (7 Days)
      const now = new Date();
      const expiresAt = new Date(vault.claim_token_expires_at);

      if (now > expiresAt || vault.status !== "triggered") {
        setPageStatus("expired");
        return;
      }

      setEncryptedPayload(vault.encrypted_payload);
      setPageStatus("valid");
    };

    fetchVaultToken();
  }, [token, supabase]);

  const handleDecrypt = async () => {
    setIsDecrypting(true);
    setError("");

    try {
      if (!encryptedPayload) throw new Error("No payload found.");
      
      const decryptedString = await decryptPayload(encryptedPayload, passphrase);
      const parsedData = JSON.parse(decryptedString);
      
      setDecryptedData(parsedData);
    } catch (err) {
      setError("Incorrect Master Passphrase. Decryption failed.");
    }
    
    setIsDecrypting(false);
  };

  if (pageStatus === "loading") {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono text-emerald-500">Verifying secure link...</div>;
  }

  if (pageStatus === "invalid") {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono p-6">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-neutral-600 mx-auto" />
          <h2 className="text-2xl font-bold text-neutral-300">Invalid Token</h2>
          <p className="text-neutral-500">This secure link does not exist or has been malformed.</p>
        </div>
      </div>
    );
  }

  if (pageStatus === "expired") {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center font-mono p-6">
        <div className="text-center space-y-4 max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-red-400">Secure Link Expired</h2>
          <p className="text-neutral-400">
            For security reasons, this vault access link expired 7 days after the deadman timer was triggered. 
            The encrypted payload is no longer accessible via this URL.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12 font-mono flex flex-col items-center">
      <div className="max-w-3xl w-full mx-auto space-y-8 mt-12">
        
        <div className="text-center space-y-4 border-b border-neutral-800 pb-8">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
          <h1 className="text-3xl font-bold">Emergency Vault Unlocked</h1>
          <p className="text-neutral-400 max-w-xl mx-auto">
            The Deadman timer for this account has expired. Enter the Master Passphrase provided by the founder to decrypt the handover instructions.
          </p>
        </div>

        {!decryptedData ? (
          <div className="max-w-md mx-auto bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-4 shadow-2xl">
            <div className="space-y-2">
              <label className="text-xs uppercase text-neutral-500 font-bold">Master Passphrase</label>
              <input 
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-sm focus:border-rose-500 focus:outline-none" 
                placeholder="Enter passphrase..."
              />
            </div>
            
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button 
              onClick={handleDecrypt}
              disabled={isDecrypting || !passphrase}
              className="w-full bg-rose-900 hover:bg-rose-800 text-white font-bold py-3 rounded transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" /> {isDecrypting ? "Decrypting..." : "Decrypt Vault"}
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-emerald-950/30 border border-emerald-900 p-4 rounded text-emerald-400 text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p>Success: Vault decrypted locally. This data was not transmitted in plaintext over the network.</p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-neutral-800 pb-2">Business & Financial Handover</h2>
              
              <div className="space-y-2">
                <label className="text-xs uppercase text-neutral-500 font-bold">Financial Accounts & Payouts</label>
                <div className="bg-neutral-900 border border-neutral-800 rounded p-4 text-sm whitespace-pre-wrap">
                  {decryptedData.financials || "None provided."}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase text-neutral-500 font-bold">Pending Client Handover & Contracts</label>
                <div className="bg-neutral-900 border border-neutral-800 rounded p-4 text-sm whitespace-pre-wrap">
                  {decryptedData.clients || "None provided."}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase text-neutral-500 font-bold">Instructions for Loved Ones</label>
                <div className="bg-neutral-900 border border-neutral-800 rounded p-4 text-sm whitespace-pre-wrap">
                  {decryptedData.letter || "None provided."}
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6">
              <h2 className="text-xl font-bold border-b border-neutral-800 pb-2">Developer Runbook & Secrets</h2>
              
              <div className="space-y-2">
                <label className="text-xs uppercase text-neutral-500 font-bold">Environment Variables & API Keys</label>
                <div className="bg-neutral-900 border border-neutral-800 rounded p-4 text-sm font-mono whitespace-pre-wrap text-emerald-500">
                  {decryptedData.runbook || "None provided."}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}