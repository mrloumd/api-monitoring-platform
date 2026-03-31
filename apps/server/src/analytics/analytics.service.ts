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
          totalRequests: { $sum: 1 },
          totalErrors: {
            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] },
          },
          avgResponseTime: { $avg: '$responseTime' },
        },
      },
    ]);

    if (!result.length) {
      return { totalRequests: 0, totalErrors: 0, errorRate: 0, avgResponseTime: 0 };
    }

    const { totalRequests, totalErrors, avgResponseTime } = result[0];
    return {
      totalRequests,
      totalErrors,
      errorRate:
        totalRequests > 0
          ? parseFloat(((totalErrors / totalRequests) * 100).toFixed(2))
          : 0,
      avgResponseTime: parseFloat((avgResponseTime ?? 0).toFixed(2)),
    };
  }

  async getStatusCodeDistribution() {
    const result = await this.requestLogModel.aggregate([
      { $group: { _id: '$statusCode', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const total = result.reduce((sum, r) => sum + r.count, 0);
    return result.map((r) => ({
      statusCode: r._id,
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
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          endpoint: '$_id',
          avgResponseTime: { $round: ['$avgResponseTime', 2] },
          minResponseTime: 1,
          maxResponseTime: 1,
          count: 1,
        },
      },
      { $sort: { avgResponseTime: -1 } },
      { $limit: 10 },
    ]);
  }

  async getTopEndpoints() {
    return this.requestLogModel.aggregate([
      {
        $group: {
          _id: { endpoint: '$endpoint', method: '$method' },
          count: { $sum: 1 },
          errorCount: {
            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] },
          },
          avgResponseTime: { $avg: '$responseTime' },
        },
      },
      {
        $project: {
          _id: 0,
          endpoint: '$_id.endpoint',
          method: '$_id.method',
          count: 1,
          errorCount: 1,
          avgResponseTime: { $round: ['$avgResponseTime', 2] },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
  }

  async getErrors(limit = 50) {
    return this.requestLogModel
      .find({ statusCode: { $gte: 400 } })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean()
      .exec();
  }

  async getTrends(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.requestLogModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          errors: {
            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] },
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
