# Arquitectura del Proyecto: Red Social de Mascotas ("Patitas" / PetSocial)
**Cátedra:** Programación IV — Tecnicatura Universitaria en Programación (UTN)  
**Evaluación:** Trabajo Práctico Nº 2 (Segundo Parcial con Defensa Oral)

---

## 0. Ficha Técnica y Decisiones Iniciales

* **Tema de la Red Social:** Publicaciones de Mascotas (historias, fotos, adopciones, cuidados y anécdotas de perros, gatos y otras mascotas).
* **Frontend:** Angular 22 (Standalone Components, Signals, nuevo Control Flow `@if` / `@for`, Interceptors funcionales).
* **Backend:** NestJS con TypeScript.
* **Base de Datos:** MongoDB Atlas con ODM Mongoose (`@nestjs/mongoose`).
* **Almacenamiento de Imágenes:** Servicio desacoplado mediante adaptador (`ImagenesService`), compatible con Cloudinary, Supabase Storage o subida local con Multer.
* **Criterio de Aprobación:** Código simple, modular, sin librerías "caja negra" difíciles de justificar en el coloquio oral.

---

## 1. Estructura de Carpetas (Árbol Completo)

### 1.1 Backend (NestJS)

> **Por qué:** Mantenemos únicamente los **3 módulos oficiales pedidos por la cátedra** (`autenticacion`, `usuarios`, `publicaciones`). Los controllers de comentarios y estadísticas viven dentro de `publicaciones` porque dependen conceptualmente de las publicaciones. Los componentes transversales (guards, filtros, decoradores) van en `common/`.

```
backend-pet-social/
├── .env                                 # Variables de entorno y tiempos configurables
├── .env.example                         # Plantilla para clonar el proyecto
├── package.json
├── tsconfig.json
└── src/
    ├── main.ts                          # Bootstrap: CORS, ValidationPipe global, filtro global de errores
    ├── app.module.ts                    # ConfigModule, MongooseModule y los 3 módulos obligatorios
    │
    ├── config/
    │   └── env.config.ts                # Centraliza lectura tipada de variables (.env)
    │
    ├── common/                          # Utilidades transversales (NO son módulos de negocio)
    │   ├── decorators/
    │   │   ├── usuario-actual.decorator.ts  # Inyecta req.user extraído del JWT en los controllers
    │   │   └── roles.decorator.ts           # Metadata para rutas que exigen rol 'administrador'
    │   ├── guards/
    │   │   ├── jwt-auth.guard.ts            # Valida presencia, firma y vigencia del JWT (401)
    │   │   └── roles.guard.ts               # Verifica si req.user.perfil === 'administrador' (403)
    │   ├── filters/
    │   │   └── http-exception.filter.ts     # Unifica todas las respuestas de error en castellano
    │   └── services/
    │       └── imagenes.service.ts          # Servicio agnóstico de carga y validación de imágenes
    │
    ├── autenticacion/                   # MÓDULO OBLIGATORIO 1
    │   ├── autenticacion.module.ts
    │   ├── autenticacion.controller.ts  # /autenticacion (registro, login, autorizar, refrescar)
    │   ├── autenticacion.service.ts     # Hashing con bcrypt, generación y verificación de JWT
    │   └── dto/
    │       ├── registro.dto.ts          # Valida campos del registro y contraseña segura
    │       └── login.dto.ts             # Valida usuario/correo y contraseña plana
    │
    ├── usuarios/                        # MÓDULO OBLIGATORIO 2
    │   ├── usuarios.module.ts
    │   ├── usuarios.controller.ts       # /usuarios (listado admin, alta admin, habilitar/deshabilitar/eliminar)
    │   ├── usuarios.service.ts
    │   ├── schemas/
    │   │   └── usuario.schema.ts        # Schema Mongoose de Usuario (estados: activo, deshabilitado, eliminado)
    │   └── dto/
    │       ├── crear-usuario-admin.dto.ts  # Extiende registro agregando selección de perfil (admin/usuario)
    │       └── actualizar-perfil.dto.ts    # Datos editables por el propio usuario en "Mi Perfil"
    │
    └── publicaciones/                   # MÓDULO OBLIGATORIO 3
        ├── publicaciones.module.ts      # Declara los 3 controllers y registra Publicacion y Comentario schemas
        ├── controllers/
        │   ├── publicaciones.controller.ts  # /publicaciones (CRUD, feed paginado, me gusta / quitar me gusta)
        │   ├── comentarios.controller.ts    # /comentarios (CRUD paginado vinculado a publicación)
        │   └── estadisticas.controller.ts   # /estadisticas (Métricas admin filtradas por fechas)
        ├── services/
        │   ├── publicaciones.service.ts
        │   ├── comentarios.service.ts
        │   └── estadisticas.service.ts
        ├── schemas/
        │   ├── publicacion.schema.ts    # Schema Mongoose de Publicación (con baja lógica e índice de me gusta)
        │   └── comentario.schema.ts     # Schema Mongoose de Comentario (con marca "modificado: true")
        └── dto/
            ├── crear-publicacion.dto.ts
            ├── filtro-publicaciones.dto.ts # query params: offset, limit, orden, usuario
            ├── crear-comentario.dto.ts
            ├── editar-comentario.dto.ts
            ├── filtro-comentarios.dto.ts   # query params: publicacionId, offset, limit
            └── filtro-estadisticas.dto.ts  # query params: fechaDesde, fechaHasta
```

