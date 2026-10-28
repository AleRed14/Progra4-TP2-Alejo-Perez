# Programación 4 – Clase 9 (14/10/2026)
## Introducción al backend con NestJS: módulos, controllers, servicios, DTOs y validaciones

> [!NOTE]
> **Contexto de la clase:** primera clase de la segunda parte de la materia (backend). Se retoma lo visto en Angular (módulos, decoradores, pipes, inyección de dependencias) y se lo aplica en **NestJS**. Todo el contenido práctico se hizo en vivo con Visual Studio Code, la consola y Postman.

---

## ✅ Checklist: qué tenés que dominar después de esta clase

- [ ] Explicar qué es NestJS, sobre qué tecnologías se apoya (TypeScript, Node.js, Express) y en qué se parece a Angular.
- [ ] Distinguir las tres capas de una app Nest: **módulos, controllers y servicios (providers)**.
- [ ] Instalar el CLI de Nest y crear un proyecto con `nest new`.
- [ ] Reconocer la estructura de carpetas y el rol de `main.ts`, `app.module.ts` y `nest-cli.json`.
- [ ] Definir rutas con `@Controller()` y los decoradores de verbos HTTP (`@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`).
- [ ] Leer datos de la petición con `@Param()`, `@Query()`, `@Body()` y `@Req()`.
- [ ] Mantener los controllers "limpios" y poner toda la lógica en los servicios.
- [ ] Inyectar un servicio por constructor.
- [ ] Generar módulos, controllers y servicios con el CLI, y generar un CRUD completo con `nest g resource`.
- [ ] Explicar qué es un **DTO** y para qué sirve `PartialType`.
- [ ] Explicar por qué "lo que no está vinculado al `AppModule` no existe".
- [ ] Compartir un servicio entre módulos usando `imports` + `exports` (y saber por qué NO redeclararlo en `providers`).
- [ ] Evitar el error clásico de orden de rutas (rutas con `:id` al final).
- [ ] Validar parámetros con pipes (`ParseIntPipe`) y validar DTOs con `ValidationPipe` global + `class-validator`.
- [ ] Probar endpoints con Postman.

---

# 0. Aviso inicial: devolución del primer TP y recuperatorio

<details>
<summary>📌 Qué se dijo sobre el examen del primer TP y el recuperatorio (desplegar)</summary>

**Qué se evaluaba**
- Dos cosas separadas: (1) la **defensa del propio TP** y (2) los **conceptos teóricos** vistos en clase.
- Lo que el docente quiere ver no es que hayan escrito código (hoy el código pasa a segundo plano por las herramientas disponibles), sino que **ustedes estuvieron detrás del IDE**, auditando a los agentes de IA y **tomando las decisiones técnicas**: arquitectura, diseño, componente vs. monolito, usar *lazy loading* para mejorar performance, usar módulos por tal o cual razón, etc.

**Por qué les costó a muchos**
- De 60 alumnos, **40 llegaron al examen sin haber presentado nada antes**, sin devolución previa y sin conocer a fondo su propio trabajo ni los temas vistos.
- Quienes se presentaron durante la cursada pudieron **equivocarse, ser corregidos y llegar con la nota (o la aprobación "de palabra") ya encaminada**.

**Recuperatorio**
- Será en la **última semana de clases**; el docente pasará la fecha.
- Será básicamente **el mismo TP**, quizás con algún punto extra (nada extenso).
- Se puede ir presentando y corrigiendo en las clases siguientes, junto con el segundo TP (que se empieza a hablar desde la próxima clase), con la misma dinámica de preguntas y correcciones.
- Se espera que lleguen con todo sabido, preparado y practicado, sobre todo **su propio trabajo**: traer errores, dudas y preguntas del tipo *"Profe, me salió este error, ¿por qué? ¿cómo se puede mejorar?"*.
- **Todavía se puede promocionar**; es una segunda chance.

> [!TIP]
> La conclusión del docente: aprobar hoy no es más fácil por tener IA, es **más exigente**, porque se espera más criterio del estudiante. Conviene ir presentando avances en cada clase en lugar de caer de golpe el último día.

</details>

---

# 1. Estructura de la materia

La materia se divide en **dos partes**:

| Parte | Contenido | Tecnologías |
|---|---|---|
| **Parte 1** (ya terminada) | Desarrollo web **del lado del cliente** (front). Se usó Supabase como "back" para base de datos, etc. | Angular |
| **Parte 2** (empieza hoy) | Desarrollo del **panorama completo**: front + **back** | NestJS (back) + lo ya visto de front |

> [!TIP]
> **Requisito para esta segunda parte:** instalar **Postman** (se harán muchas peticiones). Usar preferentemente la **versión de escritorio**: la versión web no puede conectarse a `localhost`.

---

# 2. ¿Qué es NestJS?

