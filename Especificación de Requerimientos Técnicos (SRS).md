# Especificación de Requerimientos Técnicos (SRS)

## Sistema de Gestión de Notas Markdown Jerárquico y Multiplataforma

**Estado del Proyecto:** Fase de Planificación / Arquitectura **Público Objetivo:** Equipo de Desarrollo Frontend & Backend **Ecosistema Restringido:** Exclusión estricta de bibliotecas y frameworks del ecosistema de Meta. **Infraestructura Nube:** Google Cloud Platform (Cloud Run, Firebase Firestore, Firebase Auth)

### 1. Introducción y Objetivos del Proyecto

El propósito de este documento es definir detalladamente los requerimientos técnicos y arquitectónicos para el diseño, desarrollo e implementación de una herramienta de gestión de notas en formato Markdown. La solución debe garantizar una experiencia multiplataforma homogénea (escritorio y dispositivos móviles) utilizando una base de código unificada.

Un pilar fundamental de este proyecto es el control absoluto sobre la privacidad de la información y la independencia tecnológica. Queda estrictamente prohibido el uso de herramientas, bibliotecas o frameworks propiedad de o mantenidos por Meta (incluyendo React y React Native). En su lugar, el desarrollo se cimentará en el ecosistema de Vue/Nuxt y herramientas nativas ligeras.

### 2. Arquitectura General y Stack Tecnológico

Para maximizar el rendimiento y la portabilidad sin incurrir en el alto consumo de recursos de soluciones tradicionales como Electron, se ha seleccionado una arquitectura híbrida moderna desacoplada en las siguientes capas:

| **Componente**                  | **Tecnología Seleccionada**      | **Propósito y Justificación**                                                                                                                                                             |
| ------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Núcleo de Aplicación (Core)** | Nuxt 3 + Vue 3 (SSR/SPA Híbrido) | Proporciona la estructura lógica, enrutamiento, reactividad de la interfaz y un servidor ligero subyacente (Nitro) para la gestión local y despliegues optimizados.                       |
| **Cliente de Escritorio**       | Tauri Framework (Rust Core)      | Sustituye a Electron. Utiliza el motor webview nativo del sistema operativo host, reduciendo drásticamente el tamaño del binario y el consumo de memoria RAM.                             |
| **Cliente Móvil**               | Capacitor (Ionic runtime)        | Actúa como puente nativo (wrapper) para empaquetar el Core web en aplicaciones instalables para Android e iOS, proveyendo acceso directo a APIs del sistema de archivos y almacenamiento. |
| **Sincronización y Backend**    | Firebase Cloud Firestore         | Base de datos documental NoSQL optimizada para sincronización en tiempo real con capacidades nativas de persistencia offline-first.                                                       |
| **Autenticación**               | Firebase Authentication          | Manejo seguro de sesiones de usuario e identidades vinculadas a las claves de sincronización en la nube.                                                                                  |
| **Servicios de Backend**        | Google Cloud Run + Nitro/NestJS  | Alojamiento de microservicios complementarios o lógica centralizada en contenedores que escalan a cero de forma eficiente.                                                                |

### 3. Requerimientos Funcionales (RF)

#### RF-01: Gestión de Estructura Jerárquica de Carpetas

La herramienta debe permitir organizar las notas mediante una estructura de árbol jerárquico de carpetas sin límite técnico de anidamiento visible para el usuario. Las carpetas podrán contener tanto subcarpetas como notas independientes.

- El sistema debe renderizar un árbol de navegación lateral interactivo y fluido.

- Debe permitir operaciones CRUD de carpetas (Crear, Renombrar, Mover mediante asignación relacional y Eliminar).

- La reubicación de una carpeta padre debe conservar e indexar automáticamente la jerarquía interna de sus subelementos sin realizar reescrituras masivas en la base de datos remota.

#### RF-02: Editor e Intérprete Markdown

El área de trabajo principal consistirá en un editor optimizado para la sintaxis Markdown puro.

- Debe soportar el renderizado en tiempo real o vista dividida del código Markdown transformado a HTML limpio.

- Se deben incorporar bibliotecas de parseo de alto rendimiento y extensibles como markdown-it o marked para el procesamiento del texto.

- Si se requiere un editor visual de tipo bloque o WYSIWYG, se implementará la biblioteca tiptap, asegurando que el almacenamiento subyacente se conserve estrictamente en formato Markdown plano (.md) o texto enriquecido parseable.

#### RF-03: Bóveda de Seguridad (Carpeta Privada)

El sistema debe integrar una carpeta especial restringida ("Bóveda"), cuyo acceso requiera obligatoriamente la introducción de una contraseña secundaria o clave maestra, independiente de las credenciales de inicio de sesión de la aplicación.

- Las notas creadas dentro de esta Bóveda o movidas a ella deben ser inaccesibles visual y lógicamente en la interfaz hasta que ocurra la autenticación explícita.

- La aplicación debe implementar un temporizador de inactividad configurable en el frontend. Si se cumple el tiempo sin interacción, el estado de desbloqueo debe destruirse de forma inmediata.

