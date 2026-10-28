import { Module } from '@nestjs/common';
import { LoginService } from './login.service.js';
import { LoginController } from './login.controller.js';
import { UsuariosModule } from '../../usuarios/usuarios.module.js';
import { CommonModule as AuthCommonModule } from '../common/common.module.js';

@Module({
  imports: [UsuariosModule, AuthCommonModule],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
