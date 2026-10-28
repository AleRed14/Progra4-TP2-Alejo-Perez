import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { parse } from 'path';

@Injectable()
export class ImagenesService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  uploadFile(
    file: Express.Multer.File,
    folder = 'perfiles',
  ): Promise<string> {
    if (!file.mimetype.match(/^image\/(jpe?g|png|webp)$/i)) {
      throw new BadRequestException(
        'El archivo debe ser una imagen válida (.jpg, .jpeg, .png o .webp)',
      );
    }

    // Reasegurar configuración en caso de que ConfigModule haya cargado después de instanciar
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `${parse(file.originalname).name}-${Date.now()}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            return reject(
              new InternalServerErrorException(
                'No se pudo subir la imagen al servidor de almacenamiento',
              ),
            );
          }
          if (!result?.secure_url) {
            return reject(
              new InternalServerErrorException(
                'No se obtuvo la URL de la imagen subida',
              ),
            );
          }
          resolve(result.secure_url);
        },
      );

      stream.end(file.buffer);
    });
  }
}