> [!NOTE]
> **NestJS (Nest)** es un framework del lado del servidor, escrito con **TypeScript** (compatible con JavaScript "por herencia", ya que TypeScript es un metalenguaje/superset de JavaScript), que corre sobre el entorno de **Node.js** y se maneja con comandos de Node y el gestor de paquetes **npm**. Combina **programación orientada a objetos, programación funcional y programación reactiva funcional**.

> [!WARNING]
> Es **Nest** (con S), **no Next**. Next es otro framework que también sirve para desarrollo del lado del servidor, pero "viene del otro palo" (otro enfoque).

### 2.1 Relación con Express

- Nest funciona como una **"máscara" / capa superior sobre Express**: una versión mejorada de Express.
- Cuando llega una petición HTTP a nuestra API, **quien las administra por detrás es Express** (por defecto; también podría ser **Fastify**, que Nest soporta).
- Una capa más arriba está Nest, con TypeScript, orientación a objetos y todo lo que facilita el trabajo.

<details>
<summary>🔍 Mejoras de Nest respecto a Express (desplegar)</summary>

En Express:
- No se puede devolver "así como viene" cualquier valor: si devolvés un objeto hay que castearlo/serializarlo a JSON.
- Hay que armar la respuesta (status, etc.) a mano.

En Nest:
- **No hay que castear nada**: lo que devuelve el método del servicio/controller es lo que recibe el cliente.
- **Detección de errores y parseos** los maneja el framework.
- **No hace falta `try/catch`** para no romper la app (se puede usar igual si se quiere, pero no es obligatorio): Nest trae un **filtro de excepciones** por defecto (ver sección 9).

</details>

### 2.2 Similitudes con Angular (es "primo hermano")

| Concepto en Angular | Equivalente en Nest | Observación |
|---|---|---|
| `@NgModule` | `@Module` | Se saca el prefijo `Ng`. Mismos arrays: `imports`, `providers`, `exports`. |
| `declarations` / componentes | `controllers` | El array de componentes se reemplaza por el array de controllers. |
| Servicios (`@Injectable`) | **Providers** (servicios) | Singleton, se declaran en el módulo. Nest los llama "providers" en la documentación. |
| `main.ts` + `bootstrapApplication(App, appConfig)` | `main.ts` + `bootstrap()` | Acá se le pasa **directamente el módulo** (`AppModule`) y el puerto. |
| `angular.json` | `nest-cli.json` | Configuración de la aplicación. |
| Pipes | Pipes | Misma idea (`PipeTransform`, método `transform`), pero acá además **validan**. |
| Guards | Guards | Mismo funcionamiento. |
| *(no visto)* | **Interceptors** | No se vieron en Angular; se verán en Nest. Funcionan de la misma manera. |
| `@Component`, `@Directive`, `@Input`, `@Output` | `@Controller`, `@Get`, `@Post`, `@Body`, `@Param`... | Nest se apoya mucho en **decoradores** de TypeScript. |
| `ng generate` / `ng g` | `nest generate` / `nest g` | Cambia solo el prefijo. |
| Componentes | **No existen** | No hay capa visual: solo se manejan datos. |

> [!NOTE]
> **Aplicaciones modulares por defecto:** Nest genera aplicaciones **modulares** (un módulo principal que contiene al resto). El esquema "standalone" que se usaba en Angular **todavía no está aplicado del todo** en Nest (en la documentación hay un esbozo). Por eso, en esta segunda parte se va a usar mucho el concepto de módulos.

> [!TIP]
> Nest está pensado para **aplicaciones de gran tamaño que requieren escalar**: uno de sus focos es el **orden**. Por eso conviene prestar atención a las **buenas prácticas** desde el principio.

---

# 3. Las tres capas de una app Nest

> [!NOTE]
> **Módulos, Controllers y Servicios** son las tres capas que maneja la aplicación.
> - **Módulo:** junta y **encapsula** las diferentes partes de la aplicación.
> - **Controller:** **recibe las peticiones** del cliente y las **deriva al método correspondiente** según el verbo HTTP (`get`, `post`, etc.) y la ruta.
> - **Servicio (provider):** contiene **toda la capa lógica** (no solo acceso a base de datos, sino cualquier código).

```text
Cliente ──petición HTTP──▶ Controller ──llama──▶ Servicio ──▶ (lógica / base de datos)
                              ▲                                      │
                              └────────────── respuesta ◀────────────┘
```

> [!TIP]
> **Controllers limpios:** su única responsabilidad es **llamar al servicio**. Nada de lógica "en la medida de lo posible". Un controller no debería tener 50 líneas de código; como mucho unas 10 (exagerando). En Angular debería funcionar igual, pero hay costumbre de meter mucho código en los componentes; acá los componentes no existen, así que **toda esa responsabilidad va a los servicios**.

> [!NOTE]
> **Los servicios son *singleton***: hay una sola instancia, se declaran en el módulo (array `providers`) y se inyectan donde se necesiten, igual que en Angular.

---

# 4. Instalación y creación del proyecto

### 4.1 Instalar el CLI de Nest (global)

```bash
npm i -g @nestjs/cli
```

