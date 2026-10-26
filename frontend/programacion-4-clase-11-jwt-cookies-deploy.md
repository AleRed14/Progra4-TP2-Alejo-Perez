# Programación 4 – Clase 11 (21/10/2026)
## Autenticación con JWT, hash de contraseñas, Guards, Cookies y deploy en Vercel

> [!NOTE]
> **Contexto de la clase:** se implementa en NestJS todo lo necesario para el **Sprint 1 del TP2** (registro, login y sesión): **hash de contraseñas**, generación y validación de **JSON Web Tokens (JWT)**, protección de rutas con **Guards**, envío del token por **header** o por **cookie**. En la segunda parte, el ayudante (Juan Pablo) mostró el **deploy del back (Nest) y del front (Angular) en Vercel**. Después de un recreo se pasó a las correcciones de entregas.

> [!WARNING]
> **Sobre la fiabilidad de estos apuntes:** el audio de esta clase tiene varias partes poco claras (nombres de paquetes, de opciones de configuración y del nombre de las variables de entorno). Donde no se entiende con certeza lo marqué con una nota. El código está **reconstruido a partir de lo explicado**; el docente aclaró que subirá **el proyecto completo, la documentación y la grabación** al campus: usá esos materiales como referencia final.

---

## ✅ Checklist: qué tenés que dominar después de esta clase

- [ ] Explicar qué es un **JWT**, sus **tres partes** y qué datos conviene (y cuáles nunca) guardar en el payload.
- [ ] Explicar por qué la **clave secreta** va en el `.env` y qué hace.
- [ ] Instalar y configurar `@nestjs/jwt` (`JwtModule`, secreto global y tiempo de expiración).
- [ ] **Hashear** la contraseña al registrar y **verificarla** al hacer login (sin guardarla nunca en texto plano).
- [ ] Diferenciar **contraseña hasheada** de **token**: son dos cosas distintas.
- [ ] Armar el **payload** y generar el token con `signAsync`.
- [ ] Crear un **Guard** (`CanActivate`) que extraiga el token, lo verifique y devuelva `401` si falta o es inválido/vencido.
- [ ] Proteger rutas con `@UseGuards(...)`.
- [ ] Enviar el token en el header `Authorization: Bearer <token>` (y probarlo en Postman).
- [ ] Alternativa: enviar el token por **cookie** (`cookie-parser`, `res.cookie`, `httpOnly`, `secure`, `sameSite`, expiración).
- [ ] Habilitar **CORS** y hacer el **deploy** de Nest y Angular en Vercel (monorepo con carpetas `backend` y `frontend`).
- [ ] Usar **environments de Angular** para distinguir desarrollo y producción.

---

# 0. Avisos iniciales

<details>
<summary>📌 Formularios de entrega y prioridades (desplegar)</summary>

- La clase de la semana anterior ya está subida (se confirmó que el video está disponible).
- Hay **dos formularios de entrega**: uno para el **TP2** y otro para el **TP1**. Ambos quedaron habilitados.
- Quien tenga que **recuperar el TP1** puede entregar con el formulario del TP1.
- **Prioridad en estas clases: el TP2.** Si sobra tiempo, se ven los recuperatorios del TP1; si no, se verán en la clase previa al recuperatorio. La razón: los alumnos que aprobaron tienen derecho a corregir su TP2 primero.
- Agenda de la clase: (1) autenticación con JWT y cookies, (2) deploy con Vercel (front y back), (3) correcciones.

</details>

---

# 1. ¿Qué es un JSON Web Token (JWT)?

> [!NOTE]
> Un **JSON Web Token** es un **string alfanumérico largo dividido en tres partes** que contiene **datos de la sesión de un usuario**. Se genera cuando el usuario **inicia sesión** y sirve para identificarlo en las siguientes peticiones. Los datos viajan **encriptados/firmados** con una **clave secreta** que solo conoce el servidor (la API).

### 1.1 Las tres partes del token

| Parte | Qué contiene |
|---|---|
| **Header (cabecera)** | Metadatos del token: el **algoritmo** de firma (por ejemplo `HS256`) y el **tipo** (`JWT`). |
| **Payload (carga útil)** | Los **datos** (llamados *claims*): del usuario o de la sesión. Puede llevar cualquier cosa que nosotros definamos. |
| **Firma (signature)** | Parte de **verificación** generada con la **clave secreta**. *(El docente no recordaba con exactitud esta tercera parte y dijo que la confirmaría; en general es la firma que permite comprobar que el token no fue alterado.)* |

