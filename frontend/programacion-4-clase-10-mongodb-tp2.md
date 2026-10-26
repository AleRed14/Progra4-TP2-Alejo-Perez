# Programación 4 – Clase 10 (19/10/2026)
## Conexión a MongoDB con Mongoose, variables de entorno y consigna del TP2

> [!NOTE]
> **Contexto de la clase:** continuación de la clase 9 (NestJS). Hoy se reemplaza la capa de datos que antes se delegaba a Supabase: ahora **la base de datos la manejamos nosotros** con **MongoDB (plataforma Atlas) + Mongoose**. Al final se presentó la **consigna completa del Trabajo Práctico 2** (red social con Angular + NestJS + MongoDB), dividida en 4 sprints.

---

## ✅ Checklist: qué tenés que dominar después de esta clase

- [ ] Crear una cuenta, organización, proyecto y **cluster gratuito** en MongoDB Atlas.
- [ ] Crear un **usuario de base de datos** (rol admin) con contraseña y habilitar tu **IP** en la lista de acceso.
- [ ] Obtener el **connection string** para Mongoose y armarlo reemplazando `<password>`.
- [ ] Instalar `@nestjs/mongoose` + `mongoose` y configurar `MongooseModule.forRoot(...)` en el `AppModule`.
- [ ] Explicar la diferencia entre `forRoot` y `forFeature`.
- [ ] Definir una **entidad como esquema** con `@Schema()`, `@Prop()` y `SchemaFactory.createForClass()`.
- [ ] Registrar el esquema en el módulo e **inyectar el modelo** en el servicio con `@InjectModel()`.
- [ ] Usar los métodos del modelo (`create`, `find`, `findById`, `deleteOne`, etc.) de forma asíncrona.
- [ ] Marcar campos como obligatorios (`required`) y asignar **valores por defecto** (`default`).
- [ ] Distinguir **validación del DTO** (`class-validator`) de **validación del esquema** (Mongoose) y saber por qué esta última requiere `try/catch`.
- [ ] Sacar el connection string del código usando un archivo **`.env`** + `@nestjs/config`.
- [ ] Conocer los requisitos, sprints y fechas del **TP2**.

---

# 1. Avisos de organización y fechas

<details>
<summary>📅 Fechas, dinámica de entregas y dudas administrativas (desplegar)</summary>

**Dinámica general**
- Siguen valiendo las **presentaciones parciales** (es mucho más fácil que llegar el último día con todo el TP).
- Los que **no aprobaron el primer TP** pueden volver a presentar **también el primero**, pero el tiempo es limitado (son ~53 alumnos y 2 docentes): si traés los dos TP, se prioriza el segundo y el primero se ve "por partes".
- Se reserva **la mitad de cada clase para correcciones**. Se puede entregar **lunes y/o miércoles**.
- Las notas del primer parcial ya están en Siscad: **controlar que estén bien**.

**Calendario (según lo dicho en clase)**

| Fecha | Qué ocurre |
|---|---|
| Semana próxima | Corrección del **Sprint 1** (se puede entregar lunes y miércoles). |
| Semana siguiente | Corrección del **Sprint 2**. |
| 9 y 11 de noviembre | Semana sin clases por la visita del Papa (el docente lo cuenta como un sprint más; los sprints 3 y 4 se corrigen juntos hacia el final). |
| 16 de noviembre | Correcciones de los últimos sprints. |
| **18 de noviembre (miércoles)** | **Defensa del TP2 = segundo parcial.** |
| 25 de noviembre | Clase libre para correcciones y recuperatorios. |
| **30 de noviembre** | **Recuperatorio del TP1.** |
| **2 de diciembre** | **Recuperatorio del TP2** (el docente dijo "2 de noviembre" y lo corrigió: es diciembre). Última clase de la cursada. |

- Quien ya tiene **promocionado el TP1** y promociona el TP2 el 18/11, **termina la materia ahí**.
- El **TP2 es un poco más "light" en cantidad de secciones** (porque ahora hay que hacer front **y** back), pero **no más liviano en los conocimientos** que hay que demostrar en la defensa.
- El **recuperatorio del TP1** lleva **una consigna extra** (se envía por mail), muy parecida a lo visto en el TP1.
- El segundo parcial = **TP2 + defensa**, igual que el primero.

</details>

> [!TIP]
> Aunque "con las herramientas actuales" un TP se pueda hacer en una tarde, el docente insiste: **no se tiren a eso**, porque puede fallar (la mayoría lo vio en el primer TP).

---

# 2. MongoDB Atlas: preparar la base de datos en la nube

> [!NOTE]
> **MongoDB** es una base de datos **no relacional** (colecciones y documentos; ya vista en Base de Datos II). **Atlas** es la plataforma web para gestionarla en la nube. **Mongoose** es la librería para manejar MongoDB desde JavaScript/TypeScript. **Compass** es la versión de escritorio de la interfaz gráfica.

