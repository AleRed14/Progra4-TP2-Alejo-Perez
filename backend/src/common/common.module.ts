import { Module } from '@nestjs/common';
import { ImagenesService } from './services/imagenes.service.js';

@Module({
  providers: [ImagenesService],
  exports: [ImagenesService],
})
export class CommonModule {}

