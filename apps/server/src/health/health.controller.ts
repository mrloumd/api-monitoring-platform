import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @ApiOperation({ summary: 'System health check' })
  check() {
    const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        status: dbState[this.connection.readyState] ?? 'unknown',
        ready: this.connection.readyState === 1,
      },
      uptime: Math.floor(process.uptime()),
      version: '1.0.0',
    };
  }
}
