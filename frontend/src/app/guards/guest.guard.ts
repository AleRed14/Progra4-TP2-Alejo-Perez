import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion.service';

/**
 * Guard funcional para usuarios invitados (rutas /login y /registro).
 * Impide que un usuario ya logueado vuelva a ver las pantallas de login o registro,
 * redirigiéndolo directamente al Feed principal (/publicaciones).
 */
export const guestGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) {
    return true;
  }

  return router.createUrlTree(['/publicaciones']);
};

