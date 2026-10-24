import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AutenticacionService } from '../services/autenticacion.service';
import { NotificacionService } from '../services/notificacion.service';

/**
 * Interceptor funcional HTTP.
 * 1. Clona cada petición saliente e inyecta la cabecera 'Authorization: Bearer <token>' si hay sesión activa.
 * 2. Captura respuestas con errores HTTP (401, 403, 500) y presenta mensajes amigables en castellano sin alert().
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AutenticacionService);
  const router = inject(Router);
  const notificacionService = inject(NotificacionService);

  const token = authService.obtenerToken();

  // Inyección inmutable del Bearer Token
  let peticion = req;
  if (token) {
    peticion = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(peticion).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 401: {
            // No alertar si el 401 proviene del intento de login erróneo
            const esRutaLogin = req.url.includes('/autenticacion/login');
            if (!esRutaLogin) {
              authService.cerrarSesion();
              notificacionService.error(
                'Tu sesión ha finalizado. Por favor, volvé a ingresar.'
              );
              router.navigate(['/login']);
            }
            break;
          }

          case 403: {
            const mensajeBackend = error.error?.mensaje;
            notificacionService.error(
              mensajeBackend || 'No tenés los permisos necesarios para realizar esta acción.'
            );
            break;
          }

          case 500: {
            notificacionService.error(
              'Ocurrió un problema en nuestros servidores. Por favor, intentá nuevamente en unos minutos.'
            );
            break;
          }
        }
      }

      return throwError(() => error);
    })
  );
};

