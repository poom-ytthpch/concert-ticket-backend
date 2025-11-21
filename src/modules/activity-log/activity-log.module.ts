import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogResolver } from './activity-log.resolver';

@Module({
  providers: [ActivityLogResolver, ActivityLogService],
})
export class ActivityLogModule {}