> [!TIP]
> Para ver un token "por dentro" se usó una página web que **decodifica JWT** (muestra header, payload y la zona de la clave).

### 1.2 Claims típicos del payload

| Claim | Significado |
|---|---|
| `sub` (*subject*) | Hace referencia al **usuario**; por lo general es el **ID del usuario**. |
| `name`, rol, `admin`... | Datos opcionales que nosotros decidimos incluir (por ejemplo el **rol**). |
| `iat` (*issued at*) | **Fecha de creación** del token. |
| `exp` | **Fecha de expiración**. |
| `aud` (*audience*) | **Para qué aplicación** fue hecho (suele ir el nombre de la API). |

> [!WARNING]
> **Nunca guardar la contraseña del usuario dentro del token.** Es la regla que el docente remarcó: el payload viaja con el token, así que solo van datos que no comprometan al usuario (ID, mail, rol...).

### 1.3 Para qué sirve la clave secreta

- La **misma clave** se usa para **generar** el token y para **verificarlo/leerlo** después.
- Se guarda **solo en el servidor**, de forma secreta.
- Con ella la API puede: saber si el token **es válido**, si **expiró**, si corresponde a un usuario válido y **obtener los datos** que viajan dentro (por ejemplo el ID).

> [!TIP]
> En el ejemplo se usó literalmente "clave super secreta" como valor. El docente aclaró que **es solo para la demo**: en la práctica conviene poner algo más discreto y más seguro.

---

# 2. Preparación del proyecto

El docente llevó la aplicación ya armada para ahorrar tiempo y fue explicando pieza por pieza. Lo que tenía:

- Conexión a **MongoDB** (clase anterior), `ConfigModule` y variables de entorno.
- Un **módulo de autenticación** (`AuthModule`) con su servicio y su controller.
- La **entidad usuario** con `nombre`, `email` y `password`, el esquema (`SchemaFactory`) y el tipo `HydratedDocument` (visto en la clase 10: transforma la clase en un documento de Mongo, agregando el `_id` y métodos como `save` o `update`).
- DTOs: `CreateUsuarioDto`, `UpdateUsuarioDto` y un **DTO de autenticación** (email + password) que recibe el login.
- Flujo a implementar: **registro** (guarda el usuario con la contraseña hasheada) → **login** (genera un JWT).

### 2.1 Librerías que se instalan

| Paquete | Para qué |
|---|---|
| `@nestjs/jwt` | Generar y verificar JWT (no viene por defecto en Nest). |
| `@nestjs/config` | Manejar el archivo `.env` (clase 10). |
| `@nestjs/mongoose` + `mongoose` | Base de datos (clase 10). |
| `class-validator` + `class-transformer` | Validación de DTOs (clase 9). |
| Paquete de hash de contraseñas (se llamó "nest authentication") | Servicio `PasswordHasher` con `hash` y `verify`. Ver sección 3. |
| `cookie-parser` + `@types/cookie-parser` | Leer cookies del request (sección 6). |

> [!WARNING]
> **Nombre del paquete de hash:** en la grabación se escucha "nestauthentication" y no queda claro el nombre exacto del paquete ni su ruta de importación. El docente pasó el comando de instalación **por el chat** (y dijo que estará documentado en el campus). **Usá ese comando**; no lo adivines. Aclaró que **no es obligatorio usar esta librería**: se puede usar `crypto` u otra equivalente.

### 2.2 La clave secreta en el `.env`

```env
# nombre de la variable a elección; el valor es solo de ejemplo
JWT_SECRET=clave-super-secreta
```

- Va en el **`.env`** para que **no quede expuesta**, **no se suba a GitHub** y se pueda tener **una clave distinta por ambiente**.
- Para leer el `.env` hace falta `ConfigModule` en el `AppModule` (clase 10).

> [!NOTE]
> En el `AuthModule` el docente volvió a importar `ConfigModule` "por superstición": probablemente **no hace falta** porque ya está en el `AppModule`; invitó a probar sin él.

---

# 3. Configurar `JwtModule` y el hash de contraseñas

