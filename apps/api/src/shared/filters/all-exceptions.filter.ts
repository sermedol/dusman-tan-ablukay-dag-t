import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response, Request } from 'express';

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta: {
    timestamp: string;
    requestId: string;
    path: string;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Global filter registration order in main.ts does not guarantee
    // HttpExceptionFilter (the more specific @Catch(HttpException) filter)
    // wins over this catch-all - in practice both filters can be invoked for
    // the same HttpException, which previously reported every
    // NotFoundException/BadRequestException/etc. as a 500. Delegate to the
    // exception's real status/response instead of hardcoding 500 here.
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse
          ? (exceptionResponse as { message: string | string[] }).message
          : exception.message;

      response.status(status).json({
        success: false,
        error: {
          code: this.getErrorCode(status),
          message: Array.isArray(message) ? message.join('; ') : message,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: request.id || 'unknown',
          path: request.url,
        },
      });
      return;
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let details: Record<string, any> | undefined;

    if (exception instanceof Error) {
      message = exception.message;
      if (process.env.NODE_ENV === 'development') {
        details = {
          name: exception.name,
          stack: exception.stack,
        };
      }
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack
      );
    } else {
      this.logger.error('Unhandled non-Error exception:', exception);
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: request.id || 'unknown',
        path: request.url,
      },
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
    };

    return codeMap[status] || 'UNKNOWN_ERROR';
  }
}
