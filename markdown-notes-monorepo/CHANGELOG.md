# Changelog

## [0.0.0] - 2026-05-24

### Added

- Monorepo structure with pnpm workspaces (`apps/`, `packages/`)
- Shared TypeScript, ESLint, and Prettier config (`@notes-app/config`)
- AES-256-GCM encryption module using Web Crypto API (`@notes-app/crypto`)
- Firebase initialization with offline persistence (`@notes-app/firebase`)
- Hierarchical tree builder O(N) from flat Firestore documents (`@notes-app/core-logic`)
- Pinia stores: Folder CRUD and volatile Vault (keys in RAM only)
- Vue 3 UI components: FolderTree, MarkdownEditor, VaultGuard, AppHeader, ConfirmDialog (`@notes-app/ui`)
- Nuxt 3 web application with SSR/SPA hybrid mode (`@notes-app/web`)
- Tauri v2 desktop shell configuration (`@notes-app/desktop`)
- Capacitor mobile shell configuration (`@notes-app/mobile`)
- Nitro/H3 server with export and share endpoints (`@notes-app/server`)
- Dockerfile for Cloud Run deployment
- Vault inactivity timer composable for auto-lock security
- CI/CD pipeline with GitHub Actions (lint, typecheck, test, build)
