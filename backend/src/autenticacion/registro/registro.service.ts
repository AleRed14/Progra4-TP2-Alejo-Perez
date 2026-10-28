import { Injectable } from '@nestjs/common';
import { CreateRegistroDto } from './dto/create-registro.dto.js';
import { UsuariosService } from '../../usuarios/usuarios.service.js';
import { CommonService } from '../common/common.service.js';
import { ImagenesService } from '../../common/services/imagenes.service.js';

@Injectable()
export class RegistroService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly authCommonService: CommonService,
    private readonly imagenesService: ImagenesService,
  ) {}

  async create(
    createRegistroDto: CreateRegistroDto,
    file?: Express.Multer.File,
  ) {
    await this.usuariosService.verificarDisponibilidad(
      createRegistroDto.correo,
      createRegistroDto.nombreUsuario,
    );

    let fotoPerfilUrl = 'assets/imagenes/avatar-defecto.png';
    if (file) {
      fotoPerfilUrl = await this.imagenesService.uploadFile(file, 'perfiles');
    }

    const passwordEncriptada = await this.authCommonService.encriptarPassword(
      createRegistroDto.password,
    );

    const usuarioCreado = await this.usuariosService.crear({
      nombre: createRegistroDto.nombre,
      apellido: createRegistroDto.apellido,
      correo: createRegistroDto.correo,
      nombreUsuario: createRegistroDto.nombreUsuario,
      password: passwordEncriptada,
      fechaNacimiento: createRegistroDto.fechaNacimiento,
      descripcion: createRegistroDto.descripcion ?? '',
      fotoPerfilUrl,
      perfil: createRegistroDto.perfil ?? 'usuario',
    });

    return {
      mensaje: 'Usuario registrado con éxito',
      usuario: this.authCommonService.sanitizarUsuario(usuarioCreado),
    };
  }
}
