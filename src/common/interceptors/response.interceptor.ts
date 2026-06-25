import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        const result: ApiResponse<T> = {
          success: true,
          statusCode,
          message: data?.message || 'Success',
          timestamp: new Date().toISOString(),
          path: request.url,
        };

        if (data?.data !== undefined) {
          result.data = data.data;
        } else if (data !== undefined && data?.message === undefined) {
          result.data = data;
        }

        if (data?.meta) {
          result.meta = data.meta;
        }

        return result;
      }),
    );
  }
}
