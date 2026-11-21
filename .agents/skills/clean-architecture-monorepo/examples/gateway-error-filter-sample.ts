import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { DomainException } from './account-entity-sample';
import {
  AccountAlreadyExistsException,
  ParentAccountNotFoundException,
} from './use-case-sample';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
    path: string;
  };
}

/**
 * FILTRO CENTRALIZADO DEL API GATEWAY
 * Atrapa todas las excepciones (de dominio, de validación HTTP y errores de servidor)
 * y las formatea en una respuesta uniforme.
 */
@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GatewayExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'Ha ocurrido un error inesperado en el servidor.';
    let details: unknown = null;

    if (exception instanceof DomainException) {
      if (exception instanceof AccountAlreadyExistsException) {
        status = HttpStatus.CONFLICT;
        errorCode = 'ACCOUNT_ALREADY_EXISTS';
      } else if (exception instanceof ParentAccountNotFoundException) {
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        errorCode = 'PARENT_ACCOUNT_NOT_FOUND';
      } else {
        status = HttpStatus.BAD_REQUEST;
        errorCode = 'DOMAIN_RULE_VIOLATION';
      }
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, unknown>;
        const rawMessage = body['message'];
        if (Array.isArray(rawMessage)) {
          message = 'Error de validación en los datos de entrada.';
          details = rawMessage;
        } else if (typeof rawMessage === 'string') {
          message = rawMessage;
        } else {
          message = exception.message;
        }

        const rawError = body['error'];
        errorCode =
          typeof rawError === 'string'
            ? rawError.toUpperCase().replace(/\s+/g, '_')
            : 'HTTP_ERROR';
      } else {
        message = exception.message;
        errorCode = 'HTTP_EXCEPTION';
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Error no controlado: ${exception.message}`, exception.stack);
      message = exception.message;
    }

    const errorPayload: ApiErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        details,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    response.status(status).json(errorPayload);
  }
}

