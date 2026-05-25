/**
 * Genera una salt aleatoria de 16 bytes usando la Web Crypto API.
 * @returns Uint8Array con 16 bytes criptográficamente aleatorios.
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16))
}
