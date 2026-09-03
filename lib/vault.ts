// lib/vault.ts
import { createClient } from "./supabase/client";
import { encryptPayload, decryptPayload } from "./crypto";
import { DecryptedVaultPayload } from "@/types/vault";

export async function saveVault({
  payload,
  passphrase,
  emergencyEmail,
  emergencyName,
  checkInDays,
}: {
  payload: DecryptedVaultPayload;
  passphrase: string;
  emergencyEmail: string;
  emergencyName?: string;
  checkInDays: number;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  // 1. Client-side encryption: Database never sees the plaintext
  const plaintext = JSON.stringify(payload);
  const encryptedPayload = await encryptPayload(plaintext, passphrase);

  // 2. Calculate next check-in deadline
  const now = new Date();
  const nextDue = new Date(now.getTime() + checkInDays * 24 * 60 * 60 * 1000);

  // 3. Upsert into Supabase
  const { data, error } = await supabase
    .from("vaults")
    .upsert(
      {
        user_id: user.id,
        encrypted_payload: encryptedPayload,
        emergency_email: emergencyEmail,
        emergency_name: emergencyName || null,
        check_in_interval_days: checkInDays,
        last_check_in_at: now.toISOString(),
        next_check_in_due: nextDue.toISOString(),
        status: "active",
        updated_at: now.toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function checkInAlive() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  // Fetch current interval
  const { data: vault, error: fetchError } = await supabase
    .from("vaults")
    .select("check_in_interval_days")
    .eq("user_id", user.id)
    .single();

  if (fetchError || !vault) throw fetchError || new Error("Vault not found");

  const now = new Date();
  const nextDue = new Date(now.getTime() + vault.check_in_interval_days * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from("vaults")
    .update({
      last_check_in_at: now.toISOString(),
      next_check_in_due: nextDue.toISOString(),
      status: "active",
    })
    .eq("user_id", user.id);

  if (error) throw error;
  return { lastCheckIn: now, nextDue };
}