### 3.1 `JwtModule` en el módulo de autenticación

```typescript
@Module({
  imports: [
    JwtModule.register({
      global: true,                              // disponible para toda la aplicación (obligatorio)
      secret: process.env.JWT_SECRET,            // la clave del .env
      signOptions: { expiresIn: '20s' },         // tiempo de vida del token
    }),
    // ... MongooseModule.forFeature([...]) con el esquema de usuario
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

- **`global: true`** es lo que **sí o sí** hay que configurar; si no, no funciona para el resto de la app.
- Desde que se registra el módulo, **cada vez que se use el servicio de JWT** (crear o verificar) se tiene en cuenta **el secreto** configurado: no hay que pasarlo de nuevo.
- **Expiración:** el docente puso **20 segundos para la demo**; puede ser un minuto, una hora, un año: depende de la aplicación.

> [!TIP]
> El PDF del TP dice **15 minutos**, pero para **testear** conviene usar valores de **20–30 segundos** y así comprobar que el token vence, que salta el cartel de "sesión por expirar" y que se puede refrescar.

### 3.2 Servicio de hash (`PasswordHasher`)

```typescript
constructor(
  private readonly passwordHasher: PasswordHasher,   // viene de la librería de hash
  private readonly jwtService: JwtService,           // viene de @nestjs/jwt
  @InjectModel(Usuario.name) private readonly usuarioModel: Model<UsuarioDocument>,
) {}
```

El servicio ofrece **dos métodos** (según lo explicado):

| Método | Qué hace |
|---|---|
| `hash(password)` | Recibe la contraseña **sin hashear** y devuelve el **hash** (un string con "un montón de cosas"). |
| `verify(passwordPlano, passwordHasheado)` | Recibe primero la contraseña **sin hashear** y después la **hasheada** guardada; devuelve si **coinciden** (verdadero/falso). Es asíncrono (`await`). |

> [!WARNING]
> **Comportamiento por defecto de esa librería:** al importarla/configurarla, por defecto **bloquea todas las rutas** de los controllers (devuelve `401`), salvo las que se marquen como **públicas** con un decorador `@Public()`. El docente explicó dos salidas: (a) marcar cada ruta pública con `@Public()`, o (b) configurar **globalmente** la opción para que **todas las rutas sean públicas por defecto** (se la deja en `false`), ya que en este curso **solo se usa para hashear** y la protección de rutas se hace con **nuestro propio Guard**. En clase se confundió un poco al explicarlo; el detalle exacto de la opción está en el código que se subirá.

> [!NOTE]
> **Rutas públicas:** el **registro** y el **login** son rutas públicas (no necesito sesión para registrarme ni para iniciar sesión).

---

# 4. Registro y login

### 4.1 Registro

```typescript
async register(createUsuarioDto: CreateUsuarioDto) {
  // 1) hashear la contraseña que ingresó el usuario
  const passwordHasheada = await this.passwordHasher.hash(createUsuarioDto.password);

  // 2) guardarla ya hasheada en la base de datos
  const usuario = await this.usuarioModel.create({
    ...createUsuarioDto,
    password: passwordHasheada,
  });

  return usuario; // o un "registrado: true"; ver nota
}
```

- Nunca se va a ver la contraseña real del usuario en la base: queda **hasheada**.
- Opcionalmente, el hash también podría hacerse del lado del front (es una opción), pero acá se guarda hasheada en la base.

> [!TIP]
> **¿El registro genera un token?** No siempre. El **token se genera cuando se inicia sesión**, no al registrarse. Dependiendo de cómo se diseñe la app, el registro puede devolver algo como `registrado: true` y mandar al usuario al login (a veces, además, hay que validar el mail o esperar una confirmación). Ustedes eligen según el TP.

<details>
<summary>🙋 Duda de alumno: "¿cómo evito registrar un mail que ya existe?" (desplegar)</summary>

El docente respondió que **sí se puede validar desde Mongo**: se puede configurar un campo del esquema como **único** (`unique`), de modo que si ya existe ese mail, **la creación devuelve un error** de que ya existe. Se puede usar en el TP. *(No mostró la sintaxis exacta en el audio; en Mongoose se declara en el `@Prop` del campo.)* La alternativa es hacer previamente una búsqueda por mail y lanzar un error si existe.

</details>

### 4.2 Login

```typescript
async login(authDto: AuthDto) {
  // 1) buscar al usuario en la base
  const usuario = await this.usuarioModel.findOne({ email: authDto.email });

  // 2) comparar contraseñas
  const ok = usuario && await this.passwordHasher.verify(authDto.password, usuario.password);

  // 3) credenciales incorrectas -> excepción 401
  if (!ok) throw new UnauthorizedException('Las credenciales no son correctas');

  // 4) todo bien -> generar token
  return this.generarToken(usuario);
}
```

- Si el usuario **no se encontró** o la contraseña **no coincide**, se devuelve el error de **credenciales incorrectas** (excepción `401` es perfectamente válida).
- Si todo sale bien, se genera el token.

### 4.3 Generar el token

```typescript
private async generarToken(usuario: UsuarioDocument) {
  const payload = { email: usuario.email, id: usuario._id };   // por ahora solo mail e id
  return this.jwtService.signAsync(payload);                   // devuelve el token (string)
}
```

- El payload lleva **mail e ID** del usuario; ustedes pueden agregar el **rol** u otros datos.
- No hace falta poner la fecha de expiración en el payload: **ya se configura al registrar el módulo** (`expiresIn`).
- `signAsync` devuelve una **promesa**; se puede usar con `await` o devolverla directamente.

### 4.4 Obtener el perfil

Método sencillo: busca al usuario **por ID** y lo devuelve si existe. Es la **ruta protegida** que se usa para la demo.

<details>
<summary>🙋 Duda de alumno: "¿qué diferencia hay entre `forRoot` y `forFeature` de Mongoose?" (desplegar)</summary>

- **`MongooseModule.forRoot(connectionString)`** en el `AppModule`: es la **conexión con Mongo** (por eso recibe el connection string).
- **`MongooseModule.forFeature([...])`** en **cada módulo que lo necesite**: ahí se pasan **los esquemas que se usan en ese módulo**.

</details>

<details>
<summary>🙋 Dudas de alumnos sobre el hash (desplegar)</summary>

**1) "Si el password ya está hasheado, ¿cómo verifica que sea el mismo?"**
Se usa el método `verify`: recibe la contraseña **sin hashear** primero y la **hasheada** después; **internamente** la compara y devuelve si son iguales o no. Es lo único que importa para el login.

**2) "¿Una vez hasheada la contraseña la tengo que usar en otro lado?"**
No. Queda guardada hasheada; solo se usa `verify` en el login. Y **no hay que confundir la contraseña hasheada con el token**: son cosas diferentes (el token tiene información del usuario; la contraseña se hashea aparte).

**3) Un compañero comentó** que, según lo que investigó, estos sistemas **hashean la contraseña nueva del login y la comparan con el hash guardado**. El docente reconoció que **no sabía con certeza qué hace internamente** la librería, pero que el método le dice si son iguales y eso es lo que le importa.

> [!NOTE]
> **Complemento (no dicho en clase):** los algoritmos de hash modernos para contraseñas usan un *salt* guardado dentro del propio hash; por eso `verify` vuelve a calcular el hash de la contraseña ingresada con ese salt y compara el resultado. El hash **no se "deshace"**.

</details>

---

# 5. Proteger rutas con un Guard (token en el header)

### 5.1 ¿Cómo llega el token al servidor?

Hay tres formas habituales de que el cliente envíe el token:

| Forma | Detalle |
|---|---|
| **Header `Authorization`** | Se envía con el esquema **Bearer**: `Authorization: Bearer <token>`. |
| **Cookie** | El navegador la guarda y la envía solo (ver sección 6). |
| **Local storage (del lado cliente)** | El front guarda el token y lo incorpora al header en cada petición. |

> [!NOTE]
> **Formato Bearer:** primero se escribe la palabra **`Bearer`**, un **espacio** y después el token. Por eso, para quedarnos solo con el token, se hace un **`split(' ')`** y se toma el **índice 1** del arreglo.

> [!TIP]
> **En Postman:** pestaña **Authorization** → tipo **Bearer Token** → pegar el token que devolvió el login. **Ojo: usar *Bearer*, no *Basic*.**

### 5.2 Crear el Guard

Igual que en Angular, solo cambia el prefijo del CLI:

```bash
nest g guard guards/auth
```

> [!NOTE]
> **Diferencias con los guards de Angular:** en Nest los guards son **clases** (no funciones) que **implementan la interfaz `CanActivate`**. Es la única que tiene sentido usar acá, porque no hay vista ni rutas hijas. Recibe un **contexto** (`ExecutionContext`) con **todo lo que viene en la petición** (headers, body, ruta, IP, etc.), ya sea HTTP o de otro tipo.

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1) extraer el token
    const token = this.extraerTokenDelHeader(context);
    if (!token) throw new UnauthorizedException();              // 401 si no hay token

    try {
      // 2) verificar (valida firma + vigencia) y obtener el payload
      const payload = await this.jwtService.verifyAsync(token);
      console.log(payload);
      // 3) dejar los datos disponibles para quien los necesite
      context.switchToHttp().getRequest()['usuario'] = payload;
    } catch {
      throw new UnauthorizedException();                        // 401 si es inválido o venció
    }
    return true;
  }

  private extraerTokenDelHeader(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();        // contexto -> contexto HTTP -> request
    const [tipo, token] = request.headers['authorization']?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}
```