> [!WARNING]
> **Requisito del TP2:** la base de datos tiene que estar **cargada en la nube**. Se puede usar Atlas web o Compass, pero si usás Compass asegurate de que **apunte a la nube y no a una base local**. Podés desarrollar contra una local y luego subirla.

### 2.1 Pasos en Atlas

1. **Crear cuenta** (o reutilizar la de Base de Datos II), luego **organización** y **proyecto**.
2. En el proyecto, ir a **Clusters**. Un *cluster* es, a modo de referencia, "como si fuese nuestro servidor".
3. **Crear un cluster gratuito** (opción *Free*).
   - En la versión gratuita **solo se permite un cluster**. Si ya tenés uno de otra cursada podés **reutilizarlo**: revisá si está **pausado** (reanudarlo tarda varios minutos) o si te conviene eliminarlo.
   - Si ya tenés uno, la opción *Free* no aparece hasta que lo elimines.
4. Configuración del cluster:
   - Ponerle un **nombre** (en la demo: `prueba`).
   - **Dejar activada** la opción de **seguridad automática**.
   - **Destildar** *Preload sample data set* (no queremos datos de ejemplo).
   - Elegir proveedor (AWS, Azure, etc.) y región; en la demo se dejaron los valores por defecto.
5. Elegir cómo conectarse: **Drivers and client libraries** → lenguaje **JavaScript** → librería **Mongoose**.
6. Copiar el **connection string** y **guardarlo en algún lado** (se usa en seguida). Luego *Done*.

<details>
<summary>🙋 Problemas reales de alumnos al seguir los pasos (desplegar)</summary>

- **"No me aparece JavaScript / me aparecen opciones distintas":** el menú cambia según lo elegido antes. Hay que haber seleccionado **Drivers/Client libraries** y, ahí, JavaScript y **Mongoose** como librería (a un alumno le faltaba elegir Mongoose y por eso veía opciones raras).
- La versión del driver propuesta (7 o superior) está bien; se deja la que sugiere Atlas.
- Importante: **copiarse el connection string completo** antes de seguir.

</details>

### 2.2 Usuario de base de datos y contraseña

1. Ir a **Security → Database & Network Access**.
2. Usar tu usuario de base de datos o **crear uno nuevo** con rol de **admin sobre *all resources***.
3. Asignarle contraseña: con **Edit** → generar una **contraseña segura automática** → copiarla → **Update**.
4. **Guardar esa contraseña**: se usa para armar el connection string.

> [!WARNING]
> En el connection string aparece un marcador entre signos `<` y `>` donde va la contraseña. Hay que **reemplazar todo ese fragmento (incluidos los `<>`) por la contraseña real** del usuario de base de datos.

### 2.3 Lista de IPs permitidas (*IP Access List*)

- En el mismo menú (**Network Access → IP Access List**) se agrega la **IP desde la que te conectás** (hay un botón para agregar la IP actual; si no, buscás "ver mi IP pública" y la cargás a mano).
- Probablemente a la mayoría se la pida; si ves errores de IP no válida, es por esto.

---

# 3. Crear el proyecto Nest y conectar con Mongoose

### 3.1 Crear el proyecto

```bash
nest new test
```

- Gestor de paquetes: **npm**.
- Se pregunta por el tipo de módulos: **ESM** o **CommonJS** → el docente eligió **CommonJS**.

> [!NOTE]
> **ESM vs CommonJS:** no cambia nada en el funcionamiento; la diferencia se nota en las **importaciones**. Con **ESM**, los `import` entre archivos propios deben incluir la extensión del archivo ya compilado (**`.js`**), lo que no se hacía en Angular. Con **CommonJS** no hace falta. Es indistinto: elegí cualquiera.

### 3.2 Instalar dependencias

La documentación de Nest (sección *Database → MongoDB*) indica instalar **dos librerías**: Mongoose y su integración para Nest.

```bash
npm install @nestjs/mongoose mongoose
```

