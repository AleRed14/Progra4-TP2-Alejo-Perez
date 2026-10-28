import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateLoginDto } from './dto/create-login.dto.js';
import { UsuariosService } from '../../usuarios/usuarios.service.js';
import { CommonService } from '../common/common.service.js';

@Injectable()
export class LoginService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly authCommonService: CommonService,
  ) {}

  async login(createLoginDto: CreateLoginDto) {
    const usuario = await this.usuariosService.buscarPorIdentificador(
      createLoginDto.identificador,
    );

    if (!usuario) {
      throw new UnauthorizedException('Las credenciales no son correctas');
    }

    const passwordValida = await this.authCommonService.compararPassword(
      createLoginDto.password,
      usuario.password,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Las credenciales no son correctas');
    }

    if (usuario.eliminado) {
      throw new UnauthorizedException('Tu cuenta ha sido dada de baja');
    }

    if (usuario.deshabilitado) {
      throw new UnauthorizedException(
        'Tu cuenta se encuentra deshabilitada temporalmente',
      );
    }

    return {
      mensaje: 'Inicio de sesión exitoso',
      usuario: this.authCommonService.sanitizarUsuario(usuario),
    };
  }
}
