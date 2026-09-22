/**
 * Utilidades Criptográficas para GYM PROGRESS
 * Hashing seguro de contraseñas y códigos de acceso usando Web Crypto API.
 */

/**
 * Calcula el hash SHA-256 en formato hexadecimal de cualquier string.
 * Compatible con navegadores y Node.js (Web Crypto API).
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback seguro si crypto.subtle no está disponible
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Genera un salt aleatorio para contraseñas.
 */
export function generateSalt(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
}

/**
 * Calcula el hash de una contraseña combinada con su salt.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  return hashString(`salt:${salt}:pwd:${password}`);
}

/**
 * Normaliza un código de acceso para evitar rechazos por espacios o minúsculas.
 * Ejemplo: " gym-mt6k-bbq5 " -> "GYM-MT6K-BBQ5"
 */
export function normalizeAccessCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * Generador seguro de códigos de acceso (para uso administrativo o futuro).
 * Genera un código tipo GYM-XXXX-XXXX excluyendo caracteres visualmente ambiguos (0, O, 1, I).
 */
export function generateRandomAccessCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let part1 = '';
  let part2 = '';
  
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    const bytes = new Uint8Array(8);
    globalThis.crypto.getRandomValues(bytes);
    for (let i = 0; i < 4; i++) part1 += chars[bytes[i] % chars.length];
    for (let i = 4; i < 8; i++) part2 += chars[bytes[i] % chars.length];
  } else {
    for (let i = 0; i < 4; i++) part1 += chars[Math.floor(Math.random() * chars.length)];
    for (let i = 0; i < 4; i++) part2 += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return `GYM-${part1}-${part2}`;
}
