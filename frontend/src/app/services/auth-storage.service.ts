import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';

const STORAGE_TOKEN_KEY = 'patitas_jwt_token';
const STORAGE_USER_KEY = 'patitas_usuario_data';

/**
 * Servicio encargado exclusivamente de la persistencia de sesión en el navegador.
 * Desacopla localStorage del resto de la aplicación para permitir migrar a cookies
 * u otros mecanismos sin impactar en los servicios de negocio.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthStorageService {
  obtenerToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  guardarToken(token: string): void {
    try {
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
    } catch {
      // Manejo silencioso de cuotas o restricciones de navegador
    }
  }

  obtenerUsuario(): Usuario | null {
    try {
      const data = localStorage.getItem(STORAGE_USER_KEY);
      return data ? (JSON.parse(data) as Usuario) : null;
    } catch {
      return null;
    }
  }

  guardarUsuario(usuario: Usuario): void {
    try {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(usuario));
    } catch {
      // Manejo silencioso de cuotas o restricciones de navegador
    }
  }

  limpiar(): void {
    try {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
    } catch {
      // Manejo silencioso de cuotas o restricciones de navegador
    }
  }
}
