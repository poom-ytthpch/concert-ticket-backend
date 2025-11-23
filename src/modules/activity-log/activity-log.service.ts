import { PrismaService } from '../../common/prisma/prisma.service';
import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateActivityLogDto } from './dto/activity-log.dto';
import { ActivityLogGql, ActivityLogsInput } from '@/types/gql';
import { GqlContext } from '@/types/gql-context';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(
    private readonly repos: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(input: CreateActivityLogDto) {
    try {
      return await this.repos.activityLog.create({
        data: {
          userId: input.userId,
          concertId: input.concertId,
          action: input.action,
          adminId: input.adminId,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async findAll(
    input: ActivityLogsInput,
    ctx: GqlContext,
  ): Promise<ActivityLogGql[]> {
    try {
      const userId = ctx.req.user?.id;
      const take = input?.take || 10;
      const skip = input?.skip || 0;

      const cacheKey = `activity_logs:${userId}:take=${take}:skip=${skip}`;

      const cached = await this.cacheManager.get<ActivityLogGql[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const activityLogs = await this.repos.activityLog.findMany({
        where: { adminId: userId },
        select: {
          createdAt: true,
          user: {
            select: {
              username: true,
            },
          },
          concert: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      });

      await this.cacheManager.set(cacheKey, activityLogs);

      return activityLogs;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