---

### 1.2 Frontend (Angular 22)

> **Por qué:** Aplicamos Standalone Components y Signals nativos de Angular 22. Separamos las vistas principales (`pages/`) de los componentes presentacionales reutilizables (`components/`), cumpliendo la exigencia del docente de que la tarjeta de publicación reciba datos por `@Input()` y emita eventos por `@Output()`.

```
frontend-pet-social/
├── angular.json
├── ngsw-config.json                     # Configuración del Service Worker para PWA (Sprint 4)
├── package.json
└── src/
    ├── index.html                       # Favicon temático obligatorio de mascotas
    ├── manifest.webmanifest             # Manifiesto PWA obligatorio (Sprint 4)
    ├── styles.css                       # Variables CSS del tema (paleta visual cálida para mascotas, sin IA genérica)
    ├── environments/
    │   ├── environment.ts               # apiUrl, tiempos configurables del token y límites de paginado
    │   └── environment.prod.ts
    └── app/
        ├── app.component.ts             # Shell principal: Navbar, RouterOutlet, ToastContainer y ModalSesion
        ├── app.config.ts                # provideRouter, provideHttpClient con interceptors, provideServiceWorker
        ├── app.routes.ts                # Rutas protegidas por Guards
        │
        ├── models/                      # Interfaces TypeScript para garantizar tipado estricto
        │   ├── usuario.model.ts
        │   ├── publicacion.model.ts
        │   ├── comentario.model.ts
        │   ├── estadistica.model.ts
        │   └── respuesta-api.model.ts
        │
        ├── services/
        │   ├── autenticacion.service.ts # Login, registro, autorizar, refrescar y estado con Signals
        │   ├── sesion-timer.service.ts  # Contador regresivo configurable que avisa antes del vencimiento
        │   ├── usuarios.service.ts      # Perfil propio, edición y ABM de usuarios para admin
        │   ├── publicaciones.service.ts # Feed, ordenamiento, alta, baja y me gusta
        │   ├── comentarios.service.ts   # Paginado ("cargar más"), agregar y editar comentarios
        │   ├── estadisticas.service.ts  # Consultas de métricas para gráficos (Sprint 4)
        │   └── notificacion.service.ts  # Servicio central de modales y toasts (reemplazo absoluto de alert)
        │
        ├── guards/
        │   ├── auth.guard.ts            # Bloquea acceso anónimo y redirige a /login
        │   ├── guest.guard.ts           # Impide entrar a /login o /registro si ya hay sesión activa
        │   └── admin.guard.ts           # Exclusivo para usuarios con perfil 'administrador'
        │
        ├── interceptors/
        │   └── auth.interceptor.ts      # Inyecta token JWT en cabeceras y captura errores 401/403/500
        │
        ├── pipes/                       # 3 PIPES PROPIAS (Sprint 4, usables desde sprints previos)
        │   ├── truncar-texto.pipe.ts    # Corta descripciones largas con '... ver más'
        │   ├── tiempo-relativo.pipe.ts  # Convierte fechas a formato legible ("hace 10 minutos", "ayer")
        │   └── rol-formato.pipe.ts      # Transforma claves técnicas ('administrador', 'activo') a texto amigable
        │
        ├── directives/                  # 3 DIRECTIVAS PROPIAS (Sprint 4)
        │   ├── solo-admin.directive.ts          # Estructural (*appSoloAdmin) para renderizado condicional de admin
        │   ├── imagen-fallback.directive.ts     # De atributo: coloca foto de mascota por defecto si falla la URL
        │   └── resaltar-propio.directive.ts     # De estilo: destaca visualmente los comentarios o posts del propio usuario
        │
        ├── components/                  # Componentes reutilizables
        │   ├── navbar/                  # Navegación, avatar de usuario, acceso a perfil y logout
        │   ├── publicacion-card/        # OBLIGATORIO: @Input() datos, @Output() meGusta/eliminar/verDetalle
        │   ├── comentario-item/         # Muestra autor, fecha, chip de 'Editado' y formulario inline de edición
        │   ├── formulario-registro/     # Reutilizado en /registro y en el dashboard de admin
        │   ├── modal-confirmacion/      # Modal genérico con texto de confirmación para toda eliminación
        │   ├── modal-expiracion/        # Modal que avisa vencimiento inminente del token y ofrece refrescarlo
        │   ├── modal-editar-perfil/     # Formulario modal para actualizar datos y foto desde "Mi Perfil"
        │   └── toast-mensajes/          # Notificaciones flotantes de éxito y error en castellano
        │
        └── pages/                       # Pantallas ruteadas
            ├── cargando/                # Pantalla inicial con spinner y delay de 3-4s que valida sesión
            ├── login/                   # Con formulario validado y accesos rápidos (usuario y admin de prueba)
            ├── registro/                # Alta de usuarios estándar
            ├── publicaciones/           # Feed principal (orden por fecha/likes, paginación, botón crear post)
            ├── publicacion-detalle/     # Vista ampliada del post + comentarios con botón "Cargar más"
            ├── mi-perfil/               # Vista de datos, botón "Editar perfil" y últimas 3 publicaciones
            └── admin/
                ├── dashboard-usuarios/      # Listado, alta con rol y botones: habilitar/deshabilitar y eliminar
                └── dashboard-estadisticas/  # 3 gráficos de distinto tipo con selector de fechas desde/hasta
```

