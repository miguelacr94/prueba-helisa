import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { DomainException } from '../../modules/accounts/domain/exceptions/account-domain.exception.js';

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
      errorCode = exception.code;
      message = exception.message;

      switch (exception.code) {
        case 'ACCOUNT_ALREADY_EXISTS':
          status = HttpStatus.CONFLICT;
          break;
        case 'PARENT_ACCOUNT_NOT_FOUND':
          status = HttpStatus.UNPROCESSABLE_ENTITY;
          break;
        case 'ACCOUNT_NOT_FOUND':
          status = HttpStatus.NOT_FOUND;
          break;
        case 'ACCOUNT_HAS_CHILDREN':
        case 'INVALID_ACCOUNT_CODE':
        case 'INVALID_ACCOUNT_NAME':
        case 'INVALID_ACCOUNT_NATURE':
        default:
          status = HttpStatus.BAD_REQUEST;
          break;
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const body = res as Record<string, unknown>;
        const rawMessage = body['message'];
        if (Array.isArray(rawMessage)) {
          message = 'Error de validación en la solicitud.';
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

