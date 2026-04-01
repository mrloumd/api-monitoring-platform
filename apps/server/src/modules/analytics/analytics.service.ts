import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestLogDocument } from '../request-log/schemas/request-log.schema';
import { REQUEST_LOG_MODEL } from '../common/constants';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(REQUEST_LOG_MODEL)
    private readonly requestLogModel: Model<RequestLogDocument>,
  ) {}

  async getSummary() {
    const result = await this.requestLogModel.aggregate([
      {
        $group: {
          _id: null,
          total_requests: { $sum: 1 },
          total_errors: {
            $sum: { $cond: [{ $gte: ['$status_code', 400] }, 1, 0] },
          },
          avg_response_time: { $avg: '$response_time' },
        },
      },
    ]);

    if (!result.length) {
      return { total_requests: 0, total_errors: 0, error_rate: 0, avg_response_time: 0 };
    }

    const { total_requests, total_errors, avg_response_time } = result[0];
    return {
      total_requests,
      total_errors,
      error_rate:
        total_requests > 0
          ? parseFloat(((total_errors / total_requests) * 100).toFixed(2))
          : 0,
      avg_response_time: parseFloat((avg_response_time ?? 0).toFixed(2)),
    };
  }

  async getStatusCodeDistribution() {
    const result = await this.requestLogModel.aggregate([
      { $group: { _id: '$status_code', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const total = result.reduce((sum, r) => sum + r.count, 0);
    return result.map((r) => ({
      status_code: r._id,
      count: r.count,
      percentage:
        total > 0 ? parseFloat(((r.count / total) * 100).toFixed(2)) : 0,
    }));
  }

  async getResponseTimeStats() {
    return this.requestLogModel.aggregate([
      {
        $group: {
          _id: '$endpoint',
          avg_response_time: { $avg: '$response_time' },
          min_response_time: { $min: '$response_time' },
          max_response_time: { $max: '$response_time' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          endpoint: '$_id',
          avg_response_time: { $round: ['$avg_response_time', 2] },
          min_response_time: 1,
          max_response_time: 1,
          count: 1,
        },
      },
      { $sort: { avg_response_time: -1 } },
      { $limit: 10 },
    ]);
  }

  async getTopEndpoints() {
    return this.requestLogModel.aggregate([
      {
        $group: {
          _id: { endpoint: '$endpoint', method: '$method' },
          count: { $sum: 1 },
          error_count: {
            $sum: { $cond: [{ $gte: ['$status_code', 400] }, 1, 0] },
          },
          avg_response_time: { $avg: '$response_time' },
        },
      },
      {
        $project: {
          _id: 0,
          endpoint: '$_id.endpoint',
          method: '$_id.method',
          count: 1,
          error_count: 1,
          avg_response_time: { $round: ['$avg_response_time', 2] },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
  }

  async getErrors(limit = 50) {
    return this.requestLogModel
      .find({ status_code: { $gte: 400 } })
      .sort({ created_at: -1 })
      .limit(Number(limit))
      .lean()
      .exec();
  }

  async getTrends(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.requestLogModel.aggregate([
      { $match: { created_at: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          total: { $sum: 1 },
          errors: {
            $sum: { $cond: [{ $gte: ['$status_code', 400] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', total: 1, errors: 1 } },
    ]);

    const dateMap = new Map(result.map((r) => [r.date, r]));
    const filled: { date: string; total: number; errors: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      filled.push(dateMap.get(dateStr) ?? { date: dateStr, total: 0, errors: 0 });
    }

    return filled;
  }
}
