import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';
import { NotificacionService } from '../services/notificacion.service';

/**
 * Guard funcional exclusivo para el rol 'administrador'.
 * Bloquea el acceso a usuarios comunes a los dashboards de administración.
 */
export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);
  const notificacionService = inject(NotificacionService);

  if (authService.esAdmin()) {
    return true;
  }

  notificacionService.error('Acceso denegado: Esta sección es exclusiva para administradores.');
  return router.createUrlTree(['/publicaciones']);
};

