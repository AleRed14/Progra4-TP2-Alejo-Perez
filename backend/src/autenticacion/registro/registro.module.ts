import { Module } from '@nestjs/common';
import { RegistroService } from './registro.service.js';
import { RegistroController } from './registro.controller.js';
import { UsuariosModule } from '../../usuarios/usuarios.module.js';
import { CommonModule as AuthCommonModule } from '../common/common.module.js';
import { CommonModule } from '../../common/common.module.js';

@Module({
  imports: [UsuariosModule, AuthCommonModule, CommonModule],
  controllers: [RegistroController],
  providers: [RegistroService],
})
export class RegistroModule {}
