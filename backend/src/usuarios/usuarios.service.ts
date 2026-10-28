import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema.js';

export interface CrearUsuarioDatos {
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  password: string;
  fechaNacimiento: Date;
  descripcion?: string;
  fotoPerfilUrl?: string;
  perfil?: 'usuario' | 'administrador';
}

@Injectable()
export class UsuariosService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<UsuarioDocument>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.inicializarUsuariosPrueba();
  }

  private async inicializarUsuariosPrueba(): Promise<void> {
    const usuariosPrueba = [
      {
        nombre: 'Ignacio',
        apellido: 'Pérez',
        correo: 'nacho@petsocial.com',
        nombreUsuario: 'nacho_user',
        passwordPlana: 'User1234!',
        fechaNacimiento: new Date('1998-05-15'),
        descripcion: 'Amante de los perros y gatos rescatados 🐶🐱',
        fotoPerfilUrl: 'assets/imagenes/avatar-defecto.png',
        perfil: 'usuario' as const,
      },
      {
        nombre: 'Administrador',
        apellido: 'Sistema',
        correo: 'admin@petsocial.com',
        nombreUsuario: 'admin_pets',
        passwordPlana: 'Admin1234!',
        fechaNacimiento: new Date('1995-01-01'),
        descripcion: 'Administrador general de Patitas 🛡️',
        fotoPerfilUrl: 'assets/imagenes/avatar-defecto.png',
        perfil: 'administrador' as const,
      },
    ];

    for (const u of usuariosPrueba) {
      try {
        const existe = await this.usuarioModel
          .findOne({
            $or: [{ correo: u.correo }, { nombreUsuario: u.nombreUsuario }],
          })
          .exec();

        if (!existe) {
          const passwordHash = await bcrypt.hash(u.passwordPlana, 10);
          await this.usuarioModel.create({
            nombre: u.nombre,
            apellido: u.apellido,
            correo: u.correo,
            nombreUsuario: u.nombreUsuario,
            password: passwordHash,
            fechaNacimiento: u.fechaNacimiento,
            descripcion: u.descripcion,
            fotoPerfilUrl: u.fotoPerfilUrl,
            perfil: u.perfil,
            deshabilitado: false,
            eliminado: false,
          });
          this.logger.log(
            `Usuario de prueba precargado: ${u.nombreUsuario} (${u.perfil})`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error al verificar o precargar usuario ${u.nombreUsuario}:`,
          error,
        );
      }
    }
  }

  async verificarDisponibilidad(
    correo: string,
    nombreUsuario: string,
  ): Promise<void> {
    const correoNormalizado = correo.trim().toLowerCase();
    const usuarioNormalizado = nombreUsuario.trim().toLowerCase();

    const existente = await this.usuarioModel
      .findOne({
        $or: [
          { correo: correoNormalizado },
          { nombreUsuario: usuarioNormalizado },
        ],
      })
      .exec();

    if (existente) {
      if (existente.correo === correoNormalizado) {
        throw new ConflictException(
          'El correo electrónico ya se encuentra registrado',
        );
      }
      throw new ConflictException(
        'El nombre de usuario ya se encuentra en uso',
      );
    }
  }

  async crear(datos: CrearUsuarioDatos): Promise<UsuarioDocument> {
    try {
      const nuevoUsuario = new this.usuarioModel({
        ...datos,
        correo: datos.correo.trim().toLowerCase(),
        nombreUsuario: datos.nombreUsuario.trim().toLowerCase(),
      });
      return await nuevoUsuario.save();
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      if (err?.code === 11000) {
        throw new ConflictException(
          'El correo electrónico o nombre de usuario ya se encuentra registrado',
        );
      }
      throw new BadRequestException(
        err?.message ?? 'No se pudo guardar el usuario en la base de datos',
      );
    }
  }

  async buscarPorIdentificador(
    identificador: string,
  ): Promise<UsuarioDocument | null> {
    const valorNormalizado = identificador.trim().toLowerCase();
    return this.usuarioModel
      .findOne({
        $or: [
          { correo: valorNormalizado },
          { nombreUsuario: valorNormalizado },
        ],
      })
      .exec();
  }
}

