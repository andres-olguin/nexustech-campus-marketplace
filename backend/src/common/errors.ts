import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

@Catch()
export class ErrorsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorsFilter.name);
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    let statusCode = 500;
    let message: string | string[] = 'Error interno';
    let label = 'Internal Server Error';
    if (error instanceof HttpException) {
      statusCode = error.getStatus();
      const body = error.getResponse();
      message = typeof body === 'string' ? body : (body as { message: string | string[] }).message;
      label = error.name;
    } else if (error instanceof QueryFailedError) {
      const code = (error.driverError as { code?: string }).code;
      if (['23505', '23503', '23514', '40001', '40P01'].includes(code || '')) {
        statusCode = 409; message = 'Conflicto de integridad, inventario o concurrencia'; label = 'Conflict';
      }
    }
    if (statusCode === 500) this.logger.error('Unhandled request failure', error instanceof Error ? error.stack : undefined);
    response.status(statusCode).json({ statusCode, message, error: label });
  }
}
