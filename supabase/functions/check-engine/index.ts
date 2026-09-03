// supabase/functions/check-engine/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  const brevoApiKey = Deno.env.get('BREVO_API_KEY') ?? ''
  const now = new Date().toISOString()

  try {
    const { data: expiredVaults, error } = await supabaseAdmin
      .from('vaults')
      .select('id, user_id, emergency_email, emergency_name')
      .eq('status', 'active')
      .lt('next_check_in_due', now)

    if (error) throw error

    for (const vault of expiredVaults) {
      const claimToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 

      await supabaseAdmin
        .from('vaults')
        .update({
          status: 'triggered',
          claim_token: claimToken,
          claim_token_expires_at: expiresAt
        })
        .eq('id', vault.id)

      // Send Email via Brevo API
      const emailPayload = {
        sender: { name: "SoloSwitch Vault", email: "restay.support@gmail.com" }, // Update with your verified Brevo domain later
        to: [{ email: vault.emergency_email, name: vault.emergency_name || "Emergency Contact" }],
        subject: "🚨 Urgent: SoloSwitch Vault Unlocked",
        htmlContent: `
          <h2>Emergency Vault Unlocked</h2>
          <p>Hello,</p>
          <p>You have been designated as the emergency contact for this SoloSwitch vault. The founder's deadman timer has expired.</p>
          <p><strong>Click the secure link below to access the encrypted business handover documents:</strong></p>
          <br/>
          <a href="https://soloswitch.com/claim/${claimToken}" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Unlock Vault Credentials</a>
          <br/><br/>
          <p><em>This secure link will expire in 7 days. You will need the Master Passphrase provided to you by the founder to decrypt the contents.</em></p>
        `
      }

      const emailReq = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "api-key": brevoApiKey
        },
        body: JSON.stringify(emailPayload)
      })

      if (!emailReq.ok) {
        console.error(`Failed to send email for Vault ${vault.id}:`, await emailReq.text())
      } else {
        console.log(`[TRIGGERED] Vault ${vault.id}. Brevo email sent to: ${vault.emergency_email}`)
      }
    }

    return new Response(
      JSON.stringify({ message: "Engine check complete", vaultsTriggered: expiredVaults?.length || 0 }), 
      { headers: { "Content-Type": "application/json" } }
    )
    
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})