---

## 2. Módulos de NestJS y sus Controllers

| Módulo (`@Module`) | Controllers incluidos | Responsabilidad y dependencias |
| :--- | :--- | :--- |
| **`AutenticacionModule`** | `AutenticacionController`<br>`(/autenticacion)` | Login, Registro inicial, Verificación de sesión activa (`/autorizar`) y Renovación (`/refrescar`). Usa `UsuariosModule` para consultar credenciales y guardar nuevos usuarios. |
| **`UsuariosModule`** | `UsuariosController`<br>`(/usuarios)` | Administración de usuarios (solo admin): listar, dar de alta con rol, deshabilitar, rehabilitar y baja definitiva. Manejo de "Mi Perfil" y actualización de datos para el usuario logueado. |
| **`PublicacionesModule`** | 1. `PublicacionesController`<br>`(/publicaciones)`<br><br>2. `ComentariosController`<br>`(/comentarios)`<br><br>3. `EstadisticasController`<br>`(/estadisticas)` | **Controller 1:** Alta de post, listado paginado y ordenado, baja lógica y me gusta / quitar me gusta.<br><br>**Controller 2:** CRUD paginado de comentarios sobre publicaciones, control de autoría y marca de modificación.<br><br>**Controller 3:** Endpoints protegidos para administradores que computan métricas por rango de fechas para los gráficos. |

> **Justificación para el coloquio:** Comentarios y Estadísticas no tienen entidad de negocio autosuficiente sin las Publicaciones. Colocarlos dentro del módulo de Publicaciones como controllers separados cumple al pie de la letra la consigna y previene dependencias circulares.

---

## 3. Schemas de Mongoose (MongoDB)

### 3.1 `UsuarioSchema` (Colección: `usuarios`)

```typescript
// Campos y configuración del modelo Usuario
{
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  nombreUsuario: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true }, // Guardado con hash bcrypt (mínimo salt 10)
  fechaNacimiento: { type: Date, required: true },
  descripcion: { type: String, default: '', trim: true }, // Breve bio del dueño/mascota
  fotoPerfilUrl: { type: String, default: 'assets/imagenes/avatar-defecto.png' },
  perfil: { 
    type: String, 
    enum: ['usuario', 'administrador'], 
    default: 'usuario',
    index: true 
  },
  // Manejo explícito de estados según apuntes de cátedra:
  deshabilitado: { type: Boolean, default: false, index: true }, // Switch de admin (bloqueo temporal)
  eliminado: { type: Boolean, default: false, index: true }       // Baja lógica definitiva
},
{ timestamps: true } // Agrega createdAt y updatedAt automáticamente
```

* **Índices:** `{ correo: 1 }` (único), `{ nombreUsuario: 1 }` (único).
* **Manejo de estados:**
  * Si `eliminado === true`: El login responde con error específico: *"Tu cuenta ha sido dada de baja"*.
  * Si `deshabilitado === true`: El login responde con error específico: *"Tu cuenta se encuentra deshabilitada temporalmente"*.
  * Si las credenciales no coinciden o el usuario no existe: *"Las credenciales no son correctas"*.

---

### 3.2 `PublicacionSchema` (Colección: `publicaciones`)

```typescript
// Campos y configuración del modelo Publicación
{
  titulo: { type: String, required: true, trim: true },
  descripcion: { type: String, required: true, trim: true }, // Texto o anécdota de la mascota
  imagenUrl: { type: String, default: null },                 // Imagen opcional
  autor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true, 
    index: true 
  },
  // Array de IDs de usuarios que dieron me gusta (permite conteo rápido y validación de unicidad)
  meGusta: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario' 
  }],
  cantidadMeGusta: { type: Number, default: 0, index: true }, // Campo desnormalizado para ordenar eficientemente
  eliminado: { type: Boolean, default: false, index: true }   // Baja lógica
},
{ timestamps: true }
```

