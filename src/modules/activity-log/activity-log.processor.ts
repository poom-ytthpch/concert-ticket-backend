import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ActivityLogService } from './activity-log.service';
import { Logger } from '@nestjs/common';

@Processor('activityLog')
export class ActivityLogProcessor extends WorkerHost {
  private readonly logger = new Logger(ActivityLogProcessor.name);

  constructor(private readonly activityLogService: ActivityLogService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    if (job.name === 'create-activity-log') {
      this.logger.log('activityLog job', job);

      await this.activityLogService.create({
        userId: job.data.userId,
        concertId: job.data.concertId,
        action: job.data.action,
        adminId: job.data.adminId,
      });
    }

    return true;
  }
}