- `-g` = instalación **global**.
- Tarda unos 10 segundos o un poco más.
- El docente mostró que la versión instalada era la última disponible en ese momento (en la transcripción el número se escucha como "128"; verificá con `nest --version`).

### 4.2 Crear el proyecto

```bash
nest new nombre-del-proyecto
```

> [!TIP]
> Igual que `ng new`, solo cambia el prefijo (`ng` → `nest`). El docente aclaró que se iban a confundir seguido diciendo "ng" cuando querían decir "nest".

Durante la creación el CLI pregunta:
1. **Gestor de paquetes** → se eligió **npm**.
2. **Herramienta de testing** (en la transcripción se escucha "Btest o Jest"; el CLI ofrece Jest y una alternativa moderna, probablemente Vitest) → se eligió la alternativa a Jest.

> [!WARNING]
> Al crear el proyecto se genera una carpeta nueva: hay que **entrar a esa carpeta y abrirla con VS Code** (`code .`) para trabajar dentro del proyecto.

### 4.3 Estructura de carpetas generada

| Elemento | Para qué sirve |
|---|---|
| `package.json` | Dependencias y scripts. |
| `tsconfig.json` | Configuración de TypeScript. |
| `nest-cli.json` | Reemplaza al `angular.json`: configuración de la aplicación. |
| `test/` | Carpeta de tests (no se toca por ahora). |
| `node_modules/` | Dependencias instaladas. |
| `src/` | **Todo el código de la aplicación.** |
| `src/main.ts` | Punto de entrada: función `bootstrap`. |
| `src/app.module.ts` | **Módulo principal**. |
| `src/app.controller.ts` + `src/app.service.ts` | Controller y servicio de ejemplo creados por defecto. |
| `*.spec.ts` | Archivos de test asociados. |

> [!NOTE]
> A diferencia de Angular, **no hay `app.component`** (el famoso `app-root`); acá el principal es un **módulo** (`AppModule`). Tampoco hay capa visual ni su configuración.

### 4.4 `main.ts` y la función `bootstrap`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // se pasa directamente el módulo
  await app.listen(3000);                          // puerto (por defecto 3000)
}
bootstrap();
```

> [!NOTE]
> En Angular se le pasaba un `appConfig`; **acá se le pasa el módulo principal** y el puerto en el que se levanta la aplicación (por defecto, **3000**).

---

# 5. Módulos en Nest

Funcionan **exactamente igual que en Angular**, con la diferencia de que no hay prefijo `Ng` (`@Module` en vez de `@NgModule`).

```typescript
@Module({
  imports: [],       // otros módulos que necesito
  controllers: [],   // reemplaza al array de componentes
  providers: [],     // acá se declaran los servicios del módulo
  exports: [],       // lo que este módulo "presta" a otros módulos (no viene por defecto, se agrega)
})
export class AppModule {}
```

> [!WARNING]
> **Regla de oro: todo lo que no está declarado en un módulo no existe para la aplicación.**
> - Si sacás un controller del módulo, no existe.
> - Si sacás un servicio del módulo, no existe.
> - Si un módulo no está importado (directa o indirectamente) en el `AppModule`, **no existe**.

### 5.1 ¿Por qué todo termina en `AppModule`?

- `main.ts` ejecuta `bootstrap` pasándole el `AppModule`: **es lo que levanta toda la aplicación**.
- Todo debe estar **conectado de alguna manera al `AppModule`** (en el gráfico de la documentación, todos los módulos están unidos al módulo raíz; lo que tiene una línea cortada no se carga).
- En Angular se pasaba un archivo de configuración porque había componentes standalone; acá la app está basada en módulos, así que se pasa el módulo principal.

<details>
<summary>🙋 Duda de alumno: ¿ya no usamos <code>app.controller</code> y <code>app.service</code> si tenemos otros módulos?</summary>

No hacen falta. El docente los **borró** (y los quitó del módulo). Técnicamente se podrían declarar todos los controllers directamente en el `AppModule`, pero **no es buena práctica**: la aplicación pasa a ser un **monolito** con todo en un solo módulo.

</details>

### 5.2 Módulos compartidos (*Shared Module*)

> [!NOTE]
> Un **Shared Module** es un módulo con **código o lógica transversal a toda la aplicación** (cualquier módulo puede necesitarlo). Se crea una vez y los demás módulos lo **importan** para usarlo. También se vio en Angular.

---

# 6. Controllers en detalle

### 6.1 Anatomía de un controller

```typescript
import { Controller, Get, Post } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')                 // segmento base de la ruta: /usuarios
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()                                // GET /usuarios
  getHello() { /* ... */ }

  @Get('all')                           // GET /usuarios/all
  getAll() {
    return this.usuariosService.getAll();
  }

  @Get('detalle')                       // GET /usuarios/detalle
  getDetalle() { /* ... */ }

  @Post('create')                       // POST /usuarios/create
  create() {
    return this.usuariosService.create();
  }
}
```

- La clase se exporta y lleva el decorador **`@Controller('ruta')`**.
- Lo que se le pasa a `@Controller()` es **el nombre de la ruta** a la que responde (no un tipo de dato).
- Con `localhost:3000/usuarios` la petición llega a este controller.
- Cada verbo HTTP se define con su **decorador**; dentro del decorador se puede indicar **el siguiente segmento de ruta**.

<details>
<summary>🙋 Duda de alumno: "¿qué es 'usuarios' en <code>@Controller('usuarios')</code>? ¿El tipo de dato?"</summary>

No: es una **ruta**. Cuando se hace una petición a `localhost:3000/usuarios`, Nest busca el controller que responde a esa ruta. Puede haber **otros controllers con otras rutas**, y la petición irá al que corresponda. El resto de la ruta (`/all`, `/detalle`, `/create`) se define dentro de los decoradores de cada método.

</details>

> [!WARNING]
> **Error común de importación:** los decoradores (`@Get`, `@Post`, etc.) se importan desde **`@nestjs/common`**. A veces el IntelliSense de VS Code sugiere importarlos de otro paquete; si se importan "del lado equivocado" **la aplicación rompe**. Verificar siempre la importación (y que el decorador esté en mayúscula).

### 6.2 Verbos HTTP y decoradores

| Verbo HTTP | Decorador | Uso típico |
|---|---|---|
| GET | `@Get()` | Listar / obtener |
| POST | `@Post()` | Crear |
| PUT | `@Put()` | Actualizar la entidad completa |
| PATCH | `@Patch()` | Actualización parcial |
| DELETE | `@Delete()` | Eliminar |

### 6.3 Buenas prácticas de nombres (código limpio)

> [!TIP]
> No es obligatorio, pero es buena práctica:
> - El **nombre del método puede ser cualquiera** (no rompe nada, es "testimonial"), pero conviene ser **semántico**: que tenga que ver con la acción o el servicio al que llama (p. ej., `getDetalle` para un `@Get('detalle')`).
> - **No repetir en el método lo que ya está en el controller.** En un controller de usuarios, un método para listar todos se llama `getAll`, **no** `getAllUsuarios`, porque "usuarios" ya está definido en el controller.
> - Lo mismo aplica a los métodos del servicio.
> - Respetar los **parámetros de entrada y salida**.

### 6.4 El controller siempre devuelve (`return`)

<details>
<summary>🙋 Duda de alumno: "¿los controllers siempre tienen que tener el <code>return</code>?"</summary>

**Sí, siempre.** Lo que devuelve el controller es lo que se le devuelve al cliente (por ejemplo, un texto como "usuario creado", o todos los usuarios que devuelve el método `getAll` del servicio). No hace falta castear nada.

</details>

---

# 7. Servicios e inyección de dependencias

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsuariosService {
  getAll()           { return 'Todos los usuarios'; }
  getOneById(id: number)        { return `Usuario con ID ${id}`; }
  create(usuario: any)          { return 'Usuario creado'; }
  update(id: number, usuario: any) { return `Usuario ${id} actualizado`; }
  delete(id: number)            { return `Usuario ${id} eliminado`; }
}
```