### 3.3 Importar `MongooseModule` en el `AppModule`

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://usuario:PASSWORD@cluster.../...'), // connection string armado
  ],
})
export class AppModule {}
```

- `forRoot()` se usa **en la raíz del proyecto** (el `AppModule`) y recibe el **connection string**.
- Si usaste ESM, puede ser necesario `mongoose.js`/ruta con extensión en el import; con CommonJS se importa normalmente.

> [!TIP]
> **Cómo probar que la conexión está bien:** simplemente levantar la app (`npm run start:dev`). **Si compila y arranca, la conexión es correcta**; si el connection string está mal, **falla al iniciar** (el docente lo demostró borrando parte del string).

> [!WARNING]
> **Problema con DNS en Windows:** al docente le falló la conexión por un tema de red/DNS y lo solucionó **configurando DNS públicos** en su equipo. Si te pasa lo mismo (error al resolver el host de Atlas), probá cambiar los DNS a unos públicos.

### 3.4 Base de datos y colecciones

- Al conectarse, Atlas todavía no muestra nada en **Browse Collections**. Cuando empecemos a enviar datos, se van a ir creando.
- **Por defecto se crea una base de datos llamada `test`**, salvo que se indique otra. El nombre se puede definir **desde la misma URL del connection string**.

---

# 4. Esquemas, entidades y modelos

### 4.1 La idea (patrón repositorio)

> [!NOTE]
> Vamos a **mapear desde nuestra aplicación Nest la estructura de las colecciones**. Cada colección se maneja como **un objeto/propiedad dentro de un servicio**, y se opera con métodos como `save`, `delete`, etc. Para esto se definen **esquemas** (los "modelos" de nuestras colecciones).

### 4.2 Generar el recurso

```bash
nest g resource alumnos
```

- Tipo de API: **REST API**; generar los puntos de entrada del CRUD: **Sí**.
- Se crean el módulo (ya importado en `AppModule`), controller, servicio, **entidad** y **DTOs** de crear/editar (igual que en la clase 9).
- Se pueden eliminar `app.service` y `app.controller`, que no se usan.

> [!TIP]
> **La entidad `alumno` representa una colección.** En ese archivo (`*.entity.ts`) es donde se define el esquema.

### 4.3 Definir la entidad como esquema

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// (Opcional) tipo "documento": la clase + métodos y acciones de un documento de Mongo
export type AlumnoDocument = HydratedDocument<Alumno>;

@Schema()                       // marca la clase como esquema
export class Alumno {
  @Prop()                       // cada propiedad que sea parte de la colección
  nombre: string;

  @Prop()
  apellido: string;

  @Prop()
  edad: number;
}

// Convierte la clase en un esquema de Mongoose
export const AlumnoSchema = SchemaFactory.createForClass(Alumno);
```

| Elemento | Qué hace | Se importa de |
|---|---|---|
| `@Schema()` | Decorador de clase: indica que es un esquema. | `@nestjs/mongoose` |
| `@Prop()` | Decorador de propiedad: la declara parte de la colección. | `@nestjs/mongoose` |
| `SchemaFactory.createForClass(Clase)` | Genera el **esquema** a partir de la clase. | `@nestjs/mongoose` |
| `HydratedDocument<Clase>` | Crea un **tipo** que une la clase con los métodos/acciones de un documento Mongo. | `mongoose` |

> [!NOTE]
> **Tipo `HydratedDocument` (opcional):** no es obligatorio crearlo, pero permite manejar cada instancia como **documento de Mongo**, con acceso a las propiedades de la clase **y** a los métodos y acciones de ese documento.

> [!TIP]
> **No hace falta declarar el `_id`:** MongoDB lo genera automáticamente como un **`ObjectId`**. Existe una opción para IDs autoincrementales, pero el docente **recomienda no usarla**: suelen dar problemas al borrar y crear cosas referenciadas. Con `ObjectId` no hay que seguir ninguna correlatividad.

### 4.4 Registrar el esquema en el módulo (`forFeature`)

Para que el servicio pueda usar el esquema, **hay que "disponibilizarlo" en el módulo**:

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Alumno.name, schema: AlumnoSchema },
    ]),
  ],
  controllers: [AlumnosController],
  providers: [AlumnosService],
})
export class AlumnosModule {}
```

| | `forRoot()` | `forFeature()` |
|---|---|---|
| Dónde se usa | `AppModule` (raíz) | Cada módulo que usa colecciones |
| Para qué | Establecer la **conexión** a la base | Declarar **qué esquemas/colecciones** usa ese módulo |
| Recibe | Connection string | Lista de `{ name, schema }` |

> [!NOTE]
> El `name` que se le pasa (`Alumno.name`) es el nombre con el que se identifica el modelo/colección en la base.

<details>
<summary>🙋 Duda de alumno: "¿en qué archivo se crea el esquema y qué hay que hacer después?" (desplegar)</summary>

1. El **esquema se crea en la entidad** (`alumno.entity.ts`).
2. Se lo **pasa al módulo** (`forFeature` en `alumnos.module.ts`) para que el servicio pueda usarlo; **si no está en el módulo, el servicio no lo puede utilizar**.
3. Se lo **inyecta en el servicio** con `@InjectModel`.
4. Desde ahí ya se puede hacer todo.

</details>

### 4.5 Inyectar el modelo en el servicio

```typescript
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AlumnosService {
  constructor(
    @InjectModel(Alumno.name) private readonly alumnoModel: Model<AlumnoDocument>,
  ) {}
}
```

- `@InjectModel()` permite inyectar **un modelo de una colección** (no una clase/servicio común).
- Se le pasa el **nombre** del esquema y se tipa con `Model<AlumnoDocument>` (clase genérica con el tipo "documento").
- A partir de acá, `alumnoModel` da **acceso directo a la colección**: crear, buscar, editar, eliminar.

### 4.6 Métodos del modelo (CRUD)

```typescript
create(createAlumnoDto: CreateAlumnoDto) {
  return this.alumnoModel.create(createAlumnoDto);
}