**Pasos que hace el guard:**
1. **Extrae el token** del contexto (header `authorization`; el docente preparó un segundo método para cookies).
2. Si **no existe** → excepción **`401`** (*Unauthorized*).
3. Lo **verifica** con `verify` del servicio JWT: que sea **válido** (firmado con la misma clave) y que **no esté vencido**. **Todo lo hace el mismo método**; no hay que llamar a otros.
4. Si es inválido o venció → **`401`**.
5. Si es válido, se **transforma en los datos** (payload) y se los **pasa al contexto/request** para que lo use cualquier otro.

<details>
<summary>🙋 Dudas de alumnos sobre el Guard (desplegar)</summary>

- **"¿De dónde viene el contexto que le paso a `extractToken`?"** → Viene del propio `canActivate(context)`. Es un parámetro que Nest entrega con toda la información de la petición que está llamando a esa ruta.
- **"¿Esto funciona como un middleware?"** → Parecido, pero no es exactamente un middleware: hay otra herramienta que funciona como middleware en sentido estricto, y se verá en otra clase.
- **"¿Quién valida si el token está expirado?"** → El **`verify` del servicio JWT** en el guard. También valida que esté firmado con el **mismo secreto** configurado al registrar el módulo.

</details>

### 5.3 Aplicar el Guard a una ruta