- La **única forma de inyección de dependencias** es **por constructor** (no existe el operador `inject()` como en Angular):

```typescript
constructor(private readonly usuariosService: UsuariosService) {}
```

> [!TIP]
> Detalle de sintaxis: el modificador va primero: **`private readonly`** (el docente se equivocó en vivo y un alumno lo corrigió: "va primero el `private`"). Se usa `readonly` porque la referencia es de solo lectura.

> [!NOTE]
> Nombres de métodos de servicio sugeridos: `getAll`, `getOne` / `getById` (el docente prefirió `getById` para dejar claro que se busca por ID; a veces se busca por nombre, email, etc.), `create`, `update`, `delete`.

---

# 8. Levantar la aplicación y probar con Postman

### 8.1 Comando para levantar en modo desarrollo

```bash
npm run start:dev
```

> [!TIP]
> Con `:dev` (modo *watch*) la aplicación **se refresca sola ante cualquier cambio**, igual que `ng serve` en Angular; no hace falta recompilar a mano.

> [!WARNING]
> Si da error al levantar, puede ser porque **el puerto 3000 ya está en uso** (el docente tenía la app levantada en otra consola). Cerrar la instancia anterior y volver a correr.

### 8.2 Qué muestra la consola al iniciar

Al levantar, la consola muestra cómo Nest va **cargando todo**:
1. *Starting application*.
2. Carga el **módulo** (`AppModule`) y los módulos importados.
3. Instancia los **servicios**.
4. Carga cada **controller** y **a qué ruta responde**.
5. Lista **todas las rutas** mapeadas (`/usuarios/all`, `/usuarios/detalle`, `/usuarios/create`, etc.).

> [!TIP]
> Truco para entender el orden de carga: agregar un `constructor()` con un `console.log` en un servicio. Ese mensaje aparece **cuando el servicio se inicializa**. Orden: *se carga el módulo → el módulo carga sus controllers → cada controller carga sus rutas*.

