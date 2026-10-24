import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';
import { NotificacionService } from '../services/notificacion.service';

/**
 * Guard funcional que protege rutas privadas (Feed, Perfil, Detalle).
 * Bloquea el acceso a usuarios no autenticados y redirige a /login.
 */
export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);
  const notificacionService = inject(NotificacionService);

  if (authService.estaAutenticado()) {
    return true;
  }

  notificacionService.advertencia('Debés iniciar sesión para acceder a esta sección.');
  return router.createUrlTree(['/login']);
};

