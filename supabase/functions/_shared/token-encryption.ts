/**
 * AES-256-GCM Token Encryption Utility
 * 
 * Provides encryption/decryption for OAuth tokens at rest.
 * Uses the OAUTH_TOKEN_ENCRYPTION_KEY secret (32-byte base64 encoded).
 * 
 * Storage format: JSON { v:1, alg:"aes-256-gcm", iv:"...", ct:"...", tag:"..." }
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for AES-GCM
const TAG_LENGTH = 128; // 128 bits auth tag

interface EncryptedPayload {
  v: number;
  alg: string;
  iv: string;
  ct: string;
  tag: string;
}

/**
 * Get the encryption key from environment
 */
function getEncryptionKey(): ArrayBuffer {
  const keyBase64 = Deno.env.get("OAUTH_TOKEN_ENCRYPTION_KEY");
  if (!keyBase64) {
    throw new Error("OAUTH_TOKEN_ENCRYPTION_KEY not configured");
  }
  
  // Clean the key - remove any whitespace and ensure proper base64
  const cleanedKey = keyBase64.trim().replace(/\s/g, "");
  
  // If key is hex-encoded (64 chars = 32 bytes), convert from hex
  if (/^[0-9a-fA-F]{64}$/.test(cleanedKey)) {
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      bytes[i] = parseInt(cleanedKey.substr(i * 2, 2), 16);
    }
    return bytes.buffer as ArrayBuffer;
  }
  
  // Try base64 decode
  try {
    const binaryString = atob(cleanedKey);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    if (bytes.length !== 32) {
      throw new Error(`OAUTH_TOKEN_ENCRYPTION_KEY must be 32 bytes (got ${bytes.length} bytes)`);
    }
    
    return bytes.buffer as ArrayBuffer;
  } catch (e) {
    // If base64 fails and key is exactly 32 chars, use as raw UTF-8 passphrase
    if (cleanedKey.length === 32) {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(cleanedKey);
      return bytes.buffer as ArrayBuffer;
    }
    throw new Error(`Failed to decode encryption key: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/**
 * Import the raw key for WebCrypto
 */
async function importKey(): Promise<CryptoKey> {
  const keyBuffer = getEncryptionKey();
  
  return await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Generate a random IV
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Convert Uint8Array to base64 string
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt a plaintext token using AES-256-GCM
 * Returns a JSON string in the encrypted payload format
 */
export async function encryptToken(plaintext: string): Promise<string> {
  if (!plaintext) {
    return "";
  }
  
  const key = await importKey();
  const iv = generateIV();
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);
  
  // Encrypt with AES-GCM (includes authentication tag)
  const ciphertextWithTag = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv.buffer as ArrayBuffer,
      tagLength: TAG_LENGTH,
    },
    key,
    plaintextBytes
  );
  
  // AES-GCM appends the auth tag to the ciphertext
  const combined = new Uint8Array(ciphertextWithTag);
  const tagStart = combined.length - (TAG_LENGTH / 8);
  const ciphertext = combined.slice(0, tagStart);
  const tag = combined.slice(tagStart);
  
  // Build the encrypted payload
  const payload: EncryptedPayload = {
    v: 1,
    alg: "aes-256-gcm",
    iv: uint8ArrayToBase64(iv),
    ct: uint8ArrayToBase64(ciphertext),
    tag: uint8ArrayToBase64(tag),
  };
  
  return JSON.stringify(payload);
}

/**
 * Decrypt an encrypted token payload
 * Accepts either the JSON payload string or the raw plaintext (for backwards compatibility)
 */
export async function decryptToken(encryptedOrPlaintext: string): Promise<string> {
  if (!encryptedOrPlaintext) {
    return "";
  }
  
  // Check if this looks like our encrypted format
  if (!encryptedOrPlaintext.startsWith("{")) {
    // This is likely a plaintext token (backwards compatibility)
    // Return as-is for migration purposes
    return encryptedOrPlaintext;
  }
  
  let payload: EncryptedPayload;
  try {
    payload = JSON.parse(encryptedOrPlaintext);
  } catch {
    // Not valid JSON, treat as plaintext
    return encryptedOrPlaintext;
  }
  
  // Validate payload structure
  if (!payload.v || !payload.alg || !payload.iv || !payload.ct || !payload.tag) {
    // Doesn't match our format, treat as plaintext
    return encryptedOrPlaintext;
  }
  
  if (payload.alg !== "aes-256-gcm") {
    throw new Error(`Unsupported encryption algorithm: ${payload.alg}`);
  }
  
  const key = await importKey();
  
  // Decode from base64
  const iv = base64ToUint8Array(payload.iv);
  const ciphertext = base64ToUint8Array(payload.ct);
  const tag = base64ToUint8Array(payload.tag);
  
  // Combine ciphertext and tag for WebCrypto
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);
  
  // Decrypt
  const plaintextBytes = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: iv.buffer as ArrayBuffer,
      tagLength: TAG_LENGTH,
    },
    key,
    combined
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(plaintextBytes);
}

/**
 * Check if a token value is encrypted
 */
export function isEncrypted(value: string): boolean {
  if (!value || !value.startsWith("{")) {
    return false;
  }
  
  try {
    const payload = JSON.parse(value);
    return payload.v === 1 && payload.alg === "aes-256-gcm" && payload.iv && payload.ct && payload.tag;
  } catch {
    return false;
  }
}