### 8.3 Probar en Postman

- Crear la petición apuntando a `localhost:3000/...` con el método correspondiente.
- `GET localhost:3000/usuarios` → devuelve el "Hello World" definido.
- `GET localhost:3000/usuarios/all` → devuelve todos los usuarios.
- `POST localhost:3000/usuarios/create` → devuelve "usuario creado".

---

# 9. El filtro de excepciones de Nest ("red de contención")

> [!NOTE]
> Nest trae por defecto una **capa de filtro de excepciones** que está "arriba de todo": **cualquier excepción lanzada es capturada por el framework** y devuelta al cliente como respuesta de error con un código de estado. **Nunca habrá una excepción no controlada que rompa la aplicación en ejecución.**

- Ejemplo visto: al borrar el `app.controller` y volver a llamar a las rutas viejas, **no rompe**; devuelve un **404** con el modelo estándar de error de Nest.
- El trabajo del desarrollador pasa a ser **definir bien los errores**: que la excepción esté bien definida, que el código de error sea correcto y que el mensaje no sea demasiado genérico.

---

# 10. Crear módulos, controllers y servicios con el CLI

El patrón es el mismo que en Angular, cambiando `ng` por `nest`.

```bash
nest g module usuarios        # crea la carpeta usuarios/ con usuarios.module.ts
nest g controller usuarios    # crea usuarios.controller.ts (+ spec) en la carpeta del módulo y lo declara en el módulo
nest g service usuarios       # crea usuarios.service.ts (+ spec), lo agrega a providers del módulo
```

> [!WARNING]
> Es fácil olvidarse la **`g`** (de `generate`) en el comando; si se olvida, el CLI no reconoce lo que querés hacer.

> [!TIP]
> Qué hace el CLI automáticamente:
> - Crea los archivos **dentro de la carpeta del módulo**.
> - **Declara el controller** en el array `controllers` del módulo.
> - **Agrega el servicio** al array `providers`.
> - Genera también los archivos `.spec.ts` (tests).
> - Al usar `@Controller('usuarios')`, el controller ya viene con la ruta con el nombre del recurso.

> [!NOTE]
> Se conversó que el patrón **Modelo–Vista–Controlador** y el concepto de *controller* aparecen en varios frameworks (Express, Laravel, .NET); lo vas a encontrar en muchos lugares.

---

# 11. Recibir datos de la petición: `@Param`, `@Query`, `@Body`, `@Req`

Dentro de un método del controller se usan **decoradores de parámetro** para acceder a cada parte de la petición. El decorador le "indica algo al framework" sobre de dónde sacar el dato.

| Decorador | Accede a | Ejemplo |
|---|---|---|
| `@Param('id')` | **Parámetros de ruta** (definidos en la ruta como `:id`, igual que en el routing de Angular) | `GET /usuarios/5` |
| `@Query()` | **Query params** (parámetros opcionales, los que van tras `?` y se separan con `&`) | `GET /usuarios?nombre=Ana&edad=20` |
| `@Body()` | **Cuerpo de la petición** (típico en `POST`, `PATCH`) | JSON enviado en el body |
| `@Req()` / `@Res()` | El objeto **request** / **response** completo (headers, cookies, query, body, etc.) | — |

```typescript
@Get(':id')
getById(@Param('id') id: string) {
  return `Usuario con ID ${id}`;
}

@Post('create')
create(@Body() createUsuarioDto: any) {   // "any" por ahora; se mejora con DTOs
  console.log(createUsuarioDto);
  return 'Usuario creado';
}

@Patch(':id')
update(@Param('id') id: string, @Body() updateUsuarioDto: any) { /* ... */ }

@Delete(':id')
remove(@Param('id') id: string) { /* ... */ }
```

<details>
<summary>🔍 Demostración en vivo con <code>@Req()</code> (desplegar)</summary>

- El docente agregó `@Req() request` y un `console.log(request)`.
- La consola mostró **muchísima información** de la petición: headers, cookies, query params, body, etc.
- Se puede acceder a todo eso desde el request, pero **si ya tenemos `@Body()`, `@Param()` o `@Query()` no hace falta ir al request completo**.
- `@Req` y `@Request` son lo mismo; `@Res` y `@Response` también.

</details>

<details>
<summary>🔍 Demostración en vivo: <code>@Param</code> y <code>@Body</code> (desplegar)</summary>

- **`GET localhost:3000/usuarios/5`** → el método con `@Param('id')` devuelve "usuario con ID 5".
- **`POST`** con body JSON (en Postman, pestaña *Body → raw → JSON*):

```json
{
  "nombre": "Pedro",
  "apellido": "Pérez"
}
```

  → la respuesta es "usuario creado" y el `console.log` en la consola del servidor muestra el body recibido.
- Cuidado con el JSON: las claves y valores van **entre comillas dobles**; errores de tipeo (comillas mal cerradas, `:` dentro de las comillas) hacen fallar la petición.

</details>

### 11.1 `PUT` vs `PATCH`