### 4. Requerimientos No Funcionales y Seguridad

#### RNF-01: Cifrado del Lado del Cliente (Zero-Knowledge)

Para asegurar la privacidad técnica de la Bóveda Privada, se prohíbe el envío de datos en texto plano al backend (Firebase/Cloud Run). El descifrado y cifrado de datos ocurrirá única y exclusivamente en el dispositivo del usuario final.

- **Mecanismo Criptográfico:** Se utilizará la Web Crypto API nativa del entorno del navegador (disponible transparentemente en Tauri y Capacitor) para derivar claves simétricas mediante algoritmos modernos como AES-GCM (mínimo de 256 bits).

- La contraseña secundaria provista por el usuario servirá como entrada para funciones de derivación criptográfica de claves robustas (como PBKDF2).

- Las notas y metadatos sensibles pertenecientes a la Bóveda se almacenarán en la base de datos remota bajo formato binario o cadenas cifradas codificadas en Base64. Google Cloud ni ningún tercero podrán descifrar la información en tránsito ni en reposo.

#### RNF-02: Persistencia e Inmediatez Offline-First

La aplicación debe priorizar la disponibilidad de los datos aun en ausencia total de conexión a internet.

- Se habilitará de forma nativa la caché persistente del SDK de Firebase Firestore (utilizando IndexedDB en plataformas web/escritorio y el motor de persistencia nativo del SO en móviles a través de Capacitor).

- **Caché de Notas Privadas:** Los datos cifrados de la Bóveda *sí* se conservarán dentro de la caché local del dispositivo. De esta forma, se mantiene el acceso offline instantáneo, confiando plenamente en que la seguridad reside en la imposibilidad criptográfica de leer el archivo binario local sin la clave en RAM.

#### RNF-03: Gestión de Memoria y Estado Volátil

La seguridad de las claves criptográficas depende estrictamente de su aislamiento en el ciclo de vida de la aplicación.

- Tanto la contraseña de la Bóveda como la clave simétrica derivada deben mantenerse **únicamente** en la memoria RAM de ejecución mediante tiendas de estado de **Pinia** no persistentes.

- Se prohíbe explícitamente almacenar la clave de descifrado en localStorage, sessionStorage, cookies o complementos automatizados de persistencia de estado de Pinia. Cualquier recarga forzada o cierre de la aplicación provocará la pérdida de la clave en RAM, bloqueando los datos inmediatamente.

### 5. Arquitectura de Datos y Sincronización

Para evitar las penalizaciones de rendimiento y los costos de lectura/escritura recursiva de subcolecciones anidadas en Firestore, se establece un modelo relacional plano. El árbol jerárquico se reconstruirá exclusivamente en memoria del lado del cliente al inicializar la sesión.

JSON

```
// Estructura Conceptual del Documento de Carpeta (Colección: folders) [cite: 65]
{ [cite: 66]
  "id": "f_root_001", [cite: 67]
  "userId": "auth_user_12345", [cite: 69]
  "name": "Proyectos Personales", [cite: 70]
  "parentId": null, // Nulo representa directorio raíz [cite: 71]
  "isPrivateVault": false, [cite: 72]
  "createdAt": "2026-05-24T15:00:00Z" [cite: 73]
} [cite: 68]

// Estructura Conceptual del Documento de Nota (Colección: notes) [cite: 74]
{ [cite: 75]
  "id": "n_spec_099", [cite: 76]
  "userId": "auth_user_12345", [cite: 77]
  "folderId": "f_root_001", // Relación plana directa con su carpeta contenedora [cite: 78]
  "title": "Requerimientos Técnicos", [cite: 79]
  "content": "# Especificación...", // Texto plano o cadena cifrada AES-GCM si pertenece a bóveda [cite: 80]
  "isEncrypted": false, [cite: 84]
  "updatedAt": "2026-05-24T15:23:00Z" [cite: 85]
} [cite: 83]
```

Algoritmo de Reconstrucción del Árbol

Al iniciar la aplicación, la tienda global de Pinia descargará en una sola lectura el arreglo plano de colecciones folders del usuario. Un servicio de utilidad optimizado estructurará los nodos en un árbol de objetos vinculados por referencia en $O(N)$ antes de pasarlo al componente de UI de navegación. Esto minimiza el consumo de lecturas en la cuota de Google Cloud.

### 6. Estrategia de Despliegue e Infraestructura
- **Backend complementario:** El servidor Nitro nativo provisto por Nuxt 3 o microservicios NestJS encargados de procesamientos avanzados se compilarán en contenedores Docker livianos.

- Estos contenedores serán desplegados en **Google Cloud Run**, configurando el autoescalado con un mínimo de 0 instancias para reducir a cero los costos operativos fijos en periodos de inactividad.

- El despliegue de las aplicaciones cliente de escritorio y móvil se automatizará a través de pipelines de CI/CD que compilarán los binarios finales usando los toolchains de Rust (para Tauri) y las herramientas nativas de Android/iOS (para Capacitor).
