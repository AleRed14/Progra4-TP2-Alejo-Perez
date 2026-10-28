import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { LoginService } from './login.service.js';
import { CommonService } from '../common/common.service.js';
import { UsuariosService } from '../../usuarios/usuarios.service.js';

describe('LoginService', () => {
  let loginService: LoginService;
  let authCommonService: CommonService;
  let usuariosServiceMock: {
    buscarPorIdentificador: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authCommonService = new CommonService();
    usuariosServiceMock = {
      buscarPorIdentificador: vi.fn(),
    };

    loginService = new LoginService(
      usuariosServiceMock as unknown as UsuariosService,
      authCommonService,
    );
  });

  it('debe permitir el login con credenciales válidas y devolver todos los datos sin password', async () => {
    const hash = await authCommonService.encriptarPassword('Password123');
    usuariosServiceMock.buscarPorIdentificador.mockResolvedValue({
      _id: '654321abcdef0123456789ab',
      nombre: 'Alejo',
      apellido: 'Perez',
      correo: 'alejo@utn.edu.ar',
      nombreUsuario: 'alejoperez',
      password: hash,
      perfil: 'usuario',
      deshabilitado: false,
      eliminado: false,
      toObject() {
        return {
          _id: '654321abcdef0123456789ab',
          nombre: 'Alejo',
          apellido: 'Perez',
          correo: 'alejo@utn.edu.ar',
          nombreUsuario: 'alejoperez',
          password: hash,
          perfil: 'usuario',
          deshabilitado: false,
          eliminado: false,
        };
      },
    });

    const resultado = await loginService.login({
      identificador: 'alejoperez',
      password: 'Password123',
    });

    expect(resultado.mensaje).toBe('Inicio de sesión exitoso');
    expect(resultado.usuario).not.toHaveProperty('password');
    expect(resultado.usuario.nombreUsuario).toBe('alejoperez');
  });

  it('debe rechazar con 401 si la contraseña es incorrecta', async () => {
    const hash = await authCommonService.encriptarPassword('Password123');
    usuariosServiceMock.buscarPorIdentificador.mockResolvedValue({
      correo: 'alejo@utn.edu.ar',
      nombreUsuario: 'alejoperez',
      password: hash,
      deshabilitado: false,
      eliminado: false,
    });

    await expect(
      loginService.login({
        identificador: 'alejoperez',
        password: 'OtraPassword999',
      }),
    ).rejects.toThrow(
      new UnauthorizedException('Las credenciales no son correctas'),
    );
  });

  it('debe rechazar con 401 y mensaje específico si el usuario está deshabilitado', async () => {
    const hash = await authCommonService.encriptarPassword('Password123');
    usuariosServiceMock.buscarPorIdentificador.mockResolvedValue({
      correo: 'alejo@utn.edu.ar',
      nombreUsuario: 'alejoperez',
      password: hash,
      deshabilitado: true,
      eliminado: false,
    });

    await expect(
      loginService.login({
        identificador: 'alejoperez',
        password: 'Password123',
      }),
    ).rejects.toThrow(
      new UnauthorizedException(
        'Tu cuenta se encuentra deshabilitada temporalmente',
      ),
    );
  });
});

