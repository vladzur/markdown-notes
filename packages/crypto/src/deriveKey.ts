const PBKDF2_ITERATIONS = 600_000
const KEY_ALGORITHM = 'AES-GCM' as const

/**
 * Deriva una llave AES-GCM de 256 bits a partir de una contraseña y salt usando PBKDF2.
 * La llave CryptoKey resultante debe mantenerse exclusivamente en RAM y nunca persistirse.
 *
 * @param password - Contraseña maestra de la bóveda provista por el usuario.
 * @param salt - Salt de 16 bytes generada con generateSalt().
 * @returns CryptoKey no exportable apta para operaciones AES-GCM de 256 bits.
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: KEY_ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}