```typescript
@UseGuards(AuthGuard)
@Get('perfil')
obtenerPerfil(@Req() request) {
  return this.authService.obtenerPerfil(request.usuario.id);
}
```

- El decorador **`@UseGuards()`** recibe el guard que creamos; a partir de ahí la ruta queda **protegida** y hay que **pasar el guard** para acceder (igual que en Angular).

### 5.4 Demostración en vivo

1. `POST /auth/login` con mail y contraseña de un usuario existente → devuelve el **token**.
2. `GET /auth/perfil` con **Authorization → Bearer Token** (el token pegado) → devuelve el **perfil** del usuario.
3. Se esperaron **20 segundos** → la misma petición devuelve **`401 Unauthorized`**: el **token venció**.
4. En la consola se vio que el token llega con la palabra **Bearer** adelante.
5. En Mongo se comprobó que las contraseñas están **hasheadas** (el primer usuario, creado antes del hash, estaba en texto plano).

> [!TIP]
> Con tokens de solo 20 segundos hay que ser rápido: se dejó **preparado el login en Postman** para obtener el token, cargarlo y probar la ruta antes de que venza.

> [!NOTE]
> **Del lado del front**, el token puede guardarse en **`localStorage`** (o en otro lado) y **debe incluirse en el header `Authorization` en cada petición**; la API lo valida y deja pasar o devuelve error. Ese manejo en Angular (y los **interceptores**) lo van a ver en una clase próxima.

---

# 6. Token por Cookie (alternativa)

> [!NOTE]
> Las **cookies** son datos que **maneja el navegador**: el servidor se las entrega y el navegador **las guarda y las envía automáticamente** en cada petición, sin que el código del cliente tenga que adjuntar nada. A nivel **seguridad es mejor** (no queda expuesto como en `localStorage`) y para el cliente es **más cómodo** (no hay que buscar el token en `localStorage` ni armar el header).