* **Índices:** `{ createdAt: -1 }` (orden cronológico por defecto), `{ cantidadMeGusta: -1 }` (orden por popularidad), `{ autor: 1, eliminado: 1 }` (feed y perfil de usuario).
* **Consistencia de "Me gusta":** Al dar me gusta se usa `$addToSet` (evita duplicados a nivel atómico en MongoDB) e incrementa `cantidadMeGusta` en $+1$. Al quitar me gusta se usa `$pull` y se decrementa en $-1$.

---

### 3.3 `ComentarioSchema` (Colección: `comentarios`)

```typescript
// Campos y configuración del modelo Comentario
{
  publicacionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Publicacion', 
    required: true, 
    index: true 
  },
  autor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  mensaje: { type: String, required: true, trim: true },
  modificado: { type: Boolean, default: false }, // Se activa en true tras un PUT
  eliminado: { type: Boolean, default: false, index: true } // Baja lógica
},
{ timestamps: true }
```

* **Índices:** `{ publicacionId: 1, createdAt: -1 }` para traer rápidamente los comentarios más recientes paginados de un post.

---

## 4. Tabla de Endpoints por Sprint

### Sprint 1: Base de la Aplicación y Autenticación

| Método | Ruta | Auth Requerida | Rol | Parámetros / Body | Éxito | Errores Posibles | Descripción / Regla |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/autenticacion/registro` | Pública | Cualquiera | Form-data con datos + archivo de imagen (opcional) | `201 Created`<br>`{ mensaje, usuario }` | `400 Bad Request` (campos inválidos o password débil)<br>`409 Conflict` (correo o usuario ya en uso) | Crea usuario con perfil `usuario` por defecto. Encripta password con bcrypt. |
| `POST` | `/autenticacion/login` | Pública | Cualquiera | Body JSON:<br>`{ identificador, password }` | `200 OK`<br>`{ token, usuario }` | `400 Bad Request`<br>`401 Unauthorized` ("Las credenciales no son correctas", o avisos de deshabilitado/eliminado) | Recibe correo o nombre de usuario en `identificador`. Compara hash de contraseña. |

---

### Sprint 2: Publicaciones, Feed, Me Gusta y Mi Perfil

| Método | Ruta | Auth Requerida | Rol | Parámetros / Body | Éxito | Errores Posibles | Descripción / Regla |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/publicaciones` | Sí (JWT) | Usuario o Admin | Query params:<br>`?orden=fecha|megusta`<br>`&offset=0&limit=5`<br>`&usuarioId=idOpcional` | `200 OK`<br>`{ items, total, limit, offset }` | `401 Unauthorized`<br>`400 Bad Request` | Lista publicaciones no eliminadas. Sirve tanto para el Feed general como para las últimas 3 de "Mi Perfil". |
| `GET` | `/publicaciones/:id` | Sí (JWT) | Usuario o Admin | Param: `:id` | `200 OK`<br>`{ publicacion }` | `401 Unauthorized`<br>`404 Not Found` | Devuelve una publicación particular con datos poblados de su autor. |
| `POST` | `/publicaciones` | Sí (JWT) | Usuario o Admin | Form-data o JSON:<br>`{ titulo, descripcion, imagen }` | `201 Created`<br>`{ publicacion }` | `401 Unauthorized`<br>`400 Bad Request` | El autor se extrae **siempre** del JWT (decorador `@UsuarioActual()`). |
| `DELETE`| `/publicaciones/:id` | Sí (JWT) | Dueño o Admin | Param: `:id` | `200 OK`<br>`{ mensaje }` | `401 Unauthorized`<br>`403 Forbidden` (no es dueño ni admin)<br>`404 Not Found` | **Baja lógica:** actualiza `{ eliminado: true }`. No borra el registro de la base. |
| `POST` | `/publicaciones/:id/megusta` | Sí (JWT) | Usuario o Admin | Param: `:id` | `200 OK`<br>`{ cantidadMeGusta, dioMeGusta: true }` | `401 Unauthorized`<br>`400 Bad Request` (ya había dado me gusta)<br>`404 Not Found` | Agrega el ID del usuario actual al array `meGusta` si no existía. |
| `DELETE`| `/publicaciones/:id/megusta` | Sí (JWT) | Usuario o Admin | Param: `:id` | `200 OK`<br>`{ cantidadMeGusta, dioMeGusta: false }` | `401 Unauthorized`<br>`400 Bad Request` (no tenía me gusta previo)<br>`404 Not Found` | Quita el ID del usuario del array `meGusta`. |
| `GET` | `/usuarios/mi-perfil` | Sí (JWT) | Usuario o Admin | Ninguno | `200 OK`<br>`{ usuario }` | `401 Unauthorized`<br>`404 Not Found` | Devuelve datos completos del usuario autenticado para la pantalla "Mi Perfil". |
| `PUT` | `/usuarios/mi-perfil` | Sí (JWT) | Usuario o Admin | Body JSON o Form-data:<br>`{ nombre, apellido, fechaNacimiento, descripcion, imagen }` | `200 OK`<br>`{ usuario }` | `401 Unauthorized`<br>`400 Bad Request` | Permite al usuario editar su propia información personal y foto. |

