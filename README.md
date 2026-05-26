# Hierarchical Markdown Note-Taking Application

A secure, offline-first, and multiplatform Markdown note-taking application. Built using a unified codebase for Web, Desktop (Linux, macOS, Windows), and Mobile (Android, iOS) environments, this project completely avoids the Meta ecosystem in favor of a high-performance, lightweight stack.

## Architecture & Tech Stack

This project is structured as a monorepo managed by **pnpm**, optimizing dependency sharing, ensuring strict resolution security, and eliminating phantom dependencies.

- **Core Application:** Nuxt 3 (Vue 3) with Nitro Server
- **Desktop Client:** Tauri Framework v2 (Rust-based webview wrapper)
- **Mobile Client:** Capacitor (Native runtime bridge)
- **Database & Sync:** Firebase Cloud Firestore (with native offline persistence)
- **Authentication:** Firebase Authentication
- **Backend Server:** h3/Nitro (lightweight HTTP server for Cloud Run)
- **State Management:** Pinia (strict volatile in-memory storage for vault keys)
- **Encryption:** Web Crypto API (AES-256-GCM + PBKDF2, client-side only)
- **CI/CD:** GitHub Actions

## Key Features

- **Hierarchical Folder Structure:** Organize notes infinitely using a relational tree model reconstructed efficiently on the client-side in O(N).
- **Robust Markdown Editing:** Built-in editor with live preview support, extensible via `tiptap` for WYSIWYG block editing. Storage is always plain Markdown.
- **Zero-Knowledge Private Vault:** An isolated folder encrypted entirely client-side using the native Web Crypto API (AES-GCM 256-bit). The encryption key lives strictly in volatile RAM (Pinia) and is never transmitted to Google Cloud or cached in plaintext.
- **Offline-First Capabilities:** Full data availability and seamless background synchronization via Firestore's local caching layer (IndexedDB on web, native persistence on mobile).
- **Inactivity Auto-Lock:** Configurable timer that automatically locks the vault after a period of user inactivity, destroying the encryption key from RAM.

---

## Repository Structure

```text
.
├── pnpm-workspace.yaml
├── package.json                # Global scripts and shared devDependencies
├── .npmrc                      # Security and hoisting rules for pnpm
│
├── apps/                       # Executable applications
│   ├── web/                    # Core Nuxt 3 application
│   ├── desktop/                # Tauri v2 desktop shell
│   ├── mobile/                 # Capacitor mobile configuration
│   └── server/                 # h3/Nitro server for Cloud Run
│
├── packages/                   # Internal shared packages
│   ├── ui/                     # Shared Vue 3 components (FolderTree, Editor, VaultGuard)
│   ├── core-logic/             # Global state (Pinia stores), tree builder, data models
│   ├── crypto/                 # Web Crypto API wrapper for zero-knowledge vault
│   ├── firebase/               # Centralized Firestore & Auth initialization
│   └── config/                 # Shared TypeScript, ESLint, and Prettier configs
│
└── .github/workflows/          # CI/CD pipelines
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 22.0.0
- **pnpm** >= 11.0.0
- **Rust toolchain** (required for Tauri desktop client compilation)
- **Android Studio / Xcode** (required for mobile emulation and building via Capacitor)

### Environment Variables

Copy `.env.example` and fill in your Firebase project credentials:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `NUXT_FIREBASE_API_KEY` | Firebase web API key |
| `NUXT_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NUXT_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NUXT_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NUXT_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NUXT_FIREBASE_APP_ID` | Firebase app ID |

### Installation

```bash
git clone https://github.com/your-username/nexus-notes-monorepo.git
cd my_notes
pnpm install
```

### Monorepo Scripts

The root `package.json` provides shortcuts for common tasks:

| Script | Description |
|---|---|
| `pnpm dev:web` | Start Nuxt 3 dev server |
| `pnpm build:all` | Build all packages and apps |
| `pnpm test:all` | Run all package tests |
| `pnpm lint:all` | Lint all packages |
| `pnpm typecheck:all` | TypeScript check all packages |

### Running Individual Apps

Due to shell handling of the `@` character, use single quotes around package filter names:

```bash
# Web client (Nuxt 3)
pnpm --filter '@nexus-notes/web' dev

# Desktop client (Tauri)
pnpm --filter '@nexus-notes/desktop' dev

# Mobile client (Capacitor)
pnpm --filter '@nexus-notes/mobile' dev

# Backend server (h3/Nitro)
pnpm --filter '@nexus-notes/server' dev
```

Or use the shorthand scripts defined in the root `package.json`.

### Testing

```bash
# All packages
pnpm test:all

# Specific package
pnpm --filter '@nexus-notes/crypto' test
pnpm --filter '@nexus-notes/core-logic' test
pnpm --filter '@nexus-notes/firebase' test
pnpm --filter '@nexus-notes/ui' test
```

Current test coverage: **59 tests** across 4 packages (crypto, firebase, core-logic, ui).

---

## Security Guidelines

1. **Strict Non-Hoisting:** The `.npmrc` file enforces `shamefully-hoist=false`. Do not modify this rule, as it prevents dependency confusion attacks and ensures explicit package declaration.
2. **Volatile Key Management:** Never use storage-persisting plugins (e.g., localStorage auto-sync) on the Pinia `vault` store. Encryption keys must only exist in runtime RAM and are destroyed on vault lock or app close.
3. **Zero Plaintext Logs:** Ensure no logging mechanisms (such as `console.log` or external telemetry) intercept text strings inside the Private Vault context before they are processed by the `@nexus-notes/crypto` package.
4. **Client-Side Encryption Only:** The backend (Firestore / Cloud Run) must never receive plaintext vault content. Encryption and decryption happen exclusively on the user's device.

## Documentation

- [Especificación de Requerimientos Técnicos (SRS)](docs/Especificación%20de%20Requerimientos%20Técnicos%20(SRS).md)
- [Monorepo Structure](docs/architecture.md)
- [CHANGELOG](CHANGELOG.md)

## License

This project is licensed under the MIT License.
