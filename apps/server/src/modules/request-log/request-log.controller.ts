import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestLogService } from './request-log.service';
import { CreateRequestLogDto } from './dto/create-request-log.dto';
import { QueryRequestLogDto } from './dto/query-request-log.dto';

@ApiTags('request-logs')
@Controller('request-logs')
export class RequestLogController {
  constructor(private readonly requestLogService: RequestLogService) {}

  @Post()
  @ApiOperation({ summary: 'Ingest a new API request log entry' })
  @ApiResponse({ status: 201, description: 'Log entry created successfully' })
  create(@Body() dto: CreateRequestLogDto) {
    return this.requestLogService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated request logs with optional filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of request logs' })
  findAll(@Query() query: QueryRequestLogDto) {
    return this.requestLogService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single request log by ID' })
  @ApiResponse({ status: 200, description: 'Request log detail' })
  @ApiResponse({ status: 404, description: 'Log not found' })
  findOne(@Param('id') id: string) {
    return this.requestLogService.findOne(id);
  }
}
