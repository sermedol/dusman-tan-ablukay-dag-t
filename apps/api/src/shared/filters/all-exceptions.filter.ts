import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
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
}
