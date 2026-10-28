import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsStrongPassword,
  IsDate,
  MaxDate,
  Length,
  Matches,
  MaxLength,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateRegistroDto {
  // Nombre
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  nombre: string;

  // Apellido
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString({ message: 'El apellido debe ser un texto válido' })
  @Length(2, 50, { message: 'El apellido debe tener entre 2 y 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, {
    message: 'El apellido solo puede contener letras y espacios',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  apellido: string;

  // Correo / Email
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsString({ message: 'El correo electrónico debe ser una cadena de texto' })
  @MaxLength(254, {
    message: 'El correo electrónico no puede superar los 254 caracteres',
  })
  @IsEmail(
    { require_tld: true },
    { message: 'El formato del correo electrónico no es válido' },
  )
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  correo: string;

  // Nombre de usuario
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @IsString({ message: 'El nombre de usuario debe ser un texto válido' })
  @Length(3, 16, {
    message: 'El nombre de usuario debe tener entre 3 y 16 caracteres',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  nombreUsuario: string;

  // Contraseña
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MaxLength(64, {
    message: 'La contraseña no puede superar los 64 caracteres',
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message:
        'La contraseña debe tener al menos 8 caracteres e incluir al menos una minúscula, una mayúscula y un número',
    },
  )
  password: string;

  // Fecha de nacimiento
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  @Type(() => Date)
  @IsDate({ message: 'Debe ingresar una fecha válida' })
  @MaxDate(() => new Date(), {
    message: 'La fecha de nacimiento no puede ser en el futuro',
  })
  fechaNacimiento: Date;

  // Breve descripción
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido' })
  @MaxLength(160, {
    message: 'La descripción no puede superar los 160 caracteres',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  descripcion?: string;

  // Perfil (por defecto 'usuario', modificable a 'administrador' según consigna Sprint 1)
  @IsOptional()
  @IsString({ message: 'El perfil debe ser un texto válido' })
  @IsIn(['usuario', 'administrador'], {
    message: 'El perfil solo puede ser usuario o administrador',
  })
  perfil?: 'usuario' | 'administrador';
}
