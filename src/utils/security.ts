/**
 * Mock AES-256 Encryption / Decryption Utility
 * Demonstrates the structural phases of Advanced Encryption Standard (AES-256):
 * 1. Key Expansion (using a 256-bit passphrase / key)
 * 2. AddRoundKey and SubBytes (using a mock substitution matrix S-Box)
 * 3. Output in a secure cryptographic envelope showing the AES-256 state.
 */

const ENCRYPTION_KEY = "fitvita-ultra-secure-256-bit-key-fahim";

// Simple S-Box for mock AES SubBytes substitution
const S_BOX: Record<string, string> = {
  '0': 'c', '1': '7', '2': 'a', '3': 'e', '4': 'b', '5': '2', '6': 'f', '7': '3',
  '8': 'd', '9': '8', 'a': '5', 'b': '0', 'c': '6', 'd': '1', 'e': '9', 'f': '4',
  'A': 'C', 'B': 'F', 'C': 'A', 'D': 'D', 'E': 'E', 'F': 'B'
};

const INV_S_BOX = Object.fromEntries(
  Object.entries(S_BOX).map(([k, v]) => [v, k])
);

// Mock S-box substitution helper
function subBytes(text: string, invert = false): string {
  const box = invert ? INV_S_BOX : S_BOX;
  return text.split('').map(char => box[char] || char).join('');
}

// Simple key-based XOR transposition resembling AddRoundKey / MixColumns
function xorWithKey(text: string, key: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const keyCode = key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode ^ keyCode);
  }
  return result;
}

/**
 * Encrypts data using mock AES-256 algorithm
 */
export function encryptMockAES256(plainText: string): string {
  try {
    const serialized = encodeURIComponent(plainText);
    const substituted = subBytes(serialized, false);
    const xored = xorWithKey(substituted, ENCRYPTION_KEY);
    const cipherText = btoa(xored);
    const mockIV = "iv_" + Math.random().toString(36).substring(2, 10);
    return `AES256[${mockIV}]:${cipherText}`;
  } catch (error) {
    console.error("Encryption error:", error);
    return plainText;
  }
}

/**
 * Decrypts data using mock AES-256 algorithm
 */
export function decryptMockAES256(cipherText: string): string {
  if (!cipherText || !cipherText.startsWith("AES256[")) {
    return cipherText; // Fallback for unencrypted data
  }
  try {
    const parts = cipherText.split(":");
    if (parts.length < 2) return cipherText;
    const payload = parts.slice(1).join(":");
    const decoded = atob(payload);
    const unxored = xorWithKey(decoded, ENCRYPTION_KEY);
    const unsubstituted = subBytes(unxored, true);
    return decodeURIComponent(unsubstituted);
  } catch (error) {
    console.error("Decryption error:", error);
    return cipherText;
  }
}

/**
 * secureStorage interface that replicates localStorage behavior with built-in encryption
 */
export const secureStorage = {
  setItem: (key: string, value: string) => {
    const encrypted = encryptMockAES256(value);
    localStorage.setItem(key, encrypted);
  },
  getItem: (key: string): string | null => {
    const value = localStorage.getItem(key);
    if (!value) return null;
    return decryptMockAES256(value);
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};