findAll() {
  return this.alumnoModel.find().exec();
}

findOne(id: string) {
  return this.alumnoModel.findById(id).exec();
}

remove(id: string) {
  return this.alumnoModel.deleteOne({ _id: id }).exec();
}
```

> [!NOTE]
> Hay **muchísimos métodos** (buscar por query o por ID, actualizar uno o varios, eliminar uno o varios, `findByIdAndRemove`/`findByIdAndDelete`, `insertMany`, reemplazar, etc.). Todos se acceden directamente desde el modelo y el código queda muy limpio.

> [!TIP]
> **`.exec()` y asincronía:** los métodos devuelven una **promesa** (con `.exec()` se obtiene una promesa "real"). Por eso se trabajan como **asincrónicos** (`async/await`) desde el servicio o el controller que los use. Algunos métodos ya devuelven promesa incluso sin `.exec()`.

> [!TIP]
> **`upsert`:** en las operaciones de actualización se puede agregar la opción `upsert: true`: **si el documento no existe, lo crea**.

<details>
<summary>🔍 Demostración en vivo con Postman (desplegar)</summary>

- Se envió un `POST /alumnos` con el body:

```json
{ "nombre": "Pepe", "apellido": "Pérez", "edad": 25 }
```

  → el alumno se creó con un **`_id` generado automáticamente** (no estaba en el esquema ni en el body).
- En Atlas, tras refrescar, apareció la base **`test`** y la colección **`alumnos`** con el documento. Se creó un segundo alumno (Juan Vázquez, 30) y ambos aparecieron.
- `GET /alumnos` trae **todos**; `GET /alumnos/:id` trae **uno**.
- `DELETE /alumnos/:id` eliminó el documento correspondiente.
- Se recordó respetar la sintaxis JSON (comas entre campos, comillas dobles).

</details>

---

# 5. Validaciones: DTO vs. esquema

### 5.1 Campos obligatorios y valores por defecto

**Problema:** si un campo no se declara obligatorio, Mongoose **no lo exige**. Se pudo crear un alumno **sin edad**, lo que a futuro genera **inconsistencia de datos**.

**Solución:** agregar opciones en `@Prop()`:

```typescript
@Prop({ required: true })
edad: number;
```

Si falta el campo, el servidor devuelve un **error 500 genérico**. Para dar un mensaje claro, se pasa un mensaje junto con `required`:

```typescript
@Prop({ required: [true, 'La edad es obligatoria'] })
edad: number;
```

> [!NOTE]
> Los compañeros aportaron que el mensaje se pasa como **arreglo `[true, 'mensaje']`** (el docente no lograba mostrarlo con la otra forma).

### 5.2 Valor por defecto (`default`)

```typescript
@Prop({ default: 'Sin apellido' })
apellido: string;
```

- Si el cliente **no envía** el campo, se guarda el valor por defecto. **No es una validación**: solo completa el dato faltante.
- Si el cliente envía un valor, **ese valor pisa al default**.

> [!TIP]
> **Caso típico del TP:** el **tipo de usuario**. Al registrarse, el usuario se crea por defecto como **`usuario`**; cuando lo crea un **administrador**, se envía el tipo explícitamente (admin o usuario). Se resuelve **directamente en la base** con `default`, sin métodos extra ni validaciones innecesarias en el front. El docente aclara que muchos alumnos "sobre-ingenian" esta parte.

### 5.3 Las dos validaciones (aclaración final del docente)

<details>
<summary>🐞 El "misterio" del mensaje de error que no aparecía (desplegar)</summary>

**Qué pasó en vivo:** al intentar crear un alumno sin edad, el cliente recibía un **500 genérico** y el mensaje personalizado no aparecía en Postman (se veía solo en la consola). El docente probó agregar `async/await`, `catch`, mover el DTO, instalar `class-validator`, etc. sin éxito.

**Qué resolvió después del recreo:** estaba **confundiendo dos validaciones distintas**:

| | Validación del **DTO** (clase 9) | Validación del **esquema** (hoy) |
|---|---|---|
| Herramienta | `class-validator` + `ValidationPipe` global | `required`, `default`, etc. en `@Prop()` (Mongoose) |
| Cuándo se ejecuta | Cuando **llegan los datos** del cliente | Cuando se **escribe en la base de datos** |
| Dónde se define | En el **DTO** (`@IsString()`, `@IsNotEmpty()`, ...) | En la **entidad/esquema** |
| Cómo se devuelve el error | Nest lo captura y arma un **400 con los mensajes** | Mongoose lanza una excepción que **no es HTTP** |

**La clave:** las excepciones que lanza Mongoose **no son excepciones HTTP**, por lo que **el filtro de excepciones de Nest no las captura** (por eso aparecía el 500 genérico). La solución es atrapar el error en el **servicio** con `try/catch` y **lanzar una excepción HTTP propia**:

```typescript
import { BadRequestException } from '@nestjs/common';

