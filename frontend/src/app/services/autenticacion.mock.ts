import { Observable, delay, of, throwError } from 'rxjs';
import {
  CredencialesLogin,
  PerfilUsuario,
  RegistroUsuarioDto,
  Usuario,
} from '../models/usuario.model';
import {
  RespuestaLogin,
  RespuestaRegistro,
} from '../models/respuesta-api.model';

/**
 * Cuentas precargadas exigidas por la cátedra para pruebas rápidas docentes.
 */
export const CREDENCIALES_PRUEBA = {
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
 * Simula la respuesta del endpoint POST /autenticacion/login cuando el backend está apagado.
 */
export function simularLoginMock(credenciales: CredencialesLogin): Observable<RespuestaLogin> {
  const ident = credenciales.identificador.toLowerCase().trim();
  const esAdmin =
    ident === CREDENCIALES_PRUEBA.admin.identificador ||
    ident === CREDENCIALES_PRUEBA.admin.correo;
  const esUser =
    ident === CREDENCIALES_PRUEBA.usuario.identificador ||
    ident === CREDENCIALES_PRUEBA.usuario.correo;

  // Regla de cátedra: "Las credenciales no son correctas" para cualquier fallo de login
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
    correo: esAdmin ? CREDENCIALES_PRUEBA.admin.correo : CREDENCIALES_PRUEBA.usuario.correo,
    nombreUsuario: esAdmin ? CREDENCIALES_PRUEBA.admin.identificador : CREDENCIALES_PRUEBA.usuario.identificador,
    fechaNacimiento: '1998-05-15',
    descripcion: esAdmin ? 'Administrador general de Patitas' : 'Amante de los perros y gatos rescatados 🐶🐱',
    fotoPerfilUrl: 'assets/imagenes/avatar-defecto.png',
    perfil: esAdmin ? 'administrador' : 'usuario',
    deshabilitado: false,
    eliminado: false,
  };

  const tokenMock = `mock.jwt.token.${btoa(JSON.stringify(usuarioMock))}`;
  return of({
    token: tokenMock,
    usuario: usuarioMock,
    mensaje: 'Inicio de sesión exitoso (Modo Mock)',
  }).pipe(delay(300));
}

/**
 * Simula la respuesta del endpoint POST /autenticacion/registro cuando el backend está apagado.
 */
export function simularRegistroMock(dto: RegistroUsuarioDto): Observable<RespuestaRegistro> {
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
  }).pipe(delay(350));
}