### 6.1 Comparación

| | **Header (`Authorization: Bearer`)** | **Cookie** |
|---|---|---|
| ¿Quién guarda el token? | El front (p. ej. `localStorage`) | El **navegador** |
| ¿Quién lo adjunta en cada petición? | El front, **a mano** (o con interceptor) | El **navegador, automáticamente** |
| Seguridad | Menor (expuesto del lado del cliente) | **Mayor**, con opciones de protección |
| Trabajo del cliente | Debe buscarlo, incorporarlo al header y enviarlo | Prácticamente ninguno |
| ¿Se permite en el TP? | Sí | Sí: **se pueden usar ambas** |

### 6.2 Pasos

**① Instalar** `cookie-parser` y sus tipos `@types/cookie-parser` (comandos por el chat).

> [!NOTE]
> **`cookie-parser`** es una especie de *middleware* que **agrega propiedades al `request`** para poder **leer las cookies** del navegador; los tipos permiten manejar el objeto tipado. *(Para que `request.cookies` exista hay que registrarlo en el `main.ts` con `app.use(cookieParser())`; en el audio no se muestra este paso, pero es el uso estándar.)*

**② Método para setear la cookie** (en el servicio de autenticación):

```typescript
setCookie(response: Response, token: string) {
  response.cookie('token', token, {
    httpOnly: true,       // el navegador no la expone a JavaScript (protege contra ataques XSS)
    secure: false,        // true en producción (HTTPS); false en localhost
    sameSite: 'strict',   // protege contra ataques entre sitios (CSRF / phishing)
    maxAge: 20 * 1000,    // misma duración que el token (20 s en la demo)
  });
}
```

| Opción | Para qué |
|---|---|
| Nombre (`'token'`) | Nombre de la cookie. |
| `httpOnly` | Evita ciertos ataques (tipo XSS). |
| `sameSite` | Evita ataques tipo *phishing* / entre sitios. |
| `secure` | Solo permite el protocolo seguro (**HTTPS**). **En producción `true`**; **en localhost `false`**, porque localhost no es una dirección segura y no funcionaría. |
| Expiración (`maxAge`) | La cookie, igual que el token, tiene tiempo de vida; en la demo se igualó al del token. |

*(El docente no recordó con exactitud a qué tipo de ataque apunta cada opción; las asociaciones indicadas son las usuales.)*

**③ Cambiar el guard para leer la cookie** en vez del header: el método de extracción **va a `request.cookies['token']`** en lugar de `request.headers`. Si no está, se devuelve el error.

**④ En el controller**, cuando el **login y el registro sean exitosos**, llamar al método que setea la cookie (se inyecta la respuesta del servidor) para **incluir la cookie en la respuesta** y que el navegador la tome.

### 6.3 Demostración en vivo

- Se hizo el login en Postman (sin tocar la pestaña Authorization): la respuesta incluyó la cookie y **Postman la guardó** como lo haría un navegador (aparece en la sección *Cookies*).
- Se llamó a la ruta protegida **sin setear nada** y **funcionó**: el cliente envió la cookie automáticamente.

<details>
<summary>🙋 Duda de alumno: "¿entonces cuál es la mejor forma, header o cookie?" (desplegar)</summary>

El docente aclaró que **no hay una única "mejor"**: se puede hacer por **cookies, por header o por los dos**. La cookie tiene **más opciones de seguridad** y por eso **parece más segura**; además, con header **hay que hacer todo el traspaso del token del lado del cliente** (buscarlo en `localStorage`, incorporarlo al header y enviarlo desde Angular). En una próxima clase intentará mostrar **un ejemplo del lado del cliente** y los **interceptores** (aunque no sabe si harán falta para el TP).

</details>

---

# 7. Deploy en Vercel (Nest + Angular)

> [!NOTE]
> **Vercel** es la plataforma elegida para el despliegue. Se puede usar otra (Firebase como en el TP1), pero tener **ambos proyectos en la misma plataforma** resulta más cómodo. Se crea la cuenta e **inicia sesión con GitHub**.

### 7.1 Preparar el proyecto

<details>
<summary>📁 Estructura del repositorio (un solo repo, dos carpetas) (desplegar)</summary>

