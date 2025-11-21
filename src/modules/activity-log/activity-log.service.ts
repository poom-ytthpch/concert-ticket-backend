import { PrismaService } from '../../common/prisma/prisma.service';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateActivityLogDto } from './dto/activity-log.dto';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(private readonly repos: PrismaService) {}

  async create(input: CreateActivityLogDto) {
    try {
      return await this.repos.activityLog.create({
        data: {
          userId: input.userId,
          concertId: input.concertId,
          action: input.action,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