---

### Sprint 3: Detalle, Comentarios y Manejo de Sesión (JWT)

| Método | Ruta | Auth Requerida | Rol | Parámetros / Body | Éxito | Errores Posibles | Descripción / Regla |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/autenticacion/autorizar` | Sí (JWT) | Usuario o Admin | Cabecera `Authorization: Bearer <token>` | `200 OK`<br>`{ usuario, rol }` | `401 Unauthorized` ("Tu sesión ha expirado o el token es inválido") | Usado por la pantalla "Cargando" al abrir la app para validar sesión previa. |
| `POST` | `/autenticacion/refrescar` | Sí (JWT) | Usuario o Admin | Cabecera `Authorization: Bearer <token>` | `200 OK`<br>`{ token }` | `401 Unauthorized` | Renueva el token devolviendo uno nuevo con el mismo payload y tiempo completo. |
| `GET` | `/comentarios` | Sí (JWT) | Usuario o Admin | Query params:<br>`?publicacionId=id`<br>`&offset=0&limit=3` | `200 OK`<br>`{ items, total, offset, limit }` | `401 Unauthorized`<br>`400 Bad Request` | Lista comentarios ordenados del más reciente al más antiguo. Soporta el "Cargar más". |
| `POST` | `/comentarios` | Sí (JWT) | Usuario o Admin | Body JSON:<br>`{ publicacionId, mensaje }` | `201 Created`<br>`{ comentario }` | `401 Unauthorized`<br>`400 Bad Request`<br>`404 Not Found` | El autor se extrae del token; no se envía en el body. Guarda fecha automática. |
| `PUT` | `/comentarios/:id` | Sí (JWT) | Solo el Autor | Param: `:id`<br>Body JSON: `{ mensaje }` | `200 OK`<br>`{ comentario }` | `401 Unauthorized`<br>`403 Forbidden` (no es el autor del comentario)<br>`404 Not Found` | Actualiza el mensaje y asigna `modificado: true`. |

---

### Sprint 4: Administración y Estadísticas

| Método | Ruta | Auth Requerida | Rol | Parámetros / Body | Éxito | Errores Posibles | Descripción / Regla |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/usuarios` | Sí (JWT) | Administrador | Ninguno | `200 OK`<br>`[ { usuario }, ... ]` | `401 Unauthorized`<br>`403 Forbidden` | Listado completo de usuarios para el dashboard de administración. |
| `POST` | `/usuarios` | Sí (JWT) | Administrador | Body / Form-data:<br>Datos registro + `perfil: 'usuario'\|'administrador'` | `201 Created`<br>`{ usuario }` | `401 Unauthorized`<br>`403 Forbidden`<br>`400 Bad Request` | Permite al administrador crear usuarios eligiendo expresamente el rol. |
| `DELETE`| `/usuarios/:id/deshabilitar`| Sí (JWT) | Administrador | Param: `:id` | `200 OK`<br>`{ mensaje, deshabilitado: true }` | `401 Unauthorized`<br>`403 Forbidden`<br>`404 Not Found` | Modifica `deshabilitado: true`. Bloquea el login pero no borra el usuario. |
| `POST` | `/usuarios/:id/habilitar` | Sí (JWT) | Administrador | Param: `:id` | `200 OK`<br>`{ mensaje, deshabilitado: false }` | `401 Unauthorized`<br>`403 Forbidden`<br>`404 Not Found` | Reactiva al usuario modificado con `deshabilitado: false`. |
| `DELETE`| `/usuarios/:id/eliminar` | Sí (JWT) | Administrador | Param: `:id` | `200 OK`<br>`{ mensaje, eliminado: true }` | `401 Unauthorized`<br>`403 Forbidden`<br>`404 Not Found` | **Baja lógica:** marca `eliminado: true` respondiendo al botón de eliminación definitiva. |
| `GET` | `/estadisticas/publicaciones-por-usuario` | Sí (JWT) | Administrador | Query params:<br>`?desde=YYYY-MM-DD`<br>`&hasta=YYYY-MM-DD` | `200 OK`<br>`[ { usuario, totalPublicaciones } ]` | `401 Unauthorized`<br>`403 Forbidden`<br>`400 Bad Request` | Métricas agrupadas para gráfico de barras. |
| `GET` | `/estadisticas/comentarios-totales` | Sí (JWT) | Administrador | Query params:<br>`?desde=YYYY-MM-DD`<br>`&hasta=YYYY-MM-DD` | `200 OK`<br>`{ totalComentarios, evolucionPorDia: [...] }` | `401 Unauthorized`<br>`403 Forbidden`<br>`400 Bad Request` | Métricas para gráfico de líneas o torta. |
| `GET` | `/estadisticas/comentarios-por-publicacion` | Sí (JWT) | Administrador | Query params:<br>`?desde=YYYY-MM-DD`<br>`&hasta=YYYY-MM-DD` | `200 OK`<br>`[ { publicacionId, titulo, totalComentarios } ]` | `401 Unauthorized`<br>`403 Forbidden`<br>`400 Bad Request` | Métricas desglosadas por post para gráfico circular/dona. |

