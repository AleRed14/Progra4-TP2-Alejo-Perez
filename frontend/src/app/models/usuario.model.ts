/**
 * ============================================================================
 * MODELO DE DOMINIO: USUARIO & CREDENCIALES
 * Cátedra: Programación IV (UTN) - Trabajo Práctico Nº 2
 * ============================================================================
 */

/**
 * Roles permitidos en la plataforma según la consigna de cátedra.
 */
export type PerfilUsuario = 'usuario' | 'administrador';

/**
 * Entidad completa de Usuario persistida en MongoDB (Schema Usuario).
 */
export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion?: string;
  fotoPerfilUrl?: string;
  perfil: PerfilUsuario;
  deshabilitado: boolean; // Switch temporal del admin
  eliminado: boolean;     // Baja lógica definitiva
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Datos enviados al endpoint de login (POST /autenticacion/login).
 * El identificador permite iniciar sesión tanto con correo como con nombre de usuario.
 */
export interface CredencialesLogin {
  identificador: string;
  password: string;
}

/**
 * Datos requeridos para el registro público de nuevos usuarios (POST /autenticacion/registro).
 */
export interface RegistroUsuarioDto {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  password: string;
  repetirPassword?: string;
  fechaNacimiento: string;
  descripcion?: string;
  perfil?: PerfilUsuario;
  fotoPerfil?: File | null;
}

/**
 * Payload que viaja decodificado dentro del JSON Web Token (JWT).
 * Nunca contiene contraseñas ni datos sensibles.
 */
export interface UsuarioSesion {
  sub: string;             // ID del usuario en MongoDB
  nombreUsuario: string;
  correo: string;
  perfil: PerfilUsuario;
  iat?: number;            // Issued At (timestamp emisión)
  exp?: number;            // Expiration (timestamp vencimiento)
}
