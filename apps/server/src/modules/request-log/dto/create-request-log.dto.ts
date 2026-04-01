import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRequestLogDto {
  @ApiProperty({ enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], example: 'GET' })
  @IsEnum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
  method: string;

  @ApiProperty({ example: '/api/users' })
  @IsString()
  endpoint: string;

  @ApiProperty({ example: 200, minimum: 100, maximum: 599 })
  @IsNumber()
  @Min(100)
  @Max(599)
  status_code: number;

  @ApiProperty({ example: 145, description: 'Response time in milliseconds' })
  @IsNumber()
  @Min(0)
  response_time: number;

  @ApiProperty({ example: '192.168.1.1' })
  @IsString()
  ip_address: string;

  @ApiProperty({ example: 'Mozilla/5.0 (compatible)' })
  @IsString()
  user_agent: string;

  @ApiProperty({ enum: ['dev', 'staging', 'prod'], default: 'prod' })
  @IsEnum(['dev', 'staging', 'prod'])
  environment: string;

  @ApiPropertyOptional({ example: 'User not found' })
  @IsString()
  @IsOptional()
  error_message?: string;
}
