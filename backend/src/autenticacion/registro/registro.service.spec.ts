import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException } from '@nestjs/common';
import { RegistroService } from './registro.service.js';
import { CommonService } from '../common/common.service.js';
import { UsuariosService } from '../../usuarios/usuarios.service.js';
import { ImagenesService } from '../../common/services/imagenes.service.js';

describe('RegistroService', () => {
  let registroService: RegistroService;
  let authCommonService: CommonService;
  let usuariosServiceMock: {
    verificarDisponibilidad: ReturnType<typeof vi.fn>;
    crear: ReturnType<typeof vi.fn>;
  };
  let imagenesServiceMock: {
    uploadFile: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authCommonService = new CommonService();
    usuariosServiceMock = {
      verificarDisponibilidad: vi.fn().mockResolvedValue(undefined),
      crear: vi.fn().mockImplementation(async (datos) => ({
        _id: '654321abcdef0123456789ab',
        ...datos,
        deshabilitado: false,
        eliminado: false,
        toObject() {
          return {
            _id: '654321abcdef0123456789ab',
            ...datos,
            deshabilitado: false,
            eliminado: false,
          };
        },
      })),
    };
    imagenesServiceMock = {
      uploadFile: vi
        .fn()
        .mockResolvedValue('https://res.cloudinary.com/demo/image/upload/avatar.jpg'),
    };

    registroService = new RegistroService(
      usuariosServiceMock as unknown as UsuariosService,
      authCommonService,
      imagenesServiceMock as unknown as ImagenesService,
    );
  });

  it('debe registrar un usuario con contraseña encriptada y subir la imagen a Cloudinary', async () => {
    const dto = {
      nombre: 'Alejo',
      apellido: 'Perez',
      correo: 'alejo@utn.edu.ar',
      nombreUsuario: 'alejoperez',
      password: 'Password123',
      fechaNacimiento: new Date('2000-05-15'),
      descripcion: 'Amante de los perros',
    };

    const mockFile = {
      originalname: 'mi-perro.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('fake-image'),
    } as Express.Multer.File;

    const resultado = await registroService.create(dto, mockFile);

    expect(usuariosServiceMock.verificarDisponibilidad).toHaveBeenCalledWith(
      'alejo@utn.edu.ar',
      'alejoperez',
    );
    expect(imagenesServiceMock.uploadFile).toHaveBeenCalledWith(
      mockFile,
      'perfiles',
    );
    expect(usuariosServiceMock.crear).toHaveBeenCalledTimes(1);

    const argumentoCrear = usuariosServiceMock.crear.mock.calls[0][0];
    expect(argumentoCrear.password).not.toBe('Password123');
    expect(argumentoCrear.password.startsWith('$2b$10$')).toBe(true);
    expect(argumentoCrear.fotoPerfilUrl).toBe(
      'https://res.cloudinary.com/demo/image/upload/avatar.jpg',
    );
    expect(argumentoCrear.perfil).toBe('usuario');

    expect(resultado.mensaje).toBe('Usuario registrado con éxito');
    expect(resultado.usuario).not.toHaveProperty('password');
    expect(resultado.usuario.correo).toBe('alejo@utn.edu.ar');
  });

  it('debe lanzar ConflictException (409) si el correo o usuario ya existe', async () => {
    usuariosServiceMock.verificarDisponibilidad.mockRejectedValueOnce(
      new ConflictException('El correo electrónico ya se encuentra registrado'),
    );

    const dto = {
      nombre: 'Alejo',
      apellido: 'Perez',
      correo: 'duplicado@utn.edu.ar',
      nombreUsuario: 'alejoperez',
      password: 'Password123',
      fechaNacimiento: new Date('2000-05-15'),
    };

    await expect(registroService.create(dto)).rejects.toThrow(
      ConflictException,
    );
    expect(imagenesServiceMock.uploadFile).not.toHaveBeenCalled();
  });
});

