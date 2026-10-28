import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensaje: string | string[] =
      'Ocurrió un problema en nuestros servidores. Por favor, intentá nuevamente en unos minutos';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        mensaje = exceptionResponse;
        error = exception.name;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resObj = exceptionResponse as Record<string, unknown>;
        if (Array.isArray(resObj.message)) {
          mensaje = resObj.message.join('. ');
        } else if (typeof resObj.message === 'string') {
          mensaje = resObj.message;
        }
        if (typeof resObj.error === 'string') {
          error = resObj.error;
        }
      }
    }

    response.status(status).json({
      codigo: status,
      mensaje,
      error,
      fecha: new Date().toISOString(),
    });
  }
}

