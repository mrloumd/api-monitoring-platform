import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RequestLogDocument = RequestLog & Document;

@Schema({ timestamps: true })
export class RequestLog {
  @Prop({ required: true, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] })
  method: string;

  @Prop({ required: true })
  endpoint: string;

  @Prop({ required: true, min: 100, max: 599 })
  statusCode: number;

  @Prop({ required: true, min: 0 })
  responseTime: number;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ required: true, enum: ['dev', 'staging', 'prod'], default: 'prod' })
  environment: string;

  @Prop({ default: null })
  errorMessage: string;
}

export const RequestLogSchema = SchemaFactory.createForClass(RequestLog);

// Indexes for query performance
RequestLogSchema.index({ createdAt: -1 });
RequestLogSchema.index({ endpoint: 1 });
RequestLogSchema.index({ statusCode: 1 });
RequestLogSchema.index({ method: 1 });
RequestLogSchema.index({ environment: 1 });
