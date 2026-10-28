import { Module } from '@nestjs/common';
import { PublicacionesModule } from './publicaciones/publicaciones.module.js';
import { AutenticacionModule } from './autenticacion/autenticacion.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { CommonModule } from './common/common.module.js';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { envConfig } from './config/env.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    MongooseModule.forRoot(process.env.CONNECTION_STRING!),
    CommonModule,
    PublicacionesModule,
    AutenticacionModule,
    UsuariosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
