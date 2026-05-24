/**
 * Descifra datos previamente cifrados con encrypt() usando AES-GCM.
 *
 * @param ciphertext - Ciphertext en Base64 producido por encrypt().
 * @param iv - Vector de inicialización en Base64 producido por encrypt().
 * @param key - La misma CryptoKey AES-GCM usada para cifrar.
 * @returns Texto plano original.
 */
export async function decrypt(
  ciphertext: string,
  iv: string,
  key: CryptoKey,
): Promise<string> {
  const decoder = new TextDecoder()
  const ciphertextBuffer = base64ToArrayBuffer(ciphertext)
  const ivBuffer = new Uint8Array(base64ToArrayBuffer(iv))

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    ciphertextBuffer,
  )

  return decoder.decode(plaintext)
}

/**
 * Convierte una cadena Base64 a ArrayBuffer de forma segura.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
