import { Resolver } from '@nestjs/graphql';
import { ActivityLogService } from './activity-log.service';

@Resolver('ActivityLog')
export class ActivityLogResolver {
  constructor(private readonly activityLogService: ActivityLogService) {}
}
