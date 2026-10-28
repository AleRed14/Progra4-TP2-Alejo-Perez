import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateLoginDto {
  // Identificador: puede ser correo o nombre de usuario
  @IsNotEmpty({
    message: 'El correo o nombre de usuario es obligatorio',
  })
  @IsString({
    message: 'El correo o nombre de usuario debe ser un texto válido',
  })
  @MaxLength(254, {
    message: 'El identificador no puede superar los 254 caracteres',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  identificador: string;

  // Contraseña sin encriptar
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MaxLength(64, {
    message: 'La contraseña no puede superar los 64 caracteres',
  })
  password: string;
}
