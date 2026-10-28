import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuarioDocument } from '../../usuarios/schemas/usuario.schema.js';

@Injectable()
export class CommonService {
  private readonly saltRounds = 10;

  async encriptarPassword(passwordPlana: string): Promise<string> {
    return bcrypt.hash(passwordPlana, this.saltRounds);
  }

  async compararPassword(
    passwordPlana: string,
    hashGuardado: string,
  ): Promise<boolean> {
    return bcrypt.compare(passwordPlana, hashGuardado);
  }

  sanitizarUsuario(usuario: UsuarioDocument) {
    const obj =
      typeof usuario.toObject === 'function' ? usuario.toObject() : usuario;
    const {
      password: _password,
      __v: _v,
      ...usuarioSinPassword
    } = obj as unknown as Record<string, unknown>;
    return usuarioSinPassword;
  }
}
