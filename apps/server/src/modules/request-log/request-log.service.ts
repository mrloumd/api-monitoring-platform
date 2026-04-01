import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestLog, RequestLogDocument } from './schemas/request-log.schema';
import { CreateRequestLogDto } from './dto/create-request-log.dto';
import { QueryRequestLogDto } from './dto/query-request-log.dto';
import { REQUEST_LOG_MODEL } from '../common/constants';

@Injectable()
export class RequestLogService {
  constructor(
    @InjectModel(REQUEST_LOG_MODEL)
    private readonly requestLogModel: Model<RequestLogDocument>,
  ) {}

  async create(dto: CreateRequestLogDto): Promise<RequestLog> {
    const log = new this.requestLogModel(dto);
    return log.save();
  }

  async findAll(query: QueryRequestLogDto) {
    const {
      page = 1,
      limit = 20,
      method,
      endpoint,
      statusCode,
      environment,
      startDate,
      endDate,
      search,
    } = query;

    const filter: Record<string, any> = {};
    if (method) filter.method = method;
    if (statusCode) filter.statusCode = statusCode;
    if (environment) filter.environment = environment;
    if (endpoint) filter.endpoint = { $regex: endpoint, $options: 'i' };
    if (search) {
      filter.$or = [
        { endpoint: { $regex: search, $options: 'i' } },
        { errorMessage: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.requestLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
      this.requestLogModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<RequestLog> {
    const log = await this.requestLogModel.findById(id).lean().exec();
    if (!log) throw new NotFoundException(`Request log with id "${id}" not found`);
    return log;
  }
}