- Debe haber **una sola carpeta (el TP)** con **dos proyectos adentro**: **`backend`** (Nest) y **`frontend`** (Angular), y **un único repositorio de GitHub**.
- Cuando se crea un proyecto Nest o Angular, **cada uno crea su propia carpeta `.git`**: hay que **eliminarlas y hacer un solo `git init` en la carpeta raíz**, para tener un único repo con los dos proyectos; si no, **causa conflictos**.
- En un trabajo profesional lo normal sería **un repo para el front y otro para el back**; acá se junta solo **por organización** (es más fácil compartir un solo repo con el grupo).

</details>

### 7.2 Cambios en el `main.ts` de Nest

1. **Quitar el `await` del `bootstrap`** (en el audio se entiende que si tienen un `await` en esa parte del `main.ts` hay que sacarlo; **confirmalo con el código que suba el docente**).
2. **Habilitar CORS:**

```typescript
const app = await NestFactory.create(AppModule);
app.enableCors();       // habilita CORS
await app.listen(3000);
```

> [!NOTE]
> **CORS** es una medida de seguridad **del navegador**: **no protege al servidor, protege al usuario** que usa el navegador (por los datos que se manejan). Hay que habilitarlo para que el front (en otro dominio) pueda llamar a la API.

### 7.3 Deploy del back (Nest)

1. En Vercel: **Add New → Project → Import Git Repository** → *GitHub*.
2. Si no aparece ningún repositorio, hay que **instalar/dar permisos de la aplicación de Vercel en tu GitHub** (botón abajo a la izquierda en la pantalla de permisos). Se puede limitar el acceso a los repos que se quieran usar.
3. **Antes de importar, hay que haber hecho `push`** del proyecto: Vercel lee el código directamente de GitHub (un repo vacío no sirve).
4. Configurar:
   - **Root Directory:** la carpeta del back (`backend`).
   - **Application Preset:** **`NestJS`** (en lugar de Vite, que viene por defecto).
   - **Environment Variables:** pegar el contenido del `.env` (si se pega completo, **separa automáticamente** nombre y valor). Incluye el **connection string de Mongo** y el secreto del JWT.
5. **Deploy** y esperar unos segundos. Vercel da un **dominio** público.

<details>
<summary>🛠️ Si te equivocaste de carpeta (desplegar)</summary>

Se puede corregir después del deploy: **tres puntos → Settings → Build and Deployments → Root Directory**, se pone la carpeta correcta (`backend`) y **Save**. Si no funciona, "es más fácil crearlo de nuevo".

</details>

> [!TIP]
> **Verificación en vivo:** se tomó la URL del deploy, se la usó en Postman en lugar de `localhost:3000`, se creó un usuario y apareció en la base: la API desplegada funciona.

<details>
<summary>🙋 Dudas de alumnos sobre Vercel (desplegar)</summary>

- **"¿Funciona como Render?"** → El ayudante no usó Render. Señaló que en Vercel **no hay que activarlo a mano**: funciona como una **función serverless**: cuando llega una consulta se ejecuta el servidor, **queda latente unos segundos** y si no hay más consultas se apaga (por optimización); en la siguiente consulta **vuelve a encenderse**.
- **Actualización automática:** cada **push a GitHub** genera un **deploy automático** (instala dependencias, hace el `build` y publica).
- **"¿Hay que sacar la carpeta `dist` del `.gitignore`?"** → **No**, déjenla: `dist` en el `.gitignore` es para que no se suba a GitHub, y no hace falta. **Vercel construye la aplicación él mismo** (`ng build` / `nest build`) y sube ese resultado. En el log del deploy se ve el `npm install`, el build y la búsqueda de la carpeta `dist`, que es donde Angular y Nest generan los archivos por defecto.

</details>

### 7.4 Environments en Angular (desarrollo vs. producción)

```bash
ng generate environments
```

- Crea **dos archivos de environment** (desarrollo y producción) y modifica la configuración de Angular para distinguirlos. En versiones recientes **el proyecto vacío ya no los trae**, por eso hay que generarlos.
- **Diferencia con los `.env` de Nest:** estos **no quedan ocultos** (se ven en el código del front); sirven para **distinguir variables entre modo desarrollo y producción**.
- `ng serve` usa la configuración de **development**; `ng build` / deploy usa la de **producción**.

