import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './modules/common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // MongoDB connection logs
  const green = '\x1b[32m';
  const red = '\x1b[31m';
  const yellow = '\x1b[33m';
  const reset = '\x1b[0m';

  const mongoConnection = app.get<Connection>(getConnectionToken());

  if (mongoConnection.readyState === 1) {
    console.log(`${green}[MongoDB] Connected to DB${reset}`);
  }

  mongoConnection.on('connected', () => {
    console.log(`${green}[MongoDB] Connected to DB${reset}`);
  });
  mongoConnection.on('disconnected', () => {
    console.warn(`${yellow}[MongoDB] Disconnected${reset}`);
  });
  mongoConnection.on('error', (err: Error) => {
    console.error(`${red}[MongoDB] Error: ${err.message}${reset}`);
  });

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('APIFlow')
    .setDescription(
      'Backend API for APIFlow — an observability platform that tracks request logs across ApiFlowDev and ApiFlowProd collections, computes real-time analytics, and exposes endpoint performance data.',
    )
    .setVersion('1.0')
    .addTag('request-logs', 'Manage and query API request logs')
    .addTag('analytics', 'Compute analytics and aggregated metrics')
    .addTag('health', 'System health check')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`\n🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs\n`);
}

bootstrap();
