import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RequestLogDocument = RequestLog & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class RequestLog {
  @Prop({ required: true, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] })
  method: string;

  @Prop({ required: true })
  endpoint: string;

  @Prop({ required: true, min: 100, max: 599 })
  status_code: number;

  @Prop({ required: true, min: 0 })
  response_time: number;

  @Prop({ required: true })
  ip_address: string;

  @Prop({ required: true })
  user_agent: string;

  @Prop({ required: true, enum: ['dev', 'staging', 'prod'], default: 'prod' })
  environment: string;

  @Prop({ default: null })
  error_message: string;
}

export const RequestLogSchema = SchemaFactory.createForClass(RequestLog);

// Indexes for query performance
RequestLogSchema.index({ created_at: -1 });
RequestLogSchema.index({ endpoint: 1 });
RequestLogSchema.index({ status_code: 1 });
RequestLogSchema.index({ method: 1 });
RequestLogSchema.index({ environment: 1 });
