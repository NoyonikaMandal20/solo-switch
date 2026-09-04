import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Note: In Dodo Payments, you must pass the Supabase user.id into 
    // the checkout link as `metadata.user_id` so we know who to unlock!
    const userId = payload?.data?.metadata?.user_id;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing user_id in payment metadata." }, 
        { status: 400 }
      );
    }

    // We must use the SERVICE_ROLE_KEY to bypass Row Level Security 
    // because the user isn't actively logged into this server-to-server request.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    // Flip the payment switch in the database
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ has_paid: true })
      .eq("id", userId);

    if (error) throw error;

    console.log(`[PAYMENT SUCCESS] Unlocked account for user: ${userId}`);
    
    return NextResponse.json({ success: true, message: "Profile unlocked" });
  } catch (err: any) {
    console.error("[WEBHOOK ERROR]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}