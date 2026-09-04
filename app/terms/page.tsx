import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-mono p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-emerald-500 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="space-y-4 border-b border-neutral-800 pb-8">
          <ShieldCheck className="w-12 h-12 text-emerald-500" />
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-neutral-400">Last updated: September 2026</p>
        </div>

        <div className="space-y-8 text-neutral-300 leading-relaxed text-sm">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using SoloSwitch, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Master Passphrase Liability</h2>
            <p>
              <strong>You are solely responsible for managing your Master Passphrase.</strong> Because SoloSwitch utilizes client-side zero-knowledge encryption, we have no way to recover, reset, or bypass your passphrase. If you or your emergency contact lose the passphrase, your data is permanently unrecoverable. We hold no liability for data loss due to misplaced passwords.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Platform Limitations</h2>
            <p>
              While we strive for 100% uptime, SoloSwitch is provided on an "as is" and "as available" basis. We are not liable for any damages, lost profits, or business interruptions resulting from the use or inability to use our deadman engine.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}