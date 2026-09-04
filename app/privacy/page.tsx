import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-mono p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-emerald-500 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="space-y-4 border-b border-neutral-800 pb-8">
          <ShieldCheck className="w-12 h-12 text-emerald-500" />
          <h1 className="text-3xl font-bold">Privacy Policy (GDPR)</h1>
          <p className="text-neutral-400">Last updated: September 2026</p>
        </div>

        <div className="space-y-8 text-neutral-300 leading-relaxed text-sm">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Zero-Knowledge Architecture</h2>
            <p>
              SoloSwitch is built on a zero-knowledge architecture. Your business and financial data is encrypted locally in your browser using AES-256-GCM before it ever reaches our servers. We do not have the master passphrase, and we cannot read, decrypt, or access your vault contents. 
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Data We Collect</h2>
            <p>To provide our service, we collect the bare minimum required:</p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-400">
              <li><strong>Account Data:</strong> Your email address for authentication and billing.</li>
              <li><strong>Trigger Data:</strong> The email address of your designated emergency contact.</li>
              <li><strong>Encrypted Blobs:</strong> The scrambled ciphertext of your vault (unreadable to us).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Your GDPR Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data. Because we cannot read your vault, the easiest way to "delete" your data is to simply delete your account, which instantly destroys the encrypted blob from our database. Contact us at support@soloswitch.com for any data requests.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}