| | `PUT` | `PATCH` |
|---|---|---|
| Actualización | Reemplazo de la **entidad completa** | **Parcial**: solo los campos enviados |
| ¿Hay que enviar toda la entidad? | Sí | **No** |
| Recomendación del docente | Se puede tener uno, otro o ambos | Es mejor tener `PATCH`, pero depende de cada uno |

---

# 12. Conectar controller y servicio (CRUD manual)

El controller solo deriva al servicio:

```typescript
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('all')
  getAll() { return this.usuariosService.getAll(); }

  @Get(':id')
  getById(@Param('id') id: string) { return this.usuariosService.getById(+id); }

  @Post('create')
  create(@Body() usuario: any) { return this.usuariosService.create(usuario); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() usuario: any) {
    return this.usuariosService.update(+id, usuario);
  }

  @Delete(':id')
  delete(@Param('id') id: string) { return this.usuariosService.delete(+id); }
}
```

> [!NOTE]
> A este conjunto (**C**reate, **R**ead, **U**pdate, **D**elete) se lo conoce como **CRUD** de una entidad: todo lo necesario para crear, listar, editar y eliminar.
>
> *(Aclaración del docente: lo que dijo "CR..." al principio de la explicación era CRUD; "CORS/CR" es otra cosa, relacionada con peticiones entre orígenes.)*

---

# 13. Generar un CRUD completo con `nest g resource`

Como el CRUD es algo muy común, el CLI lo genera todo de una sola vez:

```bash
nest g resource alumno
```

El CLI pregunta:
1. **Tipo de API:** REST API, GraphQL (code first / schema first), Microservicios o WebSockets → **se usará solo REST API**.
2. **¿Generar los puntos de entrada del CRUD?** → **Sí**.

**Qué genera:**
- Carpeta `alumnos/` con su **módulo** (y lo registra en `AppModule`).
- **Controller** con todos los métodos (`create`, `findAll`, `findOne`, `update`, `remove`) ya con sus decoradores y parámetros.
- **Servicio** con los métodos correspondientes, ya vinculados desde el controller.
- Carpeta `entities/` con la **entidad** `Alumno` (vacía por ahora).
- Carpeta `dto/` con **dos DTOs**: `CreateAlumnoDto` y `UpdateAlumnoDto`.

> [!TIP]
> Antes se hizo todo esto "a mano" (módulo → controller → servicio → métodos → llamadas) justamente para entender qué hay detrás; `nest g resource` lo resuelve de golpe.

---

# 14. DTOs (Data Transfer Objects)

> [!NOTE]
> **DTO (Data Transfer Object):** clase/modelo que se usa **solo para transferir datos entre cliente y servidor** (en un sentido o en el otro). Permite definir **qué campos viajan** en cada operación.

### 14.1 ¿Para qué sirven?

<details>
<summary>🔍 Ejemplos explicados por el docente (desplegar)</summary>

**Ejemplo 1 – Alta sin ID**
- Una entidad tiene `id`, pero **al crear no se pasa el ID**: se genera en la base de datos al insertar.
- Entonces el `CreateDto` lleva todos los datos **menos el ID**.

**Ejemplo 2 – Relaciones entre entidades**
- Si `Alumno` tiene una relación con `Usuario`, al dar de alta un alumno **no se envían todos los datos del usuario** (id, nombre, apellido, email...), solo **el ID vinculado**.
- Entonces, en `CreateAlumnoDto` se define un campo `usuarioId`.

**Ejemplo 3 – Respuesta (`GET`)**
- También puede haber un DTO para devolver datos: la entidad guarda solo un `number` (ID del usuario), pero al cliente se le debe enviar **el usuario completo**. Se arma un DTO con todos los datos y ese es el modelo que se le entrega al cliente.

*(El docente aclaró que el ejemplo usuario–alumno no es el más feliz; se verá mejor cuando se trabaje con base de datos en la próxima clase.)*

</details>

### 14.2 `UpdateAlumnoDto` y `PartialType`

```typescript
export class UpdateAlumnoDto extends PartialType(CreateAlumnoDto) {}
```

> [!NOTE]
> **`PartialType(CreateAlumnoDto)`** convierte **todos los campos de la clase en opcionales**. Así, para actualizar solo el nombre **no hace falta reenviar nombre, apellido y edad**: alcanza con enviar el campo que cambia. Esto permite el *update parcial* (`PATCH`).

---

# 15. Compartir servicios entre módulos

Escenario: `AlumnosModule` quiere usar el servicio de `UsuariosModule`.

### 15.1 La forma correcta: `exports` + `imports`

**Paso 1 – El módulo dueño exporta el servicio**

```typescript
@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],   // ← lo "disponibiliza" para otros módulos
})
export class UsuariosModule {}
```

**Paso 2 – El módulo que lo necesita importa el módulo**

```typescript
@Module({
  imports: [UsuariosModule],    // ← se importa el MÓDULO, no el servicio suelto
  controllers: [AlumnosController],
  providers: [AlumnosService],
})
export class AlumnosModule {}
```

