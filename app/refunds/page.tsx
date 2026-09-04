import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-mono p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-emerald-500 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="space-y-4 border-b border-neutral-800 pb-8">
          <ShieldCheck className="w-12 h-12 text-emerald-500" />
          <h1 className="text-3xl font-bold">Refund & Cancellation Policy</h1>
          <p className="text-neutral-400">Last updated: September 2026</p>
        </div>

        <div className="space-y-8 text-neutral-300 leading-relaxed text-sm">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Lifetime Access ($59)</h2>
            <p>
              Our Lifetime Access plan comes with a 14-day money-back guarantee. If you decide SoloSwitch isn't for you within the first 14 days of purchase, we will issue a full refund, <strong>provided your vault has not been triggered or accessed.</strong>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. The "Zero-Knowledge" Exception</h2>
            <p className="bg-neutral-900 border border-neutral-800 p-4 rounded text-emerald-400">
              Due to the zero-knowledge nature of our architecture, we cannot see, alter, or revoke access to your decrypted data once the deadman timer has triggered and your emergency contact has accessed the vault. <strong>Under no circumstances can a refund be issued once a vault has been successfully decrypted.</strong>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Recurring Subscriptions & Cancellations</h2>
            <p>
              If you are on a recurring subscription tier (e.g., monthly or annual plans), you may apply for a cancellation at any time through your dashboard or billing portal. 
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-400">
              <li>Cancellations take effect at the end of your current billing cycle.</li>
              <li>Your vault will remain active until the cycle expires.</li>
              <li>We do not offer partial or prorated refunds for mid-cycle cancellations.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}