async create(dto: CreateAlumnoDto) {
  try {
    return await this.alumnoModel.create(dto);
  } catch (error) {
    throw new BadRequestException(error.message); // mapear el error de Mongoose a un 400
  }
}
```

Con esto, el mensaje sí llega al cliente con un **400 Bad Request**.

</details>

> [!WARNING]
> **Error común:** esperar que Nest capture automáticamente los errores de Mongoose. **No lo hace**: hay que usar `try/catch` en el servicio y lanzar una excepción HTTP (`BadRequestException`, etc.).

> [!TIP]
> **Recomendación del docente:** aplicar **ambas validaciones** (DTO + esquema). La del DTO valida lo que llega; la del esquema protege la integridad de lo que se guarda. Y, como mínimo, que **si alguien pega por Postman a tu API no pueda cargar/ver datos inválidos o no autorizados**.

---

# 6. Variables de entorno (`.env`) y `@nestjs/config`

> [!WARNING]
> Dejar el **connection string escrito en el `AppModule`** expone datos sensibles (usuario y contraseña de la base) en el código y en el repositorio. **No es correcto.**

### 6.1 Pasos

**① Instalar la librería de configuración**

```bash
npm i @nestjs/config
```

*(En clase se escuchó "next js config"; el paquete correcto es `@nestjs/config`.)*

**② Crear el archivo `.env` en la raíz del proyecto** (afuera de `src/`, mismo nivel que `package.json`). Contiene las variables de entorno:

```env
CONNECTION_STRING=mongodb+srv://usuario:PASSWORD@cluster.../...
```

> [!TIP]
> Convención: nombres de variables de entorno en **MAYÚSCULAS con guiones bajos** (`CONNECTION_STRING`).

**③ Importar `ConfigModule` en el `AppModule`** (con `forRoot()`), **antes** del `MongooseModule`, porque este lo necesita:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),                                   // 1º: carga las variables de .env
    MongooseModule.forRoot(process.env.CONNECTION_STRING!),   // 2º: usa la variable
    AlumnosModule,
  ],
})
export class AppModule {}
```

> [!NOTE]
> El `!` es el **operador de aserción de no nulo** de TypeScript (ya usado en Angular): le dice al compilador que el valor **no será nulo ni `undefined`** cuando se necesite; si no, romperá. Se usa porque `process.env.X` puede ser `undefined` por tipado.

**④ Verificar:** si compila y la conexión funciona, está correcto; se pueden hacer pruebas creando un nuevo documento.

### 6.2 ¿Por qué es seguro?

- El archivo `.env` está **ignorado en `.gitignore`** (los archivos `.env` de los distintos entornos), por lo que **no se sube al repositorio**.
- Queda **solo en tu máquina** y **no se compila** junto con el código.
- En la nube (hosting) esos valores se cargan como **secretos**.

> [!TIP]
> **Buenas prácticas de entornos:**
> - Tener **un archivo de entorno por cada ambiente** (desarrollo, producción, testing), cada uno con **su propio connection string** a **su propia base de datos** (idealmente, una base por entorno).
> - Al compilar se le indica qué archivo de entorno debe tomar.
> - La documentación de Nest muestra cómo usar archivos distintos (`.env.development.local`, etc.).

---

# 7. Trabajo Práctico 2: "Red social"

> [!NOTE]
> **Consigna general:** desarrollar una **red social con tema propio**. **Front en Angular, back en NestJS y base de datos MongoDB (en la nube)**: los tres son **obligatorios**. Se entrega **por sprints semanales**. El docente avisó que el documento oficial va a **sufrir algunas modificaciones** (por ejemplo, los tiempos del token); **la versión definitiva es la que se publique**.

### 7.1 Requisitos generales

**Identidad y diseño**
- La red social debe tener **un tema/impronta propia** (autos, videojuegos, cine, etc.). **No se aceptan redes genéricas** tipo Twitter o Facebook sin tema.
- **Estilos propios**: no se aceptan los "estilos típicos de IA" (colores, gradientes, botones, fondos, tipografías). Se puede usar IA como ayuda, pero **se nota** y hay que darle personalidad.
- Diseño **uniforme** en toda la app: mismo paquete de estilos (si hay fondo negro, en toda la app; botones de éxito verdes en toda la app; formularios del mismo estilo, p. ej. Bootstrap en todos).
- **Prohibido usar `alert`** de JavaScript: usar **modales, toasts o mensajes** propios.

**Funcionalidad base**
- Usuarios, **publicaciones**, dar y quitar **me gusta**, **comentarios**.
- Ver y **editar mi perfil**.
- Acceso a la app **solo registrado/logueado**.
- **JWT** para login y manejo de sesión (se verá en clase).
- **Códigos HTTP correctos**: `200`/`201` para OK, `400` para solicitudes incorrectas, `401`/`403` para no logueado/no autorizado, `500` para errores del servidor.
- Publicaciones: **título** obligatorio e **imagen opcional** ("opcional" = *puedo* cargarla o no, pero **si quiero cargarla, tengo que poder**).
- Navegación entre pantallas con el **routing** visto en la primera parte.

