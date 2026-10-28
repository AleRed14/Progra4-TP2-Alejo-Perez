import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module.js';
import { LoginModule } from './login/login.module.js';
import { RegistroModule } from './registro/registro.module.js';



@Module({
  controllers: [],
  providers: [],
  imports: [CommonModule, LoginModule, RegistroModule]
})
export class AutenticacionModule {}