---

## 5. Diseño de Seguridad y Manejo de Sesión

### 5.1 Payload del JWT

```json
{
  "sub": "654321abcdef0123456789ab",
  "nombreUsuario": "nacho_pets",
  "correo": "nacho@petsocial.com",
  "perfil": "administrador",
  "iat": 1714560000,
  "exp": 1714560060
}
```

> **Por qué:** Solo incluimos identificadores esenciales y el rol. Nunca incluimos contraseñas ni datos sensibles en el payload porque el JWT es visible en base64 en el cliente.

### 5.2 Configuración Dinámica de Tiempos (Requisito de Cátedra)

En el backend (`.env`):
```env
# En desarrollo para corrección en clase: segundos. En producción: minutos.
JWT_SECRET=super_clave_secreta_utn_programacion4
JWT_EXPIRATION_TIME=60s
```

En el frontend (`environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  // Configuración de tiempos de sesión para la defensa:
  tiempoTokenSegundos: 60,         // Vencimiento total del token
  tiempoAvisoPrevioSegundos: 15,   // Cuántos segundos antes aparece el modal de aviso
  limitePaginadoPublicaciones: 5,  // Cantidad de posts por página
  limitePaginadoComentarios: 3,    // Cantidad de comentarios por tanda
  delayPantallaCargaMs: 3500       // 3.5 segundos de spinner obligatorio en la pantalla de inicio
};
```

### 5.3 Flujo de Sesión y Modal de Expiración

```
[Usuario Navegando] 
       │
       ▼ (Al llegar a los 45 seg con token de 60 seg)
[Modal de Advertencia]: "Tu sesión está por expirar en 15 segundos. ¿Querés extenderla?"
       ├── SI ──► Llama a POST /autenticacion/refrescar ──► Guarda nuevo token y reinicia contador.
       └── NO (o no responde) ──► El token expira ──► Siguiente petición HTTP devuelve 401
                                                        │
                                                        ▼
                                              auth.interceptor captura 401
                                              Limpia almacenamiento local
                                              Muestra toast: "Tu sesión ha expirado"
                                              Redirige a /login
```

### 5.4 Extracción Segura de la Identidad del Usuario

> **Regla de oro:** El ID del usuario creador **nunca se toma del `body` del request**.  
> El `JwtAuthGuard` valida el token de la cabecera `Authorization: Bearer <token>`, decodifica el payload y lo asigna a `request.user`.  
> En los controllers usamos el decorador personalizado `@UsuarioActual()`:

```typescript
// En publicaciones.controller.ts:
@Post()
@UseGuards(JwtAuthGuard)
crear(
  @Body() dto: CrearPublicacionDto,
  @UsuarioActual('sub') usuarioId: string // Sale del token verificado por el guard
) {
  return this.publicacionesService.crear(dto, usuarioId);
}
```

---

## 6. Frontend: Rutas, Estado y Componentes

### 6.1 Tabla de Rutas en Angular (`app.routes.ts`)

| Ruta | Componente / Página | Guards | Descripción |
| :--- | :--- | :--- | :--- |
| `/` | `CargandoComponent` | Ninguno | Splash screen inicial. Valida token contra `/autenticacion/autorizar` con delay de 3.5s. Redirige a `/publicaciones` o `/login`. |
| `/login` | `LoginComponent` | `GuestGuard` | Formulario de login con accesos rápidos para usuario común y administrador. |
| `/registro` | `RegistroComponent` | `GuestGuard` | Formulario público de alta de usuario con validaciones en tiempo real. |
| `/publicaciones` | `PublicacionesComponent` | `AuthGuard` | Feed de posteos con selector de orden (fecha / me gusta) y paginado. |
| `/publicaciones/:id` | `PublicacionDetalleComponent` | `AuthGuard` | Posteo en pantalla completa + listado de comentarios con botón "Cargar más". |
| `/mi-perfil` | `MiPerfilComponent` | `AuthGuard` | Muestra datos del usuario, botón "Editar Perfil" y sus últimas 3 publicaciones. |
| `/admin/usuarios` | `DashboardUsuariosComponent` | `AuthGuard`, `AdminGuard` | Panel de gestión de usuarios: alta con rol, deshabilitar, rehabilitar y baja definitiva. |
| `/admin/estadisticas`| `DashboardEstadisticasComponent`| `AuthGuard`, `AdminGuard` | 3 gráficos distintos con filtros de fecha desde/hasta. |
| `**` | Redirige a `/` | Ninguno | Manejo de rutas desconocidas. |

---

### 6.2 Componente Obligatorio: `PublicacionCardComponent`

Para cumplir de forma estricta la consigna contra monolitos generados por IA, la tarjeta de publicación es un componente presentacional puro:

* **Inputs:**
  * `@Input({ required: true }) publicacion!: Publicacion;` (datos del posteo).
  * `@Input() esAdmin: boolean = false;` (para saber si puede dar de baja cualquier post).
  * `@Input() idUsuarioActual: string = '';` (para saber si es el autor y mostrar el botón de eliminar).
* **Outputs:**
  * `@Output() meGusta = new EventEmitter<string>();` (emite el ID del post al cliquear el corazón/huella).
  * `@Output() eliminar = new EventEmitter<string>();` (emite el ID para que la página abra el modal de confirmación).
  * `@Output() verDetalle = new EventEmitter<string>();` (emite para navegar a `/publicaciones/:id`).

---

### 6.3 Catálogo de Pipes Propias (Sprint 4)

1. **`TruncarTextoPipe` (`truncarTexto:limite`):** Corta descripciones de mascotas largas (ej. más de 120 caracteres) y coloca puntos suspensivos para evitar que las tarjetas se desborden.
2. **`TiempoRelativoPipe` (`tiempoRelativo`):** Recibe un string de fecha ISO y devuelve texto entendible ("Hace 3 minutos", "Hace 2 horas", "Ayer").
3. **`RolFormatoPipe` (`rolFormato`):** Transforma códigos internos (`'administrador'` $\to$ `"Administrador del Sistema"`, `'deshabilitado'` $\to$ `"Cuenta Suspendida"`).

---

### 6.4 Catálogo de Directivas Propias (Sprint 4)

1. **`SoloAdminDirective` (`*appSoloAdmin`):** Directiva estructural. Verifica mediante el servicio de autenticación si el usuario logueado es administrador; si no lo es, destruye el nodo del DOM (usado en botones de eliminación global o accesos al dashboard).
2. **`ImagenFallbackDirective` (`appImagenFallback`):** Directiva de atributo sobre etiquetas `<img>`. Si la URL de la imagen del post o avatar falla (error 404), reemplaza automáticamente el `src` por una ilustración por defecto de mascota (`assets/imagenes/placeholder-mascota.png`).
3. **`ResaltarPropioDirective` (`appResaltarPropio`):** Directiva de atributo/estilo. Si el autor de la publicación o comentario coincide con el usuario autenticado, aplica un borde distintivo sutil con el color primario del tema para identificar contenido propio.

---

## 7. Manejo de Errores y Experiencia de Usuario (UX)

### 7.1 Reemplazo Absoluto de `alert()`
Queda terminantemente prohibido el uso de la función nativa `window.alert()` o `window.confirm()`.  
Toda interacción visual se resuelve mediante `NotificacionService`:

* **`notificacionService.mostrarToast(mensaje, 'exito' | 'error' | 'info')`:** Notificaciones no intrusivas en la esquina superior derecha que desaparecen solas a los 4 segundos.
* **`notificacionService.confirmar(titulo, mensaje): Promise<boolean>`:** Abre un modal con fondo oscuro (backdrop) que retorna una promesa resuelta en `true` si el usuario presiona "Confirmar" o `false` si presiona "Cancelar".

### 7.2 Mensajes de Error en Castellano No Técnicos

| Situación Técnica | Mensaje Prohibido (Técnico) | Mensaje Implementado (En Castellano y Claro) |
| :--- | :--- | :--- |
| Contraseña incorrecta | `401 Unauthorized: Invalid password` | *"Las credenciales no son correctas"* |
| Usuario no encontrado | `404 User not found` | *"Las credenciales no son correctas"* |
| Cuenta deshabilitada | `403 Forbidden: User disabled` | *"Tu cuenta ha sido deshabilitada temporalmente por un administrador"* |
| Cuenta eliminada | `403 Forbidden: User deleted` | *"Tu cuenta ha sido dada de baja"* |
| Token JWT expirado | `401 JWT expired` | *"Tu sesión ha finalizado. Por favor, volvé a ingresar"* |
| Falta de campos | `400 Validation failed: title is empty` | *"Por favor, completá todos los campos obligatorios marcados en el formulario"* |
| Falla del backend | `500 Internal Server Error` | *"Ocurrió un problema en nuestros servidores. Por favor, intentá nuevamente en unos minutos"* |

---

## 8. Planificación Sprint por Sprint y Preparación para el Futuro

### Sprint 1: Cimientos de la Aplicación
* **Objetivo:** Tener el esqueleto navegable, estilos temáticos de mascotas unificados (colores tierra, verdes y naranjas cálidos, tipografía cuidada), formularios de login y registro totalmente validados y encriptación de contraseñas.
* **Datos de prueba:** Dejar precargados dos botones en `/login`: "Ingresar como Usuario" y "Ingresar como Administrador" para agilizar la prueba docente.

### Sprint 2: Publicaciones y Perfil
* **Objetivo:** Feed principal con paginación tradicional (5 por página) y selector para alternar entre orden cronológico y por cantidad de "Me gusta".
* **Componente clave:** `PublicacionCardComponent` con `@Input()` y `@Output()`.
* **Mi Perfil:** Visualización de avatar, bio, botón modal "Editar Perfil" y listado de las últimas 3 publicaciones con sus comentarios asociados.

### Sprint 3: Detalle, Comentarios y Reloj de Sesión
* **Objetivo:** Vista en detalle (`/publicaciones/:id`) con comentarios paginados (3 iniciales + botón "Cargar más"). Edición de comentarios propios con marca "editado: true".
* **Sesión:** Pantalla `Cargando` con delay de 3.5 segundos y spinner. Contador que a los 45s (configurable) dispara el modal de advertencia para extender la sesión antes del error 401.

### Sprint 4: Administración, Métricas, PWA, Pipes y Directivas
* **Objetivo:** Panel admin con ABM de usuarios (alta con selector de rol, deshabilitar y eliminación definitiva). Dashboard con 3 gráficos de diferente tipo (barras, dona y líneas) con selectores de fecha `desde` y `hasta`.
* **Cierre de entrega:** Service Worker para PWA, las 3 Pipes y las 3 Directivas propias operativas.

---

### Preparación para Instancias Posteriores (Sprint 5 y 6) sin sobreescribir código

Para no reescribir la base si se va a recuperatorio o final, la arquitectura deja listos estos puntos de extensión:
1. **Scroll Infinito (Sprint 5):** Como el endpoint `/publicaciones` recibe `offset` y `limit`, el frontend solo debe reemplazar el paginador tradicional por un `IntersectionObserver` que incremente el `offset` y concatene el array sin tocar el backend.
2. **Métricas Adicionales (Sprint 5):** El controller de estadísticas tiene espacio para agregar nuevos métodos de agregación en MongoDB (`loginsPorUsuario`, `visitasPerfil`, `meGustaPorDia`).
3. **Guardados y Compartidos (Sprint 6):** El schema de `Usuario` puede recibir a futuro arrays `publicacionesGuardadas: [ObjectId]` y `publicacionesCompartidas: [{ publicacionId, compartidoPor }]` sin alterar las colecciones principales.

---

## 9. Convenciones de Código y Guía para la Defensa Oral

### 9.1 Nomenclatura
* **Archivos:** En kebab-case y español descriptivo (`publicacion-card.component.ts`, `usuario.schema.ts`, `jwt-auth.guard.ts`).
* **Endpoints:** En español y plurales para colecciones (`/publicaciones`, `/usuarios`, `/comentarios`, `/estadisticas`).
* **Rutas compuestas:** Kebab-case (`/usuarios/:id/deshabilitar`, `/autenticacion/refrescar`).

### 9.2 Respuestas de Error Estandarizadas (Filtro Global)

```json
{
  "codigo": 400,
  "mensaje": "El título de la publicación es obligatorio",
  "error": "Bad Request",
  "fecha": "2026-10-21T18:30:00.000Z"
}
```

### 9.3 Preguntas Clave para Defender en el Coloquio Oral

1. **¿Por qué no crearon un `ComentariosModule` separado?**  
   *Respuesta:* "Porque un comentario en nuestra red social no existe de forma autónoma: no tiene sentido sin una publicación. Al poner el `ComentariosController` dentro del `PublicacionesModule`, respetamos los 3 módulos que pidió la cátedra, evitamos dependencias circulares y mantenemos cohesionado el dominio de publicaciones."

2. **¿Por qué la tarjeta de publicación usa `@Input` y `@Output` en lugar de inyectar directamente el servicio?**  
   *Respuesta:* "Para desacoplar la interfaz de la lógica de datos. La tarjeta es un componente presentacional ('tonto'); recibe lo que tiene que mostrar y avisa a su padre cuando el usuario hace clic. Así podemos reutilizar exactamente la misma tarjeta en el Feed general, en el detalle o en el perfil de usuario sin duplicar código."

3. **¿Cómo garantizan que un usuario no borre las publicaciones de otro?**  
   *Respuesta:* "Validamos la identidad en el backend a través del JWT con el `JwtAuthGuard`. El servicio verifica que el `autor.id` de la publicación coincida con el `sub` del token, o bien que el token tenga el perfil `administrador`. Si no coincide, devolvemos un código HTTP 403 Forbidden."

4. **¿Cómo se diferencian un usuario deshabilitado y uno dado de baja?**  
   *Respuesta:* "Manejamos dos campos booleanos independientes en la base de datos: `deshabilitado` (bloqueo temporal reversible por switch del admin) y `eliminado` (baja lógica definitiva). De esa forma, en el login emitimos el mensaje exacto exigido por la consigna para cada caso."