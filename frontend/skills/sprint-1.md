# Pasos de Desarrollo: Sprint 1 Frontend (Angular 22)

1. **Fase 1 (Fundaciones):** Generar environments (dev/prod), proveer HttpClient en app.config y definir paleta en styles.css.
2. **Fase 2 (Modelos):** Declarar interfaces estrictas de Usuario, roles ('usuario' | 'admin'), credenciales y respuestas API.
3. **Fase 3 (Servicios & Toasts):** Crear NotificacionService con Signals (sin alert) y el componente visual ToastMensajes.
4. **Refactorización (SRP):** Desacoplar AuthStorageService (localStorage) y autenticacion.mock de AutenticacionService.
5. **Fase 4 (Seguridad HTTP):** Crear guards funcionales (auth, guest, admin) e interceptor HTTP para Bearer JWT y error 401.
6. **Fase 5 (Componentes Shared):** Crear Navbar reactiva y FormularioRegistro reutilizable con checklist interactivo de contraseña.
7. **Fase 6 (Vistas Ruteadas):** Crear LoginComponent (con accesos rápidos para el docente), RegistroComponent, Feed y MiPerfil.
8. **Fase 7 (Shell & Ruteo):** Limpiar app.html, configurar app.routes con Lazy Loading (loadComponent) y verificar con ng build.

