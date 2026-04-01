import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get overall platform analytics summary' })
  getSummary() {
    return this.analyticsService.getSummary();
  }

  @Get('status-codes')
  @ApiOperation({ summary: 'Get request distribution by HTTP status code' })
  getStatusCodes() {
    return this.analyticsService.getStatusCodeDistribution();
  }

  @Get('response-times')
  @ApiOperation({ summary: 'Get average, min, and max response times by endpoint' })
  getResponseTimes() {
    return this.analyticsService.getResponseTimeStats();
  }

  @Get('top-endpoints')
  @ApiOperation({ summary: 'Get the most frequently called endpoints' })
  getTopEndpoints() {
    return this.analyticsService.getTopEndpoints();
  }

  @Get('errors')
  @ApiOperation({ summary: 'Get recent error-level request logs (4xx/5xx)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  getErrors(@Query('limit') limit?: number) {
    return this.analyticsService.getErrors(limit);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get daily request volume trends over a time range' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 7 })
  getTrends(@Query('days') days?: number) {
    return this.analyticsService.getTrends(days ? Number(days) : 7);
  }
}
