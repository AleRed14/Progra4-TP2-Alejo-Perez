import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

/**
 * Tabla de Enrutamiento Principal con Lazy Loading y Guards Funcionales.
 * Cumple con las buenas prácticas de modularidad y performance de Angular 22.
 */
export const routes: Routes = [
  // Ruta raíz: redirige al feed principal
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'publicaciones',
  },

  // Rutas públicas (protegidas por guestGuard para usuarios no logueados)
  {
    path: 'login',
    // canActivate: [guestGuard],
    title: 'Iniciar Sesión | Patitas',
    loadComponent: () =>
      import('./pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    // canActivate: [guestGuard],
    title: 'Crear Cuenta | Patitas',
    loadComponent: () =>
      import('./pages/registro/registro').then((m) => m.RegistroComponent),
  },

  // Rutas privadas (protegidas por authGuard)
  {
    path: 'publicaciones',
    // canActivate: [authGuard],
    title: 'Feed de Mascotas | Patitas',
    loadComponent: () =>
      import('./pages/publicaciones/publicaciones').then((m) => m.PublicacionesComponent),
  },
  {
    path: 'mi-perfil',
    // canActivate: [authGuard],
    title: 'Mi Perfil | Patitas',
    loadComponent: () =>
      import('./pages/mi-perfil/mi-perfil').then((m) => m.MiPerfilComponent),
  },

  // Comodín para cualquier ruta desconocida: vuelve a publicaciones
  {
    path: '**',
    redirectTo: 'publicaciones',
  },
];