Ejemplo del docente (dos variables en cada archivo):

| Variable | Desarrollo | Producción |
|---|---|---|
| Mensaje | "Estoy en modo local" | "Estoy en producción" |
| `apiUrl` | `http://localhost:3000` | **URL del back desplegado en Vercel** |

> [!WARNING]
> **Antes de desplegar el front:** copiar la **URL del servidor desplegado** y pegarla en el **environment de producción** (`apiUrl`), porque ya **no estamos en localhost**. Después hacer `push`.

> [!TIP]
> Es **opcional** tener los dos environments (se podría usar solo producción), pero es mejor para **probar en local antes de pasar a producción**: en local, el front apunta a `localhost:3000`, por lo que **hay que tener el Nest local levantado**.

### 7.5 Deploy del front (Angular)

1. **Add New → Project**, mismo repo, pero ahora **Root Directory:** carpeta del front (`frontend`).
2. **Application Preset:** **Angular**.
3. **Build and Output Settings → Output Directory:** hay que cambiarlo. Tras un `ng build`, Angular genera `dist/<nombre-del-proyecto>/browser`, así que se pone **`dist/<nombre-del-proyecto>/browser`** (en la demo: `dist/frontend/browser`).

> [!WARNING]
> **Error común:** dejar el *Output Directory* como `dist` a secas. Hay que fijarse **dónde se crea realmente la carpeta con `ng build`**: dentro de `dist` hay una carpeta con **el nombre de tu proyecto** y, adentro, otra llamada **`browser`**. Si tu proyecto no se llama `frontend`, usá **tu** nombre.

4. No se toca nada más y se hace **Deploy** (suele tardar un poco más que el de Nest).
5. Al abrir la URL se vio "estoy en producción" (usó el environment de producción) y la lista de usuarios (creada/eliminada desde el front) se reflejó en la API desplegada.

<details>
<summary>🙋 Duda de alumno: "¿por qué se despliegan como dos proyectos separados en Vercel?" (desplegar)</summary>

Porque son **dos aplicaciones independientes** con **dos frameworks distintos**: una es de **Nest** y otra de **Angular**; el deploy de cada una usa **su propio comando de build** (`nest build` / `ng build`) y cada una **funciona por sí sola** y vive en un lugar distinto. Por eso al crear cada proyecto en Vercel hay que **elegir el preset correcto** (Nest o Angular): de eso depende lo que va a desplegar. Que estén en el mismo repo es solo por organización.

</details>

---

# 8. Cierre y correcciones

- El docente subirá **el proyecto de la clase, la documentación en el campus y la grabación**.
- Se hizo un **recreo de 10 minutos** y luego se comenzaron las **correcciones** de entregas; quienes iban a entregar debían quedarse y se habilitó la **asistencia**.
- Un alumno consultó a Juan Pablo por problemas con el deploy del front (había sacado el `await` del bootstrap de Nest y tenía problemas con el front); se resolvió en una charla aparte.

---

# 9. Resumen rápido

| Tema | Idea clave |
|---|---|
| JWT | String de 3 partes (header, payload, firma); lleva datos de sesión, **nunca contraseñas**. |
| Clave secreta | En `.env`; la misma sirve para firmar y verificar. |
| Expiración | Configurada en `JwtModule` (`expiresIn`); en pruebas, 20–30 segundos. |
| Hash | `hash` al registrar, `verify` al hacer login; contraseña ≠ token. |
| Login | Buscar usuario → `verify` → si falla `401` → si ok, `signAsync(payload)`. |
| Guard | Clase `CanActivate`: extrae token, `verifyAsync`, `401` si falta/vence; se aplica con `@UseGuards`. |
| Header | `Authorization: Bearer <token>`; `split(' ')[1]`. |
| Cookie | `cookie-parser` + `res.cookie(...)`; `httpOnly`, `sameSite`, `secure` (false en local, true en producción). |
| CORS | `app.enableCors()` en `main.ts`. |
| Vercel back | Root `backend`, preset **NestJS**, variables de entorno del `.env`. |
| Vercel front | Root `frontend`, preset **Angular**, output `dist/<proyecto>/browser`. |
| Angular envs | `ng generate environments`; `apiUrl` de producción apunta al back desplegado. |
