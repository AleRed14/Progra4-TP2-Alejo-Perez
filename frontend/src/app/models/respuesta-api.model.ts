/**
 * ============================================================================
 * MODELOS DE RESPUESTAS & ERRORES DE LA API (HTTP)
 * Cátedra: Programación IV (UTN) - Trabajo Práctico Nº 2
 * ============================================================================
 */

import { PerfilUsuario, Usuario } from './usuario.model';

/**
 * Formato unificado de respuestas de error devueltas por el backend NestJS
 * a través de su Exception Filter global en castellano.
 */
export interface ErrorApi {
  codigo: number;
  mensaje: string;
  error?: string;
  fecha?: string;
}

/**
 * Respuesta exitosa del endpoint POST /autenticacion/login
 */
export interface RespuestaLogin {
  token: string;
  usuario: Usuario;
  mensaje?: string;
}

/**
 * Respuesta exitosa del endpoint POST /autenticacion/registro
 */
export interface RespuestaRegistro {
  mensaje: string;
  usuario: Usuario;
}

/**
 * Respuesta del endpoint POST /autenticacion/autorizar
 * Utilizado para validar vigencia de la sesión y rol al abrir la app.
 */
export interface RespuestaAutorizar {
  usuario: Usuario;
  rol: PerfilUsuario;
}

/**
 * Respuesta del endpoint POST /autenticacion/refrescar
 */
export interface RespuestaRefrescar {
  token: string;
}

/**
 * Contrato genérico reutilizable para listados paginados de la plataforma (Feed, Comentarios).
 */
export interface RespuestaPaginada<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

