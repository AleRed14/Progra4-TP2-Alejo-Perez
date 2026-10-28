import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({
  timestamps: true,
  collection: 'usuarios',
})
export class Usuario {
  // Nombre
  @Prop({
    required: true,
    trim: true,
  })
  nombre: string;

  // Apellido
  @Prop({
    required: true,
    trim: true,
  })
  apellido: string;

  // Correo / Email (único, normalizado a minúsculas)
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  correo: string;

  // Nombre de usuario (único, normalizado a minúsculas)
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  nombreUsuario: string;

  // Contraseña (almacenada con hash bcrypt en el servicio)
  @Prop({
    required: true,
  })
  password: string;

  // Fecha de nacimiento
  @Prop({
    required: true,
    type: Date,
  })
  fechaNacimiento: Date;

  // Breve descripción (opcional, default vacío)
  @Prop({
    default: '',
    trim: true,
  })
  descripcion: string;

  // URL o ruta de la foto de perfil (con avatar por defecto de assets)
  @Prop({
    default: 'assets/imagenes/avatar-defecto.png',
    trim: true,
  })
  fotoPerfilUrl: string;

  // Perfil / Rol (definido en arquitectura.md, por defecto 'usuario')
  @Prop({
    type: String,
    enum: ['usuario', 'administrador'],
    default: 'usuario',
    index: true,
  })
  perfil: 'usuario' | 'administrador';

  // Manejo explícito de estados según arquitectura.md y apuntes de cátedra
  @Prop({
    default: false,
    index: true,
  })
  deshabilitado: boolean;

  @Prop({
    default: false,
    index: true,
  })
  eliminado: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