**Paso 3 – Inyectar el servicio por constructor**

```typescript
@Injectable()
export class AlumnosService {
  constructor(private readonly usuariosService: UsuariosService) {}

  test() {
    return this.usuariosService.getAll();
  }
}
```

> [!NOTE]
> Igual que con los componentes en Angular: para usar algo de otro módulo no alcanza con importar el componente/servicio; hay que **importar el módulo que lo contiene**, y ese módulo debe **exportarlo** para que los demás puedan usarlo.

> [!WARNING]
> **Error común:** `Nest can't resolve dependencies of the AlumnosService...`
> Ocurre cuando se importó el módulo pero **el módulo dueño no exportó el servicio** (falta el array `exports`). Es muy parecido a los errores que aparecían en Angular. La solución es agregar el servicio al `exports` del módulo que lo contiene.

### 15.2 La forma incorrecta: redeclarar el servicio en `providers`

Se mostró que *se puede* poner `UsuariosService` directamente en el `providers` de `AlumnosModule` sin importar el módulo, pero **no es correcto**:

> [!WARNING]
> - **Se crea una instancia nueva** del servicio (el constructor con `console.log` se ejecutó **dos veces**). Es la misma clase, pero **instancias diferentes**.
> - Con los controllers pasa igual: si se declara `UsuariosController` en otro módulo, **se vuelve a cargar con todas sus rutas**.
> - Esto puede generar **problemas por instancias múltiples**, sobre todo con los servicios (que deberían ser *singleton*).
> - **Por eso se importan los módulos**: se reutiliza la instancia existente.

---

# 16. Error clásico: el orden de las rutas

<details>
<summary>🐞 Caso en vivo: <code>GET /alumnos/test</code> no entraba al método <code>test</code> (desplegar)</summary>

**Qué pasó:**
- En el controller de alumnos había `@Get(':id')` (para buscar por ID) **declarado antes** que `@Get('test')`.
- Al pedir `GET /alumnos/test`, Nest lo interpretó como `:id = "test"` y **entró al método de búsqueda por ID**, devolviendo "un alumno" en vez de ejecutar `test`.
- No hubo error en consola (por eso es difícil de detectar).

**Explicación:** `localhost:3000/alumnos/lo-que-sea` entra al `@Get(':id')`, porque `:id` acepta cualquier valor.

**Solución:** declarar las rutas con parámetro dinámico (`:id`) **al final**, "como última instancia". Así primero se evalúan las rutas específicas (`test`, `all`, `detalle`) y solo si ninguna coincide se cae en `:id`.

</details>

> [!WARNING]
> **Siempre poner las rutas con `:id` (u otros parámetros dinámicos) al final del controller.** Es un error muy común.

---

# 17. Validaciones con Pipes

### 17.1 El problema: sin validación, Nest deja pasar cualquier cosa

<details>
<summary>🔍 Demostración en vivo del problema (desplegar)</summary>

- El método `create` esperaba un `CreateAlumnoDto`, pero en Postman se envió un body **completamente distinto**.
- Nest **lo dejó pasar "como por su casa"** y llamó al método; el `console.log` mostró el body incorrecto.
- Como todavía no hay base de datos, no rompió. Pero en la práctica **la base de datos tiene un modelo que hay que respetar** (columnas, propiedades), por lo que es necesario **validar lo que llega del cliente**.

> [!NOTE]
> Los tipos de TypeScript (`@Body() dto: CreateAlumnoDto`) **no validan en tiempo de ejecución**: son solo para desarrollo. Hay que usar pipes.

</details>

### 17.2 Pipes en Nest

> [!NOTE]
> Los **pipes** de Nest tienen la misma idea que en Angular (interfaz **`PipeTransform`** con el método **`transform`**), pero acá se usan para **dos cosas**: **transformar** datos y **validar** datos. Los pipes que transforman, además, validan.
> Una diferencia: en Nest los pipes se manejan como **servicios inyectables**. También se pueden **crear pipes propios**.

Nest trae una **batería de pipes predefinidos** (para verificar si un dato es entero, float, booleano, array, ID/UUID, enumerado, archivo, etc.).

### 17.3 Pipe en un parámetro: validar que el ID sea numérico

Se pasa el pipe **como segundo argumento** del decorador del parámetro (el primero es el nombre):

```typescript
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.alumnosService.findOne(id);
}
```

- `GET /alumnos/test` → **400 Bad Request** (se esperaba un número y se recibió un string). La excepción la captura el filtro de excepciones de Nest.
- `GET /alumnos/5` → pasa correctamente.

> [!TIP]
> **Personalizar el código de error:** en vez de pasar la clase, se crea una instancia con `new` y se le pasa un objeto de opciones con `errorHttpStatusCode`:
>
> ```typescript
> @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }))
> ```
>
> Con esto el error devuelve **406 (Not Acceptable)** en lugar de 400.

*(Nota: en la clase el docente mostró el ejemplo de la documentación oficial; el nombre exacto del pipe numérico es `ParseIntPipe`.)*

