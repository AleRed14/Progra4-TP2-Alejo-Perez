# Reglas de Desarrollo Frontend (Sprint 1)

1. **Angular 22 Standalone:** Sin decoradores obsoletos (`standalone: true` ni `OnPush` explícito, ya son defaults) y cero `NgModules`.
2. **Control Flow Nativo:** Usar `@if`, `@for` con `track` y `@switch` (prohibido `*ngIf` y `*ngFor`).
3. **Estado con Signals:** Usar `signal()` y `computed()` para reactividad. Nunca usar `mutate`, solo `set()` y `update()`.
4. **Inyección Funcional:** Usar la función `inject()` en lugar de constructores.
5. **Inputs/Outputs Funcionales:** Usar `input()` y `output()` en lugar de decoradores `@Input()` y `@Output()`.
6. **Seguridad Funcional:** Guards como funciones `CanActivateFn` (retornando `UrlTree`) e interceptores como `HttpInterceptorFn`.
7. **Cero `CommonModule`:** Importar solo los módulos o directivas exactos que usa la plantilla (`ReactiveFormsModule`, `RouterLink`).
8. **Prohibido `alert()` y `confirm()`:** Toda interacción visual usa `NotificacionService` con Signals y Toasts accesibles.
9. **Mensajes en Castellano:** Error de login estricto: *"Las credenciales no son correctas"*. Cero textos técnicos o en inglés en la UI.
10. **Diseño Temático Propio:** Variables CSS cálidas de mascotas (tierra/verde) en `styles.css`. Prohibidos estilos genéricos de IA.
11. **Responsabilidad Única (SRP):** Desacoplar persistencia (`localStorage`), datos de prueba (mocks) y lógica de negocio en servicios separados.
12. **Accesibilidad WCAG AA:** Estilos `:focus-visible` de alto contraste, roles ARIA y navegación completa por teclado.
