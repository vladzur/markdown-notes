/** Configuración de inicialización de Firebase. */
export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
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
  updatedAt: string
}
