/**
 * Convierte un Uint8Array a una cadena Base64.
 */
export function toBase64(bytes: Uint8Array): string {
  // Uso de un enfoque que funcione bien tanto en Node como en Browser
  const binString = Array.from(bytes, x => String.fromCharCode(x)).join('')
  return btoa(binString)
}

/**
 * Convierte una cadena Base64 a un Uint8Array.
 */
export function fromBase64(base64: string): Uint8Array {
  const binString = atob(base64)
  return Uint8Array.from(binString, m => m.codePointAt(0)!)
}