### 17.4 Validar DTOs: `ValidationPipe` global + `class-validator`

Cuando hay que validar **modelos completos** (DTOs) se necesitan tres piezas:

**① Instalar las librerías**

```bash
npm i class-validator class-transformer
```

> [!NOTE]
> El docente las nombró "Class Validator" y "Class Transform"; el paquete real se llama `class-transformer`.

**② Activar el `ValidationPipe` de forma global en `main.ts`**

```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());   // ← aplica a toda la aplicación
  await app.listen(3000);
}
bootstrap();
```

**③ Decorar las propiedades del DTO con reglas de `class-validator`**

```typescript
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateAlumnoDto {
  @IsString()
  @IsNotEmpty()      // valida que no sea vacío, nulo ni undefined
  nombre: string;

  @IsString()
  apellido: string;

  @IsNumber()
  edad: number;
}
```

- Al estar `UpdateAlumnoDto` basado en `PartialType(CreateAlumnoDto)`, **las mismas validaciones aplican al update**.
- Hay **muchísimas** validaciones disponibles en `class-validator` (email, enteros, etc.); consultar la documentación.

<details>
<summary>🔍 Demostración en vivo de validación de DTO (desplegar)</summary>

1. **Sin** `ValidationPipe` global: se envió `edad` como texto → **no pasó nada** (se creó igual).
2. **Con** el pipe global y los decoradores: se envió `edad: "25"` (texto) → **400 Bad Request** con mensajes del tipo *"edad must be a number..."* y, mientras estaba `@IsNotEmpty` en un campo de forma incorrecta, *"nombre should not be empty"*.
3. Al enviar `edad: 25` (número, **sin comillas**) → el alumno se crea correctamente.

> [!WARNING]
> Cuidado con los errores de tipeo en Postman: comillas alrededor de un número lo vuelven *string* y la validación falla (el docente se equivocó en vivo con esto).

</details>

<details>
<summary>🙋 Duda de alumno: "Si en el DTO ya importé la librería, ¿por qué hace falta el pipe global en el <code>main</code>?"</summary>

Porque **el `ValidationPipe` es quien ejecuta las validaciones usando la librería**. Los decoradores del DTO solo **declaran** las reglas; sin el pipe activo, nadie las aplica. Se pone en **global** para no tener que incluirlo en cada endpoint cada vez que se use el modelo. **No hay que olvidarse del `useGlobalPipes`.**

</details>

> [!TIP]
> **Ventaja:** se valida **directamente el modelo** una sola vez; cada vez que se use ese DTO la validación ya está lista, sin validar endpoint por endpoint.

### 17.5 Personalizar mensajes de error

<details>
<summary>🙋 Duda de alumno: "¿se puede modificar el mensaje de error?" (desplegar)</summary>

**Sí.** Los decoradores de `class-validator` reciben un parámetro de **opciones de validación** donde se puede pasar un `message`:

```typescript
@IsNumber({}, { message: 'La edad debe ser un número' })
edad: number;
```

Aporte de un compañero (Gabriel Rojas): en validadores como los numéricos, **el primer parámetro son opciones propias de la validación** (por ejemplo, permitir infinitos o definir cuántos decimales se aceptan) y **el segundo es el mensaje de error**. Consultar la documentación de cada decorador para ver sus parámetros.

</details>

### 17.6 Librería alternativa

> [!TIP]
> Existe **otra librería** que cumple la misma función (también se usa con pipes globales) pero trabaja con **esquemas** (otra forma de definir validaciones). El docente recomienda usar **`class-validator` + `class-transformer`** y no profundizó en la otra. *(En la grabación el nombre no se distingue con claridad.)*

---

# 18. Resumen de comandos de la clase

| Objetivo | Comando |
|---|---|
| Instalar CLI de Nest (global) | `npm i -g @nestjs/cli` |
| Crear proyecto | `nest new <nombre>` |
| Levantar en modo desarrollo (hot reload) | `npm run start:dev` |
| Generar módulo | `nest g module <nombre>` |
| Generar controller | `nest g controller <nombre>` |
| Generar servicio | `nest g service <nombre>` |
| Generar CRUD completo (módulo + controller + servicio + entidad + DTOs) | `nest g resource <nombre>` |
| Instalar librerías de validación | `npm i class-validator class-transformer` |

---

# 19. Cierre y próximos pasos

- El docente subirá la **grabación** y armará un **documento** con lo visto hoy (módulos y validaciones).
- **Próxima clase:** continuar con más contenido de Nest (se mencionó que, si da el tiempo, se verá **base de datos**) y se hablará del **segundo TP**.

> [!TIP]
> **Cómo estudiar esta clase:** recreá el proyecto desde cero: `nest new` → módulo `usuarios` con CRUD manual → `nest g resource alumno` → compartir `UsuariosService` entre módulos (provocá el error de `exports` a propósito) → activar `ValidationPipe` global y probar el DTO en Postman.
