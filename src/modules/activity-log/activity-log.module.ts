import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogResolver } from './activity-log.resolver';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BullModule } from '@nestjs/bullmq';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'activityLog',
    }),
  ],
  providers: [
    ActivityLogResolver,
    ActivityLogService,
    PrismaService,
    UserService,
  ],
})
export class ActivityLogModule {}
