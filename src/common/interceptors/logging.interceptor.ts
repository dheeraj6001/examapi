import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, user } = req;
    const userInfo = user ? `[User: ${user.email} | Role: ${user.role}]` : '[Public]';
    const now = Date.now();

    this.logger.log(`→ ${method} ${url} ${userInfo}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          this.logger.log(`← ${method} ${url} ${res.statusCode} — ${Date.now() - now}ms`);
        },
        error: (err) => {
          this.logger.error(`✗ ${method} ${url} — ${Date.now() - now}ms — ${err.message}`);
        },
      }),
    );
  }
}
