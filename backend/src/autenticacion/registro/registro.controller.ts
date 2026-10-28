import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { RegistroService } from './registro.service.js';
import { CreateRegistroDto } from './dto/create-registro.dto.js';

@Controller('autenticacion/registro')
export class RegistroController {
  constructor(private readonly registroService: RegistroService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
    }),
  )
  create(
    @Body() createRegistroDto: CreateRegistroDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.registroService.create(createRegistroDto, file);
  }
}