**Experiencia de usuario (UX)**
- Mensajes **claros, en castellano y entendibles** para cualquier usuario (no técnicos). Ejemplo del docente: nada de pantallas "403 Forbidden"; decir "se te venció el token", "te faltaron campos", etc.
- **Todos los errores capturados**: hacer un testeo fino.
- **Toda eliminación requiere confirmación** del usuario ("¿Está seguro que desea eliminar...?").
- Textos largos: usar un **pipe (truncate)** y mostrar el texto completo con "ver más" o en el detalle.
- Pensar cómo se muestran las cosas **antes** de que se vean mal (tarjetas gigantes, desbordes, etc.).

> [!TIP]
> **Para la corrección, traé todo "testeable":** si el paginado es de 10, **traé más de 10 publicaciones cargadas**; si el perfil debe mostrar 3 publicaciones con comentarios, **traélas cargadas**; si el paginado de comentarios es de 3 o 5, **traé 6**. Si no, se pierde tiempo creando datos y no se puede ver que la funcionalidad existe.

### 7.2 Sprint 1 – Base de la aplicación

**Front**
- Aplicación creada (front y back), **pantallas con estilos definidos** (nada de "componentes sueltos sin estilo"), formularios **ya hechos y validados**, pantallas casi funcionando.
- Pantallas: **registro** (formulario validado), **login**, **publicaciones (feed principal)** y **mi perfil**.
- **Deploy a hosting:** no es obligatorio todavía (en la próxima clase se ve **Vercel**; si quieren, pueden usar Firebase como antes).
- **Navegación completa** entre componentes.
- **Guards** funcionando (aunque con servicio *mock*): qué ve/qué puede hacer un admin y un usuario, a qué pantalla redirige. Después solo se cambia el servicio por el real con JWT.
- **Favicon** (ahora es obligatorio).

<details>
<summary>🔐 Login y registro: reglas detalladas (desplegar)</summary>

**Login**
- Formulario validado con mensajes acordes.
- Se puede loguear por **nombre de usuario o por mail** (a elección); el elegido debe ser **único**, y **ambos campos deben existir en el modelo de usuario**.
- Si las credenciales son incorrectas, el **único mensaje aceptable** es: **"Las credenciales no son correctas"** (nunca "el usuario no existe" ni "la contraseña es incorrecta").
- Contraseña: **mínimo 8 caracteres, una mayúscula y un número**.
- Tener **dos usuarios precargados** (uno común y un administrador) con **accesos rápidos** para testear.

**Registro**
- Todo validado, con mensajes en castellano (sin códigos de error). Si falla, decir **por qué** y **qué campo** falta o es inválido.
- **Informar el formato requerido de la contraseña mientras se completa el formulario** (asterisco o texto), no esperar al error: "el usuario no es adivino".
- Campos: **nombre, apellido, correo, nombre de usuario, contraseña, repetir contraseña, fecha de nacimiento y descripción** (se pueden usar *date pickers*).
- **Imagen de perfil**: el campo debe existir y estar validado (aunque aún no esté subido a la web).
- Tipo de usuario por defecto: **`usuario`** (no se envía a la base en el registro común).
- Hay **dos tipos**: usuario y administrador. El administrador, desde su pantalla, puede crear ambos.

**Validaciones en front y back**
- Se validan **en los dos lados**: aunque se valide en el front, **si alguien pega por Postman debe estar validado en el back**. Se recomienda usar las dos validaciones vistas (modelo/DTO y base de datos).

</details>

**Back**
- Proyecto Nest con los **módulos y controllers pedidos** (son obligatorios; no inventar otros en su lugar): módulo **publicaciones** y módulo **autenticación** (login + registro).
- **Registro (`POST`)**: recibe todos los datos del usuario, los valida y guarda. La **contraseña se guarda encriptada** (hay librerías con un método para encriptar; se pasará alguna).
- Recibir la **imagen de perfil** y guardarla en un servicio de imágenes (por ejemplo **Cloudinary**, o el *storage* de Supabase), que devuelve una **URL pública** que se guarda en la base.
- **Login (`POST`)**: recibe usuario/mail + contraseña y devuelve **los datos del usuario** o el **error correspondiente**.

### 7.3 Sprint 2 – Publicaciones

**Front**
- **Listado de publicaciones**:
  - Por defecto **ordenado por fecha**; con un botón/switch se puede **reordenar por cantidad de me gusta**.
  - **Paginado** (por ejemplo, 5 por página; no traer todas juntas).
- **Cada publicación es un componente** (tarjeta): recibe **por `@Input` todo el detalle** y emite **`@Output`** para acciones (eliminar, ver detalle, etc.).

