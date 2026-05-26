# Estructura del Monorepo (pnpm)

## 1. Estructura de Directorios del Monorepo

```text
nexus-notes-monorepo/
├── pnpm-workspace.yaml         # Archivo central que define el monorepo
├── package.json                # Dependencias globales y scripts de desarrollo
├── pnpm-lock.yaml              # Bloqueo estricto de versiones de pnpm
├── .npmrc                      # Configuración de pnpm (ej. strict-peer-dependencies)
│
├── apps/                       # Aplicaciones y clientes finales
│   ├── web/                    # Cliente web principal (Nuxt 3)
│   ├── desktop/                # Wrapper de Tauri (consume el build de 'web' o usa su propio front)
│   ├── mobile/                 # Wrapper de Capacitor (Android/iOS)
│   └── server/                 # Lógica backend para Cloud Run (Nitro)
│
└── packages/                   # Bibliotecas y lógica compartida
    ├── ui/                     # Componentes Vue compartidos (Botones, Editor Markdown)
    ├── core-logic/             # Lógica de negocio (Gestor Pinia, parseo Markdown)
    ├── crypto/                 # Módulo aislado con la Web Crypto API para la bóveda
    ├── firebase/               # Configuración centralizada de Firebase y Firestore
    └── config/                 # Configuraciones compartidas (ESLint, Prettier, TSConfig)
```

## 2. Configuración del Espacio de Trabajo (`pnpm-workspace.yaml`)

Este archivo en la raíz del proyecto es el que le dice a pnpm que estás operando un monorepo y dónde encontrar los paquetes.

```yaml
# pnpm-workspace.yaml
packages:
  # Todos los proyectos ejecutables
  - 'apps/*'
  # Todas las bibliotecas y utilidades internas compartidas
  - 'packages/*'
```

## 3. Anatomía de los Paquetes (`packages/`)

Al separar la lógica en `packages/`, te aseguras de que el cliente móvil, el de escritorio y el web usen exactamente el mismo código base para tareas críticas.

```json
// packages/crypto/package.json
{
  "name": "@nexus-notes/crypto",
  "version": "1.0.0",
  "main": "index.ts",
  "dependencies": { ... }
}
```

En tu aplicación web o de escritorio, lo instalas referenciando el espacio de trabajo local:

```json
// apps/web/package.json
{
  "name": "@nexus-notes/web",
  "dependencies": {
    "nuxt": "^3.0.0",
    "@nexus-notes/crypto": "workspace:*",
    "@nexus-notes/ui": "workspace:*",
    "@nexus-notes/firebase": "workspace:*"
  }
}
```

## 4. Flujo de Trabajo y Comandos Clave con pnpm

*   **Instalar dependencias en todo el proyecto a la vez:**
    ```bash
    pnpm install
    ```
*   **Añadir una dependencia solo a un proyecto específico:**
    ```bash
    pnpm add @tiptap/vue-3 --filter @nexus-notes/ui
    ```
*   **Añadir un paquete interno a una app:**
    ```bash
    pnpm add @nexus-notes/crypto --workspace --filter @nexus-notes/desktop
    ```
*   **Iniciar el servidor de desarrollo web:**
    ```bash
    pnpm dev --filter @nexus-notes/web
    ```

## 5. Configuración de Seguridad (`.npmrc`)

Para forzar resoluciones estrictas y evitar inyecciones silenciosas en las dependencias transitivas:

```ini
# .npmrc
# Evita instalaciones si hay conflictos de dependencias peer no resueltas
strict-peer-dependencies=true
# Fuerzan el comportamiento estricto de enlazado de pnpm
shamefully-hoist=false
```