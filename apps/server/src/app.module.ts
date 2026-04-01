import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestLogModule } from './modules/request-log/request-log.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthModule } from './modules/health/health.module';
import { DemoModule } from './modules/demo/demo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || '', {
      dbName: process.env.MONGODB_DB_NAME ?? 'ApiFlowDev',
    }),
    RequestLogModule,
    AnalyticsModule,
    HealthModule,
    DemoModule,
  ],
})
export class AppModule {}
