import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryRequestLogDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] })
  @IsEnum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
  @IsOptional()
  method?: string;

  @ApiPropertyOptional({ example: '/api/users' })
  @IsString()
  @IsOptional()
  endpoint?: string;

  @ApiPropertyOptional({ example: 404 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  statusCode?: number;

  @ApiPropertyOptional({ enum: ['dev', 'staging', 'prod'] })
  @IsEnum(['dev', 'staging', 'prod'])
  @IsOptional()
  environment?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 'users' })
  @IsString()
  @IsOptional()
  search?: string;
}
