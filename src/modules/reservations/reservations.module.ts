import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsResolver } from './reservations.resolver';
import { BullModule } from '@nestjs/bullmq';
import { ReservationsProcessor } from './reservations.processor';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ConcertsService } from '../concerts/concerts.service';
import { ActivityLogProcessor } from '../activity-log/activity-log.processor';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'reservations',
      },
      {
        name: 'activityLog',
      },
    ),
  ],
  providers: [
    ReservationsResolver,
    ReservationsService,
    ReservationsProcessor,
    ActivityLogProcessor,
    ActivityLogService,
    PrismaService,
    ConcertsService,
  ],
})
export class ReservationsModule {}
