import { describe, it, expect } from 'vitest'
import { deriveKey } from '../deriveKey'
import { encrypt } from '../encrypt'
import { decrypt } from '../decrypt'
import { generateSalt } from '../generateSalt'

describe('Encrypt and Decrypt', () => {
  it('should encrypt and decrypt plain text correctly (round-trip)', async () => {
    const password = 'master-password-123'
    const originalText = '# Nota secreta\n\nContenido confidencial de la bóveda.'

    const salt = generateSalt()
    const key = await deriveKey(password, salt)
    const { ciphertext, iv } = await encrypt(originalText, key)

    expect(ciphertext).not.toBe(originalText)
    expect(ciphertext.length).toBeGreaterThan(0)
    expect(iv.length).toBeGreaterThan(0)

    const decrypted = await decrypt(ciphertext, iv, key)
    expect(decrypted).toBe(originalText)
  })

  it('should produce different ciphertexts for the same input (unique IV)', async () => {
    const password = 'test-password'
    const salt = generateSalt()
    const key = await deriveKey(password, salt)
    const text = 'Texto de prueba'

    const result1 = await encrypt(text, key)
    const result2 = await encrypt(text, key)

    expect(result1.ciphertext).not.toBe(result2.ciphertext)
    expect(result1.iv).not.toBe(result2.iv)
  })

  it('should fail to decrypt with a different key', async () => {
    const salt = generateSalt()
    const key1 = await deriveKey('password-one', salt)
    const key2 = await deriveKey('password-two', salt)
    const text = 'Mensaje secreto'

    const { ciphertext, iv } = await encrypt(text, key1)

    await expect(decrypt(ciphertext, iv, key2)).rejects.toThrow()
  })

  it('should fail to decrypt with wrong password (different key)', async () => {
    const salt = generateSalt()
    const encryptKey = await deriveKey('correct-password', salt)
    const decryptKey = await deriveKey('wrong-password', salt)
    const text = 'Dato sensible'

    const { ciphertext, iv } = await encrypt(text, encryptKey)

    await expect(decrypt(ciphertext, iv, decryptKey)).rejects.toThrow()
  })

  it('should handle empty string', async () => {
    const salt = generateSalt()
    const key = await deriveKey('password', salt)
    const { ciphertext, iv } = await encrypt('', key)
    const decrypted = await decrypt(ciphertext, iv, key)

    expect(decrypted).toBe('')
  })

  it('should handle unicode text (multilingual)', async () => {
    const salt = generateSalt()
    const key = await deriveKey('clave maestra', salt)
    const original = 'こんにちは世界 🌍 — Café y notas en español'
    const { ciphertext, iv } = await encrypt(original, key)
    const decrypted = await decrypt(ciphertext, iv, key)

    expect(decrypted).toBe(original)
  })

  it('should handle long text (10KB)', async () => {
    const salt = generateSalt()
    const key = await deriveKey('password', salt)
    const longText = 'A'.repeat(10_000)

    const { ciphertext, iv } = await encrypt(longText, key)
    const decrypted = await decrypt(ciphertext, iv, key)

    expect(decrypted).toBe(longText)
  })
})

describe('generateSalt', () => {
  it('should generate 16-byte salt', () => {
    const salt = generateSalt()
    expect(salt).toBeInstanceOf(Uint8Array)
    expect(salt.length).toBe(16)
  })

  it('should produce unique salts on each call', () => {
    const salt1 = generateSalt()
    const salt2 = generateSalt()
    expect(salt1).not.toEqual(salt2)
  })
})

describe('deriveKey', () => {
  it('should derive key from password and salt', async () => {
    const salt = generateSalt()
    const key = await deriveKey('my-password', salt)

    expect(key).toBeDefined()
    expect(key.type).toBe('secret')
    expect(key.algorithm).toMatchObject({ name: 'AES-GCM', length: 256 })
    expect(key.extractable).toBe(false)
  })

  it('should produce incompatible keys for different passwords', async () => {
    const salt = generateSalt()
    const key1 = await deriveKey('password-a', salt)
    const key2 = await deriveKey('password-b', salt)
    const text = 'texto de prueba'

    const { ciphertext, iv } = await encrypt(text, key1)
    // Descifrar con key2 debe fallar porque las claves derivan de passwords distintas
    await expect(decrypt(ciphertext, iv, key2)).rejects.toThrow()
  })

  it('should produce incompatible keys for different salts', async () => {
    const salt1 = generateSalt()
    const salt2 = generateSalt()
    const key1 = await deriveKey('same-password', salt1)
    const key2 = await deriveKey('same-password', salt2)
    const text = 'texto de prueba'

    const { ciphertext, iv } = await encrypt(text, key1)
    // Descifrar con key2 debe fallar porque las claves derivan de salts distintas
    await expect(decrypt(ciphertext, iv, key2)).rejects.toThrow()
  })
})