> [!WARNING]
> Si se hace solo con IA, es muy probable que genere un **monolito** que muestre todas las publicaciones directamente, ignorando lo de componente/input/output. **Acá se pide algo en particular**: respetarlo.

- **Me gusta / quitar me gusta**: un botón (pulgar, corazón, etc.). Si ya di me gusta, el clic **lo quita** (no suma otro). Requiere estar logueado.
- **Eliminar mis propias publicaciones** (botón visible solo en las propias, con **confirmación**).
- **Mi perfil**: todos los datos del usuario, **foto de perfil** y las **últimas 3 publicaciones con sus comentarios**.

**Back** (módulo publicaciones, controller de publicaciones)
- `POST`: alta de una publicación **relacionada con un usuario** (título, descripción, URL de la imagen, etc.).
- `DELETE`: **baja lógica** (ver nota). La puede hacer el dueño; el administrador también (se ve en el Sprint 4).
- `GET`: listar, recibiendo por parámetro: **tipo de ordenamiento** (fecha / me gusta), **filtro por usuario**, **`offset`** (número de página) y **`limit`** (ítems por página).
- Truco de diseño: **el mismo endpoint** sirve para el feed y para las **últimas 3 publicaciones de un usuario** (pasando `usuario` + `limit=3` + orden por fecha); solo cambian los parámetros.
- `POST` para **dar me gusta** y `DELETE` para **quitarlo** si ya lo había dado.

> [!NOTE]
> **Baja lógica:** no se elimina el registro de la base; se guarda en un campo (booleano verdadero/falso) si está **eliminado o no**. Sirve, además, para conservar datos para **estadísticas**.

### 7.4 Sprint 3 – Detalle, comentarios y sesión

**Front**
- **Pantalla de detalle** de una publicación (imagen y descripción en grande), a la que se llega desde el feed.
- **Comentarios**:
  - Ordenados del **más nuevo al más viejo**.
  - **Paginados**: por ejemplo, mostrar 3 y un botón **"ver más / cargar más"** que **agrega** los siguientes 3 a la lista (no reemplaza los anteriores).
  - Se pueden **editar los comentarios propios** (solo el autor del comentario, no el dueño de la publicación) y debe verse una **marca de "editado"** (chip o texto).
- **Login con token**: guardarlo en **`localStorage` o en cookies** (se verá en clase).
- **Pantalla de "cargando" al abrir la app por primera vez**:
  - Consulta al back si hay token previo y si **sigue activo/válido**.
  - Según la respuesta: va al **feed** (si está logueado) o al **login** (si el token no es válido o expiró).
  - Debe tener **spinner/texto acorde al estilo** y agregarse un **delay de ~3–4 segundos** para poder verla durante la corrección.
- **Contador de sesión** (token):

<details>
<summary>⏱️ Cómo debe funcionar el contador y la expiración del token (desplegar)</summary>

- Para la corrección **no se pueden esperar 10 o 15 minutos**, así que los tiempos serán **de segundos** (el docente avisó que se actualizará el documento; ejemplo: ~30 segundos o 1 minuto).
- **Antes de que venza** el token aparece un **cartel/modal** que avisa que **la sesión está por expirar** y pregunta si se quiere **refrescar**. Ejemplo con vencimiento a 1 minuto: a los 50 segundos aparece "en 10 segundos vence tu token, ¿querés refrescarlo?".
  - **Si acepta:** se refresca el token (se obtiene uno nuevo) y el contador **empieza de nuevo**; se sigue navegando normalmente.
  - **Si no acepta** (o no responde): se sigue con el token viejo; cuando vence, **la siguiente petición** a la API con el token vencido devuelve un **error `401`**, y al capturarlo el front **redirige al login**.
- El cartel **no cierra la sesión automáticamente**: queda esperando la respuesta del usuario.
- Si el usuario no acepta **dentro del plazo restante**, el token igual vence y la siguiente petición da `401`.
- **Todas las peticiones que requieren usuario logueado** deben **enviar el token** y el back **valida que no haya expirado**; token expirado → **`401`**.
- La captura de esos errores del lado del front se hará con **interceptors** (se verán en las próximas clases).

</details>

**Back**
- **Controller de comentarios dentro del módulo de publicaciones** (no crear un "módulo comentarios" aparte): el comentario **necesita de la publicación para existir**, por eso van en el mismo módulo con controllers distintos.
  - `POST`: agregar comentario a una publicación. **No se envía el usuario**: se envía el **token** y de él se obtiene quién es el usuario (y se registra la fecha).
  - `PUT`: modificar un comentario, marcando la **propiedad "editado"**.
  - `GET`: traer comentarios **paginados** (`limit` y `offset`), **filtrados por publicación** (obligatorio).
