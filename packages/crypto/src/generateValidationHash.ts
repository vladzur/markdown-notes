import { toBase64 } from './encoding'

const PBKDF2_ITERATIONS = 600_000

/**
 * Genera un hash criptográfico a partir de la contraseña maestra y la salt,
 * diseñado Específicamente para validar si la contraseña es correcta, SIN
 * exponer material de la llave de encriptación real.
 *
 * Utiliza la misma salt pero concatenada con un sufijo de separación de dominio.
 */
export async function generateValidationHash(password: string, salt: Uint8Array): Promise<string> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  // Separación de dominio: agregamos "validation" a la salt para garantizar
  // que el hash de validación no sea el mismo que los bytes de la llave AES.
  const suffix = encoder.encode('validation')
  const validationSalt = new Uint8Array(salt.length + suffix.length)
  validationSalt.set(salt)
  validationSalt.set(suffix, salt.length)

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: validationSalt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )

  return toBase64(new Uint8Array(bits))
}
