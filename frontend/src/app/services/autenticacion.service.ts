import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { CredencialesLogin, RegistroUsuarioDto, Usuario } from '../models/usuario.model';
import {
  RespuestaAutorizar,
  RespuestaLogin,
  RespuestaRefrescar,
  RespuestaRegistro,
} from '../models/respuesta-api.model';
import { AuthStorageService } from './auth-storage.service';
import {
  CREDENCIALES_PRUEBA,
  simularLoginMock,
  simularRegistroMock,
} from './autenticacion.mock';

/**
 * Servicio reactivo de Autenticación y Sesión.
 * Fachada principal que administra el estado con Signals y la comunicación HTTP.
 */
@Injectable({
  providedIn: 'root',
})
export class AutenticacionService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(AuthStorageService);
  private readonly apiUrl = environment.apiUrl;

  // --- Estado reactivo con Signals ---
  private readonly _usuarioActual = signal<Usuario | null>(this.storage.obtenerUsuario());
  private readonly _token = signal<string | null>(this.storage.obtenerToken());

  // --- Señales públicas derivadas (solo lectura) ---
  readonly usuarioActual = this._usuarioActual.asReadonly();
  readonly token = this._token.asReadonly();
  readonly estaAutenticado = computed(() => !!this._usuarioActual());
  readonly esAdmin = computed(() => this._usuarioActual()?.perfil === 'administrador');

  // Atajo a las credenciales de prueba para botones rápidos de UI
  readonly credencialesPrueba = CREDENCIALES_PRUEBA;

  /**
   * Inicia sesión (POST /autenticacion/login) con fallback automático para pruebas.
   */
  login(credenciales: CredencialesLogin): Observable<RespuestaLogin> {
    return this.http
      .post<RespuestaLogin>(`${this.apiUrl}/autenticacion/login`, credenciales)
      .pipe(
        tap((res) => this.establecerSesion(res.token, res.usuario)),
        catchError((error) => {
          if (error.status === 0 || error.status === 404) {
            return simularLoginMock(credenciales).pipe(
              tap((res) => this.establecerSesion(res.token, res.usuario))
            );
          }
          return throwError(() => error);
        })
      );
  }

  /**
   * Registra un nuevo usuario (POST /autenticacion/registro).
   * Envía FormData compatible con FileInterceptor('imagen') y CreateRegistroDto del backend.
   */
  registro(dto: RegistroUsuarioDto): Observable<RespuestaRegistro> {
    const formData = new FormData();
    formData.append('nombre', dto.nombre);
    formData.append('apellido', dto.apellido);
    formData.append('correo', dto.correo);
    formData.append('nombreUsuario', dto.nombreUsuario);
    formData.append('password', dto.password);
    formData.append('fechaNacimiento', dto.fechaNacimiento);

    if (dto.descripcion) {
      formData.append('descripcion', dto.descripcion);
    }
    if (dto.perfil) {
      formData.append('perfil', dto.perfil);
    }
    if (dto.fotoPerfil) {
      formData.append('imagen', dto.fotoPerfil);
    }

    return this.http
      .post<RespuestaRegistro>(`${this.apiUrl}/autenticacion/registro`, formData)
      .pipe(
        catchError((error) => {
          if (error.status === 0 || error.status === 404) {
            return simularRegistroMock(dto);
          }
          return throwError(() => error);
        })
      );
  }

  /**
   * Valida vigencia de la sesión activa (POST /autenticacion/autorizar).
   */
  autorizar(): Observable<RespuestaAutorizar> {
    return this.http
      .post<RespuestaAutorizar>(`${this.apiUrl}/autenticacion/autorizar`, {})
      .pipe(
        tap((res) => {
          this._usuarioActual.set(res.usuario);
          this.storage.guardarUsuario(res.usuario);
        }),
        catchError((error) => {
          if (error.status === 0 && this.estaAutenticado()) {
            return of({
              usuario: this._usuarioActual()!,
              rol: this._usuarioActual()!.perfil,
            });
          }
          this.cerrarSesion();
          return throwError(() => error);
        })
      );
  }

  /**
   * Renueva el token de sesión (POST /autenticacion/refrescar).
   */
  refrescar(): Observable<RespuestaRefrescar> {
    return this.http
      .post<RespuestaRefrescar>(`${this.apiUrl}/autenticacion/refrescar`, {})
      .pipe(
        tap((res) => {
          this._token.set(res.token);
          this.storage.guardarToken(res.token);
        })
      );
  }

  /**
   * Cierra la sesión activa limpiando almacenamiento y Signals.
   */
  cerrarSesion(): void {
    this._usuarioActual.set(null);
    this._token.set(null);
    this.storage.limpiar();
  }

  /**
   * Retorna el token JWT actual para inyección en cabeceras HTTP.
   */
  obtenerToken(): string | null {
    return this._token();
  }

  private establecerSesion(token: string | undefined, usuario: Usuario): void {
    const tokenFinal = token || `sesion-sprint1-${usuario._id}`;
    this._token.set(tokenFinal);
    this._usuarioActual.set(usuario);
    this.storage.guardarToken(tokenFinal);
    this.storage.guardarUsuario(usuario);
  }
}
