import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsResolver } from './reservations.resolver';
import { BullModule } from '@nestjs/bullmq';
import { ReservationsProcessor } from './reservations.processor';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ConcertsService } from '../concerts/concerts.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reservations',
    }),
  ],
  providers: [
    ReservationsResolver,
    ReservationsService,
    ReservationsProcessor,
    PrismaService,
    ConcertsService,
  ],
})
export class ReservationsModule {}
