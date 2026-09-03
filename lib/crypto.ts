function bufToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function getKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const cryptoObj = globalThis.crypto;

  const keyMaterial = await cryptoObj.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return cryptoObj.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as ArrayBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts arbitrary text or stringified JSON using AES-256-GCM.
 * Output format: salt:iv:ciphertext (hex encoded)
 */
export async function encryptPayload(plaintext: string, secretKey: string): Promise<string> {
  const cryptoObj = globalThis.crypto;
  const salt = cryptoObj.getRandomValues(new Uint8Array(16));
  const iv = cryptoObj.getRandomValues(new Uint8Array(12));
  const key = await getKey(secretKey, salt);

  const enc = new TextEncoder();
  const ciphertext = await cryptoObj.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as ArrayBuffer },
    key,
    enc.encode(plaintext)
  );

  return `${bufToHex(salt)}:${bufToHex(iv)}:${bufToHex(ciphertext)}`;
}

/**
 * Decrypts an encrypted payload formatted as salt:iv:ciphertext.
 */
export async function decryptPayload(packedCiphertext: string, secretKey: string): Promise<string> {
  const cryptoObj = globalThis.crypto;
  const [saltHex, ivHex, cipherHex] = packedCiphertext.split(":");
  if (!saltHex || !ivHex || !cipherHex) {
    throw new Error("Invalid cipher payload format");
  }

  const salt = hexToBuf(saltHex);
  const iv = hexToBuf(ivHex);
  const ciphertext = hexToBuf(cipherHex);

  const key = await getKey(secretKey, salt);
  const decrypted = await cryptoObj.subtle.decrypt(
    { name: "AES-GCM", iv: iv as unknown as ArrayBuffer },
    key,
    ciphertext as unknown as ArrayBuffer
  );

  return new TextDecoder().decode(decrypted);
}