export interface BusinessHandover {
  bankingAndPayouts: string; // Stripe, Wise, Mercury, bank details
  clientContacts: string;    // Key clients, pending invoices
  generalInstructions: string; // Plain text message/SOP for partner or spouse
}

export interface DeveloperRunbook {
  envSecrets: string;        // Raw .env block (Stripe secrets, OpenAI, DB URLs)
  hostingAndDomains: string; // Cloudflare, Vercel, AWS, Namecheap logins
  killSwitchSOP: string;     // Emergency shutdown steps to stop billing
}

export interface DecryptedVaultPayload {
  business: BusinessHandover;
  developer: DeveloperRunbook;
  updatedAt: string;
}