- **Módulo de autenticación**:
  - Ruta que **valida el token**: informa si está vencido o no y el **rol** (admin/usuario); si es válido, devuelve los datos del usuario; si venció, `401` con mensaje.
  - El token se devuelve en la respuesta o por **cookie**.
  - Ruta de **refresh**: recibe el token y devuelve **uno nuevo con el mismo tiempo de expiración**.

### 7.5 Sprint 4 – Administración y estadísticas

**Front**
- **Administrador:**
  - Botón de **baja** sobre **cualquier publicación** (no solo las suyas). Baja lógica: deja de estar disponible y **tampoco se ven sus comentarios** (pero se conservan para estadísticas).
  - **Página de usuarios**: listar todos, **dar de alta** (eligiendo si es admin o común, con un selector/switch), y **dar de baja / habilitar–deshabilitar** (baja lógica).
- **Mensajes de login según el estado del usuario:**

| Situación | Mensaje |
|---|---|
| Usuario **deshabilitado** | Indicar que está **deshabilitado** |
| Usuario **dado de baja / eliminado** | Indicar que fue **dado de baja/eliminado** |
| Usuario **inexistente** | "Las credenciales no son correctas" |

- **Registro de usuarios desde admin:** igual al registro común pero **con el campo "tipo de usuario"** (selector).
- **Página de estadísticas (solo admin)** con **gráficos**:
  - **Cantidad de publicaciones por usuario** en un lapso de tiempo.
  - **Cantidad de comentarios realizados** en un lapso de tiempo.
  - **Cantidad de comentarios por publicación** en un lapso de tiempo (diferencia: este desglosa por publicación).
  - Todos con **campos "desde" y "hasta"** elegidos por el administrador (no vale traer "los últimos 30 días" fijos).
  - Los **gráficos deben variar** de tipo (barras, torta, líneas, etc.): no usar el mismo para todo.
- Obligatorios en esta etapa: **PWA**, **3 pipes propios** y **3 directivas propias** (de atributo, estructurales o de estilo; las tres creadas por ustedes). Ejemplos de pipes: truncate, filtros, paginado.

**Back**
- **Controller de usuarios** (módulo usuarios): `GET` listar, `POST` alta (recibe el **tipo de usuario**; se puede reutilizar el del registro sabiendo que uno recibe el tipo y el otro no), `DELETE` para **deshabilitar** y `POST` para **rehabilitar** (en pantalla puede ser un switch, pero son **dos endpoints**).
- Estos endpoints **solo los puede usar el administrador**: hay que validar que **el token pertenezca a un administrador**, no solo a un usuario logueado.
- **Controller de estadísticas** (en el módulo de publicaciones): `GET` para todas las estadísticas, también **solo para administradores**.

### 7.6 Extras para el **recuperatorio del TP2** (y ampliaciones)

- Ver el **perfil de otros usuarios**; como administrador, desde ese perfil poder **habilitar, deshabilitar, eliminar publicaciones/comentarios**, etc.
- **Scroll infinito** en publicaciones (mismo endpoint de paginado, pero cargando la siguiente página automáticamente al llegar al final).
- Más estadísticas: **cantidad de ingresos (logins) por usuario**, **visitas a mi propio perfil**, **me gusta por día** (gráfico de líneas).
- Para la instancia final (no promocionados): **guardar publicaciones** (sección de guardados), **compartir** con otro usuario (sección de compartidos con el usuario que lo compartió), y ordenar también por **cantidad de guardados y compartidos**.

> [!TIP]
> El docente aclaró que estos extras **no son prioridad**: "concentrémonos en el sprint 4". Si los sprints 1 a 4 están bien, **no se llega nunca al 5 ni al 6**.

---

# 8. Próximas clases (según lo anticipado)

- **JWT** (login y manejo de sesión), **interceptors**, **subida de archivos**, **despliegue** (Vercel) y más. "No los vamos a hacer investigar nada": todo lo necesario se verá en clase (quedan 2 o 3 clases).
- El docente subirá la **documentación con glosario, el código y la grabación** de la clase.

---

# 9. Resumen de comandos y fragmentos clave

| Objetivo | Comando / código |
|---|---|
| Crear proyecto | `nest new <nombre>` |
| Instalar Mongoose para Nest | `npm install @nestjs/mongoose mongoose` |
| Generar CRUD de una entidad | `nest g resource <nombre>` |
| Instalar configuración de entorno | `npm i @nestjs/config` |
| Conexión raíz | `MongooseModule.forRoot(process.env.CONNECTION_STRING!)` |
| Registrar esquema en un módulo | `MongooseModule.forFeature([{ name, schema }])` |
| Convertir clase en esquema | `SchemaFactory.createForClass(Clase)` |
| Inyectar modelo | `@InjectModel(Clase.name) private modelo: Model<ClaseDocument>` |
| Campo obligatorio con mensaje | `@Prop({ required: [true, 'mensaje'] })` |
| Valor por defecto | `@Prop({ default: 'valor' })` |
| Errores de Mongoose → HTTP | `try/catch` en el servicio + `throw new BadRequestException(...)` |
