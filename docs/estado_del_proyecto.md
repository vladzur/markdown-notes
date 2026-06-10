# Estado del Proyecto: Gestión de Notas Markdown

He revisado la estructura actual del repositorio comparándola contra el documento de **Arquitectura (`architecture.md`)** y la **Especificación de Requerimientos Técnicos (`Especificación de Requerimientos Técnicos (SRS).md`)**. 

A continuación, se presenta un desglose de lo que ya está implementado y lo que aún falta por desarrollar.

## 1. Arquitectura Base y Monorepo
> [!NOTE]
> La estructura fundacional del proyecto está completa y sigue estrictamente las especificaciones de modularidad.

- **[x] Monorepo con pnpm**: Se encuentra configurado con los archivos `pnpm-workspace.yaml`, `.npmrc` y bloqueos estrictos.
- **[x] Aplicaciones (Apps)**: Las bases (scaffolding) están creadas:
  - `apps/web` (Nuxt 3 inicializado)
  - `apps/desktop` (Tauri listo en `src-tauri`)
  - `apps/mobile` (Capacitor inicializado)
  - `apps/server` (Dockerfile y bases de Node)
- **[x] Paquetes Internos (Packages)**: Separación correcta en módulos: `config`, `core-logic`, `crypto`, `firebase` y `ui`.

---

## 2. Requerimientos Funcionales (RF)

### RF-01: Gestión de Estructura Jerárquica de Carpetas
> [!TIP]
> **Estado:** Implementado Parcialmente 🟨

- **Implementado:** 
  - La interfaz de datos (modelo plano) en `packages/firebase/src/types.ts`.
  - El algoritmo de reconstrucción del árbol en memoria `O(N)` en `packages/core-logic/src/tree-builder.ts`.
  - Gestor de estado de carpetas `folder-store.ts` en el paquete de lógica.
  - Componente visual `FolderTree.vue` en el paquete de UI.
- **Falta por implementar:** 
  - Validar las operaciones CRUD completas y conectarlas bidireccionalmente con Firestore (renombrar carpetas y moverlas en la UI arrastrando o seleccionando).

### RF-02: Editor e Intérprete Markdown
> [!IMPORTANT]
> **Estado:** Faltante Mayor 🟥

- **Implementado:** 
  - Existe un componente esqueleto de UI `MarkdownEditor.vue`.
- **Falta por implementar:**
  - **Lógica de Notas (CRUD):** No existe un gestor de estado para las notas (`note-store.ts` o similar en `core-logic`).
  - **Vistas Web:** En `apps/web/pages` hay visores de carpetas (`folders/[[folderId]].vue`), pero no se visualiza un área dedicada a la vista de lectura/escritura de notas individuales.
  - **Motor Markdown:** Integrar el parseo a HTML (`marked` o `markdown-it`) y/o el editor visual (`tiptap`) según la especificación.

### RF-03: Bóveda de Seguridad (Carpeta Privada)
> [!NOTE]
> **Estado:** Mayormente Implementado 🟩

- **Implementado:** 
  - Interfaz de protección `VaultGuard.vue`.
  - Gestor de memoria volátil de la clave `vault-store.ts` sin persistencia (cumpliendo estricto RNF-03).
- **Falta por implementar:**
  - **Temporizador de inactividad:** El SRS menciona que se debe destruir la sesión de la bóveda tras inactividad. Esto aún no parece estar configurado en el frontend.

---

## 3. Requerimientos No Funcionales y Seguridad (RNF)

- **RNF-01: Cifrado del Lado del Cliente (Zero-Knowledge) ✅**
  El módulo `packages/crypto` contiene implementaciones correctas de AES-GCM con la Web Crypto API nativa (`encrypt.ts`, `decrypt.ts`, `deriveKey.ts`, y `generateSalt.ts`).
- **RNF-02: Persistencia Offline-First 🟨**
  Firebase está configurado modularmente (`firebase.ts`), pero hay que cerciorarse de que la habilitación de persistencia offline (IndexedDB para la web) haya sido explícitamente activada en el momento de instanciar Firestore en el cliente.
- **RNF-03: Memoria Volátil ✅**
  `vault-store.ts` asegura que las contraseñas derivadas sólo residan en la memoria RAM en ejecución usando Pinia de manera nativa sin el plugin de persistencia (persist mode desactivado para este store).

---

## Próximos Pasos Recomendados

Para alinear el proyecto completamente a la especificación, te sugiero el siguiente orden de desarrollo:

1. **Gestor de Notas (`note-store.ts`)**: Crear el módulo de Pinia para leer, crear, actualizar y borrar notas, vinculándolas relacionalmente al `folderId`.
2. **Integración Criptográfica E2E**: Asegurar que al momento de guardar una nota en el `note-store.ts`, si su contenedor es la *Bóveda Privada*, su contenido pase automáticamente por `packages/crypto/src/encrypt.ts`.
3. **Editor y UI Markdown**: Desarrollar completamente la lógica del editor enriquecido (`tiptap` u otra biblioteca de parseo).
4. **Temporizador de Inactividad**: Añadir la lógica para vaciar el `vault-store.ts` tras un periodo definido de no interacción en el cliente (por ejemplo, con un composable global en Nuxt).
5. **Infraestructura**: Configurar los pipelines de CI/CD para compilar los clientes móviles (Capacitor) y de escritorio (Tauri).
