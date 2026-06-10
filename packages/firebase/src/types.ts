/** Configuración de inicialización de Firebase. */
export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

/** Perfil del usuario para almacenar configuraciones (ej. bóveda E2E). */
export interface UserProfile {
  id: string // Coincide con auth.currentUser.uid
  vaultSalt?: string
  vaultValidationHash?: string
}

/** Documento de carpeta en la colección Firestore `folders`. */
export interface Folder {
  id: string
  userId: string
  name: string
  parentId: string | null
  isPrivateVault: boolean
  createdAt: string
}

/** Documento de nota en la colección Firestore `notes`. */
export interface Note {
  id: string
  userId: string
  folderId: string
  title: string
  content: string
  isEncrypted: boolean
  encryptionIv?: string
  updatedAt: string
}
