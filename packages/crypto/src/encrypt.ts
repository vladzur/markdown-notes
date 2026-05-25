/**
 * Cifra texto plano usando AES-GCM con un IV aleatorio.
 * Retorna el ciphertext y el IV codificados en Base64.
 *
 * @param plainText - Texto plano a cifrar.
 * @param key - CryptoKey AES-GCM obtenida con deriveKey().
 * @returns Objeto con ciphertext e iv en formato Base64.
 */
export async function encrypt(
  plainText: string,
  key: CryptoKey,
): Promise<{ ciphertext: string; iv: string }> {
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encodedData = encoder.encode(plainText)

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData,
  )

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer),
  }
}

/**
 * Convierte un ArrayBuffer a cadena Base64 de forma segura (sin btoa directo sobre datos binarios).
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}
