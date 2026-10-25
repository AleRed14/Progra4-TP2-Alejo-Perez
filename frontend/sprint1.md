# 🐾 Documentación Completa Sprint 1 — Frontend (Red Social "Patitas")
**Cátedra:** Programación IV — Tecnicatura Universitaria en Programación (UTN)  
**Evaluación:** Trabajo Práctico Nº 2 (Segundo Parcial con Defensa Oral)  
**Tecnologías:** Angular 22 (Standalone, Signals, Control Flow nativo, Interceptors y Guards funcionales)

---

## 📑 Índice General
1. [Resumen Ejecutivo y Criterios de Aprobación](#resumen-ejecutivo-y-criterios-de-aprobación)
2. [Historial de Ramas en Git](#historial-de-ramas-en-git)
3. [Fase 1: Fundaciones, Entornos y Estilos Temáticos](#fase-1-fundaciones-entornos-y-estilos-temáticos)
4. [Fase 2: Modelos de Dominio y Tipado Estricto](#fase-2-modelos-de-dominio-y-tipado-estricto)
5. [Fase 3: Servicios, Estado Reactivo y Toast (Sin alert)](#fase-3-servicios-estado-reactivo-y-toast-sin-alert)
6. [Refactorización Modular de Autenticación (Buenas Prácticas)](#refactorización-modular-de-autenticación-buenas-prácticas)
7. [Fase 4: Seguridad, Guards Funcionales e Interceptor HTTP](#fase-4-seguridad-guards-funcionales-e-interceptor-http)
8. [Fase 5: Componentes Compartidos (Navbar y Formulario Reutilizable)](#fase-5-componentes-compartidos-navbar-y-formulario-reutilizable)
9. [Fase 6: Vistas Ruteadas (Login, Registro, Feed y Mi Perfil)](#fase-6-vistas-ruteadas-login-registro-feed-y-mi-perfil)
10. [Fase 7: Shell Principal, Lazy Loading y Smoke Testing](#fase-7-shell-principal-lazy-loading-y-smoke-testing)
11. [Guía de Defensa Oral para el Coloquio (Preguntas y Respuestas en Criollo)](#guía-de-defensa-oral-para-el-coloquio-preguntas-y-respuestas-en-criollo)

---

## Resumen Ejecutivo y Criterios de Aprobación

El objetivo del Sprint 1 para el frontend consiste en dejar armada la estructura navegable, diseño temático artesanal sin librerías genéricas de IA, formularios con validaciones sincrónicas en tiempo real, gestión de sesión por JWT simulada/real con Signals y cero alertas nativas (`alert()` o `confirm()` prohibidos por cátedra).

Todo el desarrollo se estructuró en **7 fases correlativas**, compilando de forma limpia con `ng build` (0 errores, 0 advertencias) y empaquetando cada página mediante **Lazy Loading** (`loadComponent`).

---

## Historial de Ramas en Git

Para garantizar trazabilidad y permitir volver atrás en cualquier etapa:
* `main`: Código inicial limpio de Angular.
* `feature/sprint-1-frontend`: Fase 1 (Configuración, estilos globales, environments, favicons).
* `feature/sprint-1-fase-2`: Fase 2 (Modelos de dominio e interfaces TypeScript).
* `feature/sprint-1-fase-3`: Fase 3 (Servicios reactivos, Toasts y refactorización modular).
* `feature/sprint-1-fase-4`: Fase 4 (Guards funcionales e Interceptor HTTP).
* `feature/sprint-1-fase-5`: Fase 5 (Navbar y Formulario de registro reutilizable).
* `feature/sprint-1-fase-6`: Fase 6 (Vistas: Login, Registro, Feed de publicaciones y Mi perfil).
* `feature/sprint-1-fase-7`: **Rama final con Sprint 1 completo al 100%**.

---

## Fase 1: Fundaciones, Entornos y Estilos Temáticos

### 1. `angular.json`
* **¿Qué hace?**  
  Configura el reemplazo automático de archivos en el bloque `fileReplacements` dentro de `"development"`.
* **Objetivo:** Cuando ejecutás `ng serve`, Angular reemplaza automáticamente `src/environments/environment.ts` por `src/environments/environment.development.ts`, permitiendo alternar entre el servidor local (`localhost:3000`) y la nube en producción sin tocar código.

### 2. `src/environments/environment.development.ts`
* **¿Qué hace?** Exporta el objeto de configuración local `environment`:
  * `production: false`
  * `apiUrl: 'http://localhost:3000'`: Apunta al backend NestJS en la máquina local.
  * Tiempos configurables para la corrección en clase: `tiempoTokenSegundos: 60`, `tiempoAvisoPrevioSegundos: 15`, `delayPantallaCargaMs: 3500`, y límites de paginación (`limitePaginadoPublicaciones: 5`, `limitePaginadoComentarios: 3`).

### 3. `src/environments/environment.ts`
* **¿Qué hace?** Exporta el objeto de configuración de producción:
  * `production: true`
  * `apiUrl`: URL de la API desplegada en Vercel.

### 4. `src/app/app.config.ts`
* **Providers configurados:**
  * `provideHttpClient(withFetch())`: Habilita el cliente HTTP moderno de Angular usando la API nativa `Fetch` del navegador.
  * `provideRouter(routes, withComponentInputBinding())`: Configura el enrutador y permite recibir parámetros de ruta (`:id`) directamente como `input()` en los componentes.
  * `provideBrowserGlobalErrorListeners()`: Captura de errores globales no controlados.

### 5. `src/styles.css`
* **¿Qué hace?** Define el Sistema de Diseño Global "Patitas" artesanal:
  * **Variables CSS temáticas (`:root`):** Paleta cálida de mascotas basada en terracota (`#d96b43`), verde bosque (`#4a7c59`), acento dorado (`#f2a65a`), fondo crema suave (`#f9f6f0`) y texto carbón cálido (`#2c2520`).
  * **Tokens semánticos de estado:** `--color-success`, `--color-error`, `--color-warning` y `--color-info` cumpliendo con contrastes WCAG AA.
  * **Clases y utilidades:**
    * Botones: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-danger`, `.btn-sm`, `.btn-block`.
    * Formularios: `.form-group`, `.form-label`, `.form-input`, `.form-error` y pseudo-clase `:focus-visible` accesible.
    * Estructuras: `.container`, `.card`, `.card-header`, `.badge-admin`, `.sr-only`.

### 6. `src/index.html`
* **¿Qué hace?**
  * Idioma en castellano (`lang="es"`).
  * Título oficial de pestaña: `Patitas | Red Social de Mascotas`.
  * Metadatos temáticos (`theme-color: #d96b43`).
  * Conexión con Google Fonts: `Nunito` (titulares amigables) e `Inter` (cuerpo de lectura).
  * Vínculo a los favicons de mascotas presentes en `public/`.

---

## Fase 2: Modelos de Dominio y Tipado Estricto

### 1. `src/app/models/usuario.model.ts`
Centraliza los tipos y modelos de usuario alineados 1:1 con el schema Mongoose del backend:
* **`PerfilUsuario`**: `type PerfilUsuario = 'usuario' | 'administrador'`. Limita los roles permitidos.
* **`Usuario`**: Representa la entidad de MongoDB:
  * `_id`, `nombre`, `apellido`, `correo`, `nombreUsuario`, `fechaNacimiento`, `descripcion?`, `fotoPerfilUrl?`.
  * `perfil`: Tipo `PerfilUsuario`.
  * `deshabilitado: boolean`: Maneja el switch de bloqueo temporal por el administrador.
  * `eliminado: boolean`: Maneja la baja lógica definitiva (sin borrar documentos físicamente).
* **`CredencialesLogin`**: `{ identificador: string; password: string; }`. Permite identificarse con email o nombre de usuario.
* **`RegistroUsuarioDto`**: Datos enviados desde el formulario de alta.
* **`UsuarioSesion`**: Payload decodificado del JWT (`sub`, `nombreUsuario`, `correo`, `perfil`, `exp`, `iat`). El cliente nunca manipula contraseñas.

### 2. `src/app/models/respuesta-api.model.ts`
Estandariza los contratos HTTP con el backend:
* **`ErrorApi`**: Estructura del Exception Filter de NestJS (`codigo`, `mensaje`, `error`, `fecha`).
* **`RespuestaLogin`**: `{ token: string, usuario: Usuario, mensaje?: string }`.
* **`RespuestaRegistro`**: `{ mensaje: string, usuario: Usuario }`.
* **`RespuestaAutorizar`**: `{ usuario: Usuario, rol: PerfilUsuario }` (para comprobar validez de sesión al abrir la app).
* **`RespuestaRefrescar`**: `{ token: string }`.
* **`RespuestaPaginada<T>`**: Contrato genérico reutilizable para listados paginados (`items: T[]`, `total`, `limit`, `offset`).

---

## Fase 3: Servicios, Estado Reactivo y Toast (Sin alert)

### 1. `src/app/services/notificacion.service.ts`
* **Propósito:** Reemplazo estricto de `window.alert()` y `window.confirm()`. Maneja el estado global mediante Signals.
* **Señales:**
  * `_toasts = signal<NotificacionToast[]>([])`: Lista reactiva de alertas activas.
  * `_confirmacionActiva = signal<DialogoConfirmacion | null>(null)`: Estado del diálogo modal de confirmación.
  * `toasts` y `confirmacionActiva`: Expuestas como `asReadonly()` para garantizar inmutabilidad desde componentes externos.
* **Métodos:**
  * `mostrarToast(mensaje, tipo, duracionMs)`: Encola una notificación y programa su autodestrucción.
  * `exito()`, `error()`, `advertencia()`, `info()`: Atajos semánticos.
  * `removerToast(id)`: Elimina el toast por ID.
  * `confirmar(titulo, mensaje, textoConfirmar, textoCancelar)`: Retorna `Promise<boolean>`. Muestra el modal con fondo oscuro (backdrop) y resuelve en `true` (Confirmar) o `false` (Cancelar).
  * `responderConfirmacion(confirmado)`: Resuelve la promesa pendiente y cierra el modal.

### 2. `src/app/components/toast-mensajes/`
* **`toast-mensajes.ts`**: Inyecta `NotificacionService` mediante `inject()`.
* **`toast-mensajes.html`**:
  * Utiliza `@for (toast of notificacionService.toasts(); track toast.id)` para iterar eficientemente.
  * `@switch (toast.tipo)` para asignar íconos temáticos (`🐾`, `⚠️`, `⚡`, `ℹ️`).
  * `@if (notificacionService.confirmacionActiva(); as dialogo)` para desplegar el modal accesible con `role="dialog"` y `aria-modal="true"`.
* **`toast-mensajes.css`**: Contenedor en esquina superior derecha (`z-index: 9999`) con `pointer-events: none` y tarjetas con `pointer-events: auto`. Animación `slideIn` y bordes laterales de color según tipo.

---

## Refactorización Modular de Autenticación (Buenas Prácticas)

Para evitar un servicio monolítico de más de 200 líneas y cumplir con el Principio de Responsabilidad Única (SRP), se separó en 3 piezas:

### 1. `src/app/services/auth-storage.service.ts` (Adaptador de Persistencia)
* **Responsabilidad:** Es el **único archivo de la app que toca `localStorage`**.
* **Métodos:** `obtenerToken()`, `guardarToken()`, `obtenerUsuario()`, `guardarUsuario()`, `limpiar()`.
* **Justificación:** Si se pide cambiar `localStorage` por `cookies` o `sessionStorage`, solo se modifica este archivo de 40 líneas sin romper los servicios de negocio ni las vistas.

### 2. `src/app/services/autenticacion.mock.ts` (Módulo de Pruebas)
* **Responsabilidad:** Aislar los datos de prueba y respuestas simuladas.
* **Contenido:**
  * `CREDENCIALES_PRUEBA`: Usuarios precargados de cátedra (`nacho_user` / `User1234!` y `admin_pets` / `Admin1234!`).
  * `simularLoginMock()`: Simula el login con retardo cuando el backend está apagado. Si falla, emite el mensaje estricto: *"Las credenciales no son correctas"*.
  * `simularRegistroMock()`: Simula el alta generando un `_id` temporal.

### 3. `src/app/services/autenticacion.service.ts` (Fachada Principal)
* **Responsabilidad:** Administrar las señales de sesión y las llamadas HTTP a los endpoints (`login`, `registro`, `autorizar`, `refrescar`).
* **Señales:**
  * `_usuarioActual = signal(...)` (hidratado desde `AuthStorageService`).
  * `_token = signal(...)` (hidratado desde `AuthStorageService`).
  * `estaAutenticado = computed(...)`
  * `esAdmin = computed(...)`
* Reducido a ~120 líneas limpias y legibles.

---

## Fase 4: Seguridad, Guards Funcionales e Interceptor HTTP

### 1. `src/app/guards/auth.guard.ts`
* **Tipo:** `CanActivateFn` (Guard funcional moderno).
* **Comportamiento:** Si `authService.estaAutenticado()` es `true`, permite el paso (`return true`). Si es `false`, emite un toast de advertencia y retorna `router.createUrlTree(['/login'])`.

### 2. `src/app/guards/guest.guard.ts`
* **Tipo:** `CanActivateFn`.
* **Comportamiento:** Impide que usuarios ya autenticados entren a `/login` o `/registro`. Si ya hay sesión, los redirige a `/publicaciones`.

### 3. `src/app/guards/admin.guard.ts`
* **Tipo:** `CanActivateFn`.
* **Comportamiento:** Evalúa `authService.esAdmin()`. Si no tiene perfil `'administrador'`, muestra toast de error y redirige al feed.

### 4. `src/app/interceptors/auth.interceptor.ts`
* **Tipo:** `HttpInterceptorFn`.
* **Comportamiento:**
  1. Si hay token disponible, clona la solicitud saliente (`req.clone()`) y añade la cabecera `Authorization: Bearer <token>`.
  2. Captura respuestas con error mediante `catchError`:
     * **401 Unauthorized:** Si no proviene del formulario de login, significa que la sesión expiró. Limpia el storage, notifica con el mensaje oficial *"Tu sesión ha finalizado. Por favor, volvé a ingresar"* y redirige a `/login`.
     * **403 Forbidden:** Notifica que no se poseen permisos.
     * **500 Internal Server Error:** Notifica *"Ocurrió un problema en nuestros servidores. Por favor, intentá nuevamente en unos minutos."*
* **Registro en `app.config.ts`:** Se incluyó dentro de `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))`.

---

## Fase 5: Componentes Compartidos (Navbar y Formulario Reutilizable)

### 1. `src/app/components/navbar/`
* **`navbar.ts` y `navbar.html`:**
  * Cabecera responsive que se adapta mediante `@if (authService.estaAutenticado())`.
  * **Sin sesión:** Muestra enlaces a *"Iniciar Sesión"* y *"Registrarse"*.
  * **Con sesión:** Muestra enlaces al Feed, Mi Perfil, píldora con nombre de usuario, badge `"Admin 👑"` si es administrador y botón de salir.
  * **Cierre de sesión:** La función `cerrarSesion()` solicita confirmación mediante el modal propio antes de borrar la sesión y redirigir.

### 2. `src/app/components/formulario-registro/`
* **`formulario-registro.ts` y `formulario-registro.html`:**
  * Componente presentacional desacoplado con Reactive Forms.
  * Validaciones sincrónicas en tiempo real: nombres, correo electrónico válido, nombre de usuario y fecha de nacimiento.
  * **Checklist interactivo de contraseña (Clase 10):** El profesor exigió informar el formato mientras se completa el campo. Muestra una lista dinámica que verifica en vivo:
    * `Mínimo 8 caracteres`
    * `Al menos una mayúscula (A-Z)`
    * `Al menos un número (0-9)`
    * `Las contraseñas coinciden` (con el validador cruzado `coincidenciaPasswordValidator`).
  * **Entrada de foto de perfil:** Campo de archivo validado para imágenes (`JPG`, `PNG`, `WebP`).
  * **Reutilización:** Posee el input `esAdminCreando = input<boolean>(false)`. Si es `true` (en el panel de admin de Sprint 4), habilita un selector para elegir el rol del nuevo usuario sin duplicar formularios.
  * Emite los datos limpios mediante `formularioEnviado = output<RegistroUsuarioDto>()`.

---

## Fase 6: Vistas Ruteadas (Login, Registro, Feed y Mi Perfil)

### 1. `src/app/pages/login/`
* Formulario reactivo con `identificador` y `password`.
* **Botones de Acceso Rápido Docentes (Clase 10):**
  * `[🐕 Usuario Normal]`: Carga `nacho_user` / `User1234!`.
  * `[👑 Administrador]`: Carga `admin_pets` / `Admin1234!`.
* **Mensaje de error estricto:** Ante fallo de credenciales, muestra exclusivamente *"Las credenciales no son correctas"* (prohibido revelar si falló el usuario o la clave).

### 2. `src/app/pages/registro/`
* Smart Component que renderiza `<app-formulario-registro>`.
* Conecta el evento de salida con `authService.registro()`, muestra toast de éxito y redirige a `/login`.

### 3. `src/app/pages/publicaciones/`
* Maqueta completa del Feed de Mascotas con estilos finales.
* Selector de ordenamiento: *"📅 Más recientes"* vs *"❤️ Más populares"* con Signals (`criterioOrden`), preparado para conectar a los query params del backend en Sprint 2.
* Tarjetas temáticas con autor, avatar de mascota, fecha relativa, descripción y botón interactivo de *"🐾 Me gusta"*.
* Botón de eliminación (🗑️) visible para el autor o administrador, vinculado al modal de confirmación sin `alert()`.
* Botón *"+ Publicar Mascota"*.

### 4. `src/app/pages/mi-perfil/`
* Vista reactiva que consume directamente `authService.usuarioActual()`.
* Muestra avatar, nombre completo, nickname, correo, fecha de nacimiento, estado de cuenta y badge de rol.
* Botón *"✏️ Editar Perfil"*.
* Sección *"🐾 Mis últimas publicaciones"* con la maqueta de las 3 tarjetas requeridas por la consigna del perfil.

---

## Fase 7: Shell Principal, Lazy Loading y Smoke Testing

### 1. `src/app/app.routes.ts`
* Define el enrutamiento completo con **Lazy Loading** mediante `loadComponent: () => import(...)`:
  * `''`: Redirige a `/publicaciones`.
  * `/login` y `/registro`: Protegidas con `canActivate: [guestGuard]`.
  * `/publicaciones` y `/mi-perfil`: Protegidas con `canActivate: [authGuard]`.
  * `**`: Comodín que redirige a `/publicaciones`.

### 2. `src/app/app.ts`, `app.html` y `app.css`
* Se limpiaron las más de 340 líneas del template por defecto de Angular.
* Estructura semántica persistente:
  ```html
  <app-navbar />
  <main class="app-main-content">
    <router-outlet />
  </main>
  <app-toast-mensajes />
  ```
* Layout vertical con `min-height: 100vh` en CSS.

### 3. Resultado de Compilación (`ng build`)
El empaquetado de producción generó los chunks independientes sin errores:
```
Initial chunk files | Names         |  Raw size | Estimated transfer size
main-OZOTSDTR.js    | main          | 285.39 kB |                77.20 kB
styles-WSO62ZQG.css | styles        |   6.69 kB |                 1.73 kB

Lazy chunk files    | Names         |  Raw size | Estimated transfer size
chunk-C-7eCP4Q.js   | registro      |  12.44 kB |                 3.63 kB
chunk-DJJUxAP4.js   | publicaciones |   8.70 kB |                 2.78 kB
chunk-ldbs2hVw.js   | login         |   6.44 kB |                 2.26 kB
chunk-C_erUGMu.js   | mi-perfil     |   6.36 kB |                 2.08 kB
```

---

## Guía de Defensa Oral para el Coloquio (Preguntas y Respuestas en Criollo)

### 1. ¿Cómo funciona y para qué sirve el Guard (`auth.guard.ts`)?
> *"Profe, el guard es una función que actúa como patovica antes de cargar una ruta protegida. Consulta al servicio si hay un usuario y un token activos. Si no hay sesión, cancela la navegación y devuelve un `UrlTree` que redirige al usuario a `/login` mostrándole un aviso, impidiendo que alguien entre tipeando la URL a mano."*

### 2. ¿Cómo funciona el Interceptor HTTP (`auth.interceptor.ts`)?
> *"Es como un peaje automático para todas las peticiones HTTP que salen de la app. Revisa si tenemos un token JWT guardado; si existe, clona la petición y le pega la cabecera `Authorization: Bearer <token>`. Y si el servidor nos responde con un 401 porque el token expiró, limpia el storage, avisa en castellano y manda al usuario al login para renovar sesión."*

### 3. ¿Por qué separaron `AuthStorageService` de `AutenticacionService`?
> *"Para respetar el principio de responsabilidad única. `AuthStorageService` solo se encarga de leer y escribir en `localStorage`. Si mañana la cátedra nos pide pasar a guardar el token en cookies o en `sessionStorage`, solo modificamos ese archivo de 40 líneas sin tocar las llamadas a la API ni los componentes."*

### 4. ¿Por qué crearon un `NotificacionService` y no usaron `alert()`?
> *"Porque la consigna del TP2 prohíbe explícitamente el uso de `window.alert()` y `window.confirm()`. Implementamos un servicio reactivo con Signals que encola mensajes y un componente flotante Toast que los dibuja con los colores del tema de mascotas y los elimina automáticamente tras unos segundos."*

### 5. ¿Por qué usamos Signals (`signal`, `computed`) en lugar de variables tradicionales o RxJS?
> *"Porque es el estándar reactivo moderno de Angular (versiones 17 a 22). Una `signal` le notifica automáticamente a la vista cuando los datos cambian sin necesidad de suscripciones manuales (`subscribe`), y usamos `computed()` para derivar si el usuario está autenticado o si es administrador de forma reactiva y pura."*

### 6. ¿Por qué aplicaron Lazy Loading en las rutas?
> *"Para optimizar el rendimiento y la carga inicial. Con `loadComponent` y dynamic imports (`import(...)`), el navegador solo descarga el código de la pantalla a la que el usuario efectivamente ingresa, en lugar de descargar toda la aplicación junta en el primer ingreso."*
