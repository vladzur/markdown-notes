# Hierarchical Markdown Note-Taking Application

A secure, offline-first, and multiplatform Markdown note-taking application. Built using a unified codebase for Web, Desktop (Linux, macOS, Windows), and Mobile (Android, iOS) environments, this project completely avoids the Meta ecosystem in favor of a high-performance, lightweight stack.

## Architecture & Tech Stack

This project is structured as a monorepo managed by **pnpm**, optimizing dependency sharing, ensuring strict resolution security, and eliminating phantom dependencies.

- **Core Application:** Nuxt 3 (Vue 3) with Nitro Server
- **Desktop Client:** Tauri Framework (Rust-based webview wrapper)
- **Mobile Client:** Capacitor (Native runtime bridge)
- **Database & Sync:** Firebase Cloud Firestore (with native offline persistence)
- **Authentication:** Firebase Authentication
- **Cloud Infrastructure:** Google Cloud Run (for custom microservices scaling to zero)
- **State Management:** Pinia (Strict volatile in-memory storage)

## Key Features

- **Hierarchical Folder Structure:** Organize notes infinitely using a relational tree model reconstructed efficiently on the client-side.
- **Robust Markdown Editing:** Powered by extensible parsing tools (`markdown-it` / `marked`) and structured text blocks (`tiptap`).
- **Zero-Knowledge Private Vault:** An isolated folder encrypted entirely client-side using the native Web Crypto API (AES-GCM 256-bit). The encryption key lives strictly in volatile RAM (Pinia) and is never transmitted to Google Cloud or cached in plaintext.
- **Offline-First Capabilities:** Full data availability and seamless background synchronization via Firestore's local caching layer.

---

## Repository Structure

```text
├── pnpm-workspace.yaml         # Central monorepo definition
├── package.json                # Global scripts and shared devDependencies
├── .npmrc                      # Strict security and hoisting rules for pnpm
│
├── apps/                       # Executable applications
│   ├── web/                    # Core Nuxt 3 application
│   ├── desktop/                # Tauri desktop setup (Linux/macOS/Windows)
│   ├── mobile/                 # Capacitor mobile configuration (Android/iOS)
│   └── server/                 # Custom Nitro/NestJS backend for Cloud Run
│
└── packages/                   # Internal shared packages
    ├── ui/                     # Shared Vue 3 UI components & Editor view
    ├── core-logic/             # Global state (Pinia stores) and data parsing
    ├── crypto/                 # Web Crypto API isolated wrapper for the vault
    ├── firebase/               # Centralized Firestore & Auth initialization
    └── config/                 # Shared tooling configurations (TypeScript, ESLint)
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your local development machine:

- **Node.js** (v18+ recommended)
- **pnpm** (v8+ recommended)
- **Rust toolchain** (Required for compiling the Tauri desktop client)
- **Android Studio / Xcode** (Required for mobile emulation and building via Capacitor)

### Installation

1. Clone the repository:
   
   ```bash
   git clone https://github.com/your-username/markdown-notes-monorepo.git
   cd markdown-notes-monorepo
   ```

2. Install all dependencies across the workspace securely:
   
   ```bash
   pnpm install
   ```

### Development Workflow

You can run specific applications using pnpm's filtering capabilities without changing directories:

- **Run Web Client:**
  
  ```bash
  pnpm dev --filter @notes-app/web
  ```

- **Run Desktop Client (Tauri):**
  
  ```bash
  pnpm tauri dev --filter @notes-app/desktop
  ```

- **Run Mobile Client (Capacitor Android Live-Reload):**
  
  ```bash
  pnpm capacitor run android --filter @notes-app/mobile
  ```

---

## Security Guidelines

1. **Strict Non-Hoisting:** The `.npmrc` file enforces `shamefully-hoist=false`. Do not modify this rule, as it prevents dependency confusion attacks and ensures explicit package declaration.
2. **Volatile Key Management:** Never use storage-persisting plugins (e.g., localStorage auto-sync) on the Pinia store responsible for handling the Private Vault's cryptographic keys. Keys must only exist in runtime RAM.
3. **Zero Plaintext Logs:** Ensure no logging mechanisms (such as `console.log` or external telemetry) intercept text strings inside the Private Vault context before they are processed by the `@notes-app/crypto` package.

## License

This project is licensed under the MIT License.