# Changelog

## [0.0.0] - 2026-05-24

### Added

- Monorepo structure with pnpm workspaces (`apps/`, `packages/`)
- Shared TypeScript, ESLint, and Prettier config (`@nexus-notes/config`)
- AES-256-GCM encryption module using Web Crypto API (`@nexus-notes/crypto`)
- Firebase initialization with offline persistence (`@nexus-notes/firebase`)
- Hierarchical tree builder O(N) from flat Firestore documents (`@nexus-notes/core-logic`)
- Pinia stores: Folder CRUD and volatile Vault (keys in RAM only)
- Vue 3 UI components: FolderTree, MarkdownEditor, VaultGuard, AppHeader, ConfirmDialog (`@nexus-notes/ui`)
- Nuxt 3 web application with SSR/SPA hybrid mode (`@nexus-notes/web`)
- Tauri v2 desktop shell configuration (`@nexus-notes/desktop`)
- Capacitor mobile shell configuration (`@nexus-notes/mobile`)
- Nitro/H3 server with export and share endpoints (`@nexus-notes/server`)
- Dockerfile for Cloud Run deployment
- Vault inactivity timer composable for auto-lock security
- CI/CD pipeline with GitHub Actions (lint, typecheck, test, build)
