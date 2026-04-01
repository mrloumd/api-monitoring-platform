import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';
import { RequestLogModule } from '../request-log/request-log.module';

@Module({
  imports: [RequestLogModule],
  controllers: [DemoController],
  providers: [LoggingInterceptor],
})
export class DemoModule {}
