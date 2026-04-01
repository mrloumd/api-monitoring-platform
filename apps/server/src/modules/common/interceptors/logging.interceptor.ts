import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs';
import { Request, Response } from 'express';
import { RequestLogService } from '../../request-log/request-log.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly requestLogService: RequestLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
          this.save(req, res.statusCode, Date.now() - start, null);
        },
        error: (err: unknown) => {
          const status = err instanceof HttpException ? err.getStatus() : 500;
          const message = err instanceof Error ? err.message : 'Internal server error';
          this.save(req, status, Date.now() - start, message);
        },
      }),
    );
  }

  private save(
    req: Request,
    status_code: number,
    response_time: number,
    error_message: string | null,
  ): void {
    const dbName = process.env.MONGODB_DB_NAME ?? 'ApiFlowDev';
    const environment = dbName.includes('Prod') ? 'prod' : 'dev';

    this.requestLogService
      .create({
        method: req.method,
        endpoint: req.path,
        status_code,
        response_time,
        ip_address:
          (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1',
        user_agent: req.headers['user-agent'] || 'unknown',
        environment,
        error_message: error_message ?? undefined,
      })
      .catch(() => {});
  }
}
