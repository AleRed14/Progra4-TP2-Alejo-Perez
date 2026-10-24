import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, delay, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CredencialesLogin,
  PerfilUsuario,
  RegistroUsuarioDto,
  Usuario,
} from '../models/usuario.model';
import {
  RespuestaAutorizar,
  RespuestaLogin,
  RespuestaRefrescar,
  RespuestaRegistro,
} from '../models/respuesta-api.model';

const STORAGE_TOKEN_KEY = 'patitas_jwt_token';
const STORAGE_USER_KEY = 'patitas_usuario_data';

/**
 * Servicio reactivo de Autenticación y Gestión de Sesión (JWT).
 * Utiliza Signals para el estado y expone computed signals de solo lectura.
 */
@Injectable({
  providedIn: 'root',
})
export class AutenticacionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // --- Estado reactivo interno (Signals) ---
  private readonly _usuarioActual = signal<Usuario | null>(this.recuperarUsuarioInicial());
  private readonly _token = signal<string | null>(this.recuperarTokenInicial());

  // --- Señales públicas de solo lectura (Derivadas) ---
  readonly usuarioActual = this._usuarioActual.asReadonly();
  readonly token = this._token.asReadonly();
  readonly estaAutenticado = computed(() => !!this._usuarioActual() && !!this._token());
  readonly esAdmin = computed(() => this._usuarioActual()?.perfil === 'administrador');

  // --- Usuarios precargados de prueba (Requisito estricto de cátedra) ---
  readonly credencialesPrueba = {
    usuario: {
      identificador: 'nacho_user',
      correo: 'nacho@petsocial.com',
      password: 'User1234!',
      perfil: 'usuario' as PerfilUsuario,
    },
    admin: {
      identificador: 'admin_pets',
      correo: 'admin@petsocial.com',
      password: 'Admin1234!',
      perfil: 'administrador' as PerfilUsuario,
    },
  };

  /**
   * Inicia sesión enviando credenciales al backend (POST /autenticacion/login).
   * Si el backend aún no está levantado, conmuta automáticamente a fallback local
   * para posibilitar el testeo integral del Sprint 1 en el frontend.
   */
  login(credenciales: CredencialesLogin): Observable<RespuestaLogin> {
    return this.http
      .post<RespuestaLogin>(`${this.apiUrl}/autenticacion/login`, credenciales)
      .pipe(
        tap((res) => this.establecerSesion(res.token, res.usuario)),
        catchError((error) => {
          // Si el backend no está disponible (código 0 / conexión rechazada), activamos mock de desarrollo:
          if (error.status === 0 || error.status === 404) {
            return this.loginMock(credenciales);
          }
          return throwError(() => error);
        })
      );
  }

  /**
   * Registra un nuevo usuario en la plataforma (POST /autenticacion/registro).
   */
  registro(dto: RegistroUsuarioDto): Observable<RespuestaRegistro> {
    return this.http
      .post<RespuestaRegistro>(`${this.apiUrl}/autenticacion/registro`, dto)
      .pipe(
        catchError((error) => {
          if (error.status === 0 || error.status === 404) {
            return this.registroMock(dto);
          }
          return throwError(() => error);
        })
      );
  }

  /**
   * Verifica la validez y rol de la sesión activa (POST /autenticacion/autorizar).
   */
  autorizar(): Observable<RespuestaAutorizar> {
    return this.http
      .post<RespuestaAutorizar>(`${this.apiUrl}/autenticacion/autorizar`, {})
      .pipe(
        tap((res) => {
          this._usuarioActual.set(res.usuario);
          this.guardarEnStorage(STORAGE_USER_KEY, res.usuario);
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
   * Renueva el token de autenticación (POST /autenticacion/refrescar).
   */
  refrescar(): Observable<RespuestaRefrescar> {
    return this.http
      .post<RespuestaRefrescar>(`${this.apiUrl}/autenticacion/refrescar`, {})
      .pipe(
        tap((res) => {
          this._token.set(res.token);
          this.guardarEnStorage(STORAGE_TOKEN_KEY, res.token);
        })
      );
  }

  /**
   * Cierra la sesión activa, limpiando el almacenamiento y las Signals.
   */
  cerrarSesion(): void {
    this._usuarioActual.set(null);
    this._token.set(null);
    try {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
    } catch {
      // Ignorar excepciones en entornos sin acceso a storage
    }
  }

  /**
   * Retorna el token actual para ser consumido por el interceptor HTTP.
   */
  obtenerToken(): string | null {
    return this._token();
  }

  // --- Métodos privados de persistencia y sesión ---

  private establecerSesion(token: string, usuario: Usuario): void {
    this._token.set(token);
    this._usuarioActual.set(usuario);
    this.guardarEnStorage(STORAGE_TOKEN_KEY, token);
    this.guardarEnStorage(STORAGE_USER_KEY, usuario);
  }

  private recuperarTokenInicial(): string | null {
    try {
      return localStorage.getItem(STORAGE_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private recuperarUsuarioInicial(): Usuario | null {
    try {
      const data = localStorage.getItem(STORAGE_USER_KEY);
      return data ? (JSON.parse(data) as Usuario) : null;
    } catch {
      return null;
    }
  }

  private guardarEnStorage(clave: string, valor: unknown): void {
    try {
      if (typeof valor === 'string') {
        localStorage.setItem(clave, valor);
      } else {
        localStorage.setItem(clave, JSON.stringify(valor));
      }
    } catch {
      // Manejo silencioso de cuotas o restricciones de navegador
    }
  }

  // --- Fallbacks simulados para desarrollo local sin backend levantado ---

  private loginMock(credenciales: CredencialesLogin): Observable<RespuestaLogin> {
    const ident = credenciales.identificador.toLowerCase().trim();
    const esAdmin =
      ident === this.credencialesPrueba.admin.identificador ||
      ident === this.credencialesPrueba.admin.correo;
    const esUser =
      ident === this.credencialesPrueba.usuario.identificador ||
      ident === this.credencialesPrueba.usuario.correo;

    // Validación según la regla de oro: mensaje único para credenciales inválidas
    if (!esAdmin && !esUser) {
      return throwError(() => ({
        status: 401,
        error: { mensaje: 'Las credenciales no son correctas' },
      }));
    }

    const usuarioMock: Usuario = {
      _id: esAdmin ? 'mock-admin-id-654321' : 'mock-user-id-123456',
      nombre: esAdmin ? 'Administrador' : 'Ignacio',
      apellido: esAdmin ? 'Sistema' : 'Pérez',
      correo: esAdmin ? this.credencialesPrueba.admin.correo : this.credencialesPrueba.usuario.correo,
      nombreUsuario: esAdmin ? this.credencialesPrueba.admin.identificador : this.credencialesPrueba.usuario.identificador,
      fechaNacimiento: '1998-05-15',
      descripcion: esAdmin ? 'Administrador general de Patitas' : 'Amante de los perros y gatos rescatados 🐶🐱',
      fotoPerfilUrl: 'assets/imagenes/avatar-defecto.png',
      perfil: esAdmin ? 'administrador' : 'usuario',
      deshabilitado: false,
      eliminado: false,
    };

    const tokenMock = `mock.jwt.token.${btoa(JSON.stringify(usuarioMock))}`;
    const respuesta: RespuestaLogin = {
      token: tokenMock,
      usuario: usuarioMock,
      mensaje: 'Inicio de sesión exitoso (Modo Desarrollo)',
    };

    return of(respuesta).pipe(
      delay(300),
      tap((res) => this.establecerSesion(res.token, res.usuario))
    );
  }

  private registroMock(dto: RegistroUsuarioDto): Observable<RespuestaRegistro> {
    const usuarioCreado: Usuario = {
      _id: `mock-user-${Date.now()}`,
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      nombreUsuario: dto.nombreUsuario,
      fechaNacimiento: dto.fechaNacimiento,
      descripcion: dto.descripcion || '',
      fotoPerfilUrl: 'assets/imagenes/avatar-defecto.png',
      perfil: 'usuario',
      deshabilitado: false,
      eliminado: false,
    };

    return of({
      mensaje: '¡Usuario registrado correctamente! Ahora podés iniciar sesión.',
      usuario: usuarioCreado,
    }).pipe(delay(400));
  }
}
