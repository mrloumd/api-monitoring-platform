import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestLogController } from './request-log.controller';
import { RequestLogService } from './request-log.service';
import { RequestLogSchema } from './schemas/request-log.schema';
import { REQUEST_LOG_MODEL } from '../common/constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: REQUEST_LOG_MODEL, schema: RequestLogSchema },
    ]),
  ],
  controllers: [RequestLogController],
  providers: [RequestLogService],
  exports: [RequestLogService, MongooseModule],
})
export class RequestLogModule {}
