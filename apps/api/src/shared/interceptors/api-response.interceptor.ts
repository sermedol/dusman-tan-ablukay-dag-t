import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response, Request } from 'express';

interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiSuccessResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode;

        // Only wrap with standard response format for status codes we want to format
        // 204 No Content doesn't need a body
        if (statusCode === 204) {
          return data;
        }

        return {
          success: true,
          data: data || null,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: request.id || 'unknown',
            version: '1.0',
          },
        } as ApiSuccessResponse<T>;
      })
    );
  }
}
