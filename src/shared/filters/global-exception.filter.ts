import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { QueryFailedError } from 'typeorm';

interface FilterErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    details?: string | Record<string, unknown>;
  };
}

interface HttpExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
  details?: string | Record<string, unknown>;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status: number;
    let message: string;
    let details: string | Record<string, unknown> | undefined;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const typedResponse = exceptionResponse as HttpExceptionResponse;
        message = Array.isArray(typedResponse.message)
          ? typedResponse.message.join(', ')
          : typedResponse.message || exception.message;
        details = typedResponse.details;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof QueryFailedError) {
      // Database query errors
      status = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';
      details =
        process.env.NODE_ENV !== 'production' ? exception.message : undefined;
    } else if (exception instanceof Error) {
      // Generic errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message =
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : exception.message;
      details =
        process.env.NODE_ENV !== 'production' ? exception.stack : undefined;
    } else {
      // Unknown errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    const errorResponse: FilterErrorResponse = {
      success: false,
      error: {
        message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        ...(details && { details }),
      },
    };

    // Log the error
    const logMessage = `${request.method} ${request.url} - ${status} - ${message}`;

    if (status >= 500) {
      this.logger.error(logMessage, exception);
    } else if (status >= 400) {
      this.logger.warn(logMessage);
    }

    response.status(status).send(errorResponse);
  }
}
