/**
 * OAuth Token Encryption Key Utility
 *
 * - Reads OAUTH_TOKEN_ENCRYPTION_KEY from environment
 * - Strips whitespace
 * - Validates strict base64 format
 * - Decodes into exactly 32 bytes
 * - Imports as non-extractable AES-256-GCM CryptoKey
 *
 * SECURITY:
 * - Never logs key material (only lengths)
 */

const ENV_VAR = "OAUTH_TOKEN_ENCRYPTION_KEY";
const EXPECTED_KEY_BYTES = 32;

let cachedKeyPromise: Promise<CryptoKey> | null = null;

function sanitizeBase64(input: string): string {
  // Remove whitespace/newlines that can be introduced by secret managers
  return input.trim().replace(/\s/g, "");
}

function assertLooksLikeBase64(value: string): void {
  // Strict standard base64 (not base64url)
  // - alphabet: A-Z a-z 0-9 + /
  // - optional padding: = or ==
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    throw new Error(
      `${ENV_VAR} is not valid base64 (unexpected characters). ` +
        `Expected standard base64 characters A-Z a-z 0-9 + / with optional '=' padding.`
    );
  }

  if (value.length === 0) {
    throw new Error(`${ENV_VAR} is empty after trimming whitespace.`);
  }

  if (value.length % 4 !== 0) {
    throw new Error(
      `${ENV_VAR} has invalid base64 length (${value.length}). ` +
        `Base64 strings must be a multiple of 4 characters (check padding '=').`
    );
  }

  // '=' padding may only appear at the end; the regex already enforces this.
}

function decodeBase64ToBytesStrict(base64: string): Uint8Array {
  assertLooksLikeBase64(base64);

  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    throw new Error(
      `${ENV_VAR} failed base64 decoding: ${e instanceof Error ? e.message : String(e)}`
    );
  }
}

function readRawKeyBytes(): Uint8Array {
  const raw = Deno.env.get(ENV_VAR);
  if (!raw) {
    throw new Error(
      `${ENV_VAR} is missing. Configure it as a base64-encoded 32-byte (256-bit) key.`
    );
  }

  const cleaned = sanitizeBase64(raw);

  // Minimal, intentional logging (lengths only)
  console.info(`[token-encryption] ${ENV_VAR} base64 length: ${cleaned.length}`);

  const bytes = decodeBase64ToBytesStrict(cleaned);

  console.info(`[token-encryption] ${ENV_VAR} decoded byte length: ${bytes.length}`);

  if (bytes.length !== EXPECTED_KEY_BYTES) {
    throw new Error(
      `${ENV_VAR} decoded to ${bytes.length} bytes, but must decode to exactly ${EXPECTED_KEY_BYTES} bytes (AES-256-GCM). ` +
        `This usually means the secret is not a 32-byte key, or is not encoded as standard base64.`
    );
  }

  return bytes;
}

async function importAes256GcmKey(): Promise<CryptoKey> {
  const keyBytes = readRawKeyBytes();

  return await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Returns a cached, validated AES-256-GCM CryptoKey.
 * Any misconfiguration fails fast with human-readable errors.
 */
export async function getOAuthTokenCryptoKey(): Promise<CryptoKey> {
  if (!cachedKeyPromise) {
    cachedKeyPromise = importAes256GcmKey();
  }
  return await cachedKeyPromise;
}
