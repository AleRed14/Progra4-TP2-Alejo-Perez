import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LoginService } from './login.service.js';
import { CreateLoginDto } from './dto/create-login.dto.js';

@Controller('autenticacion/login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  login(@Body() createLoginDto: CreateLoginDto) {
    return this.loginService.login(createLoginDto);
  }
}
