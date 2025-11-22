import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ReservationsService } from './reservations.service';
import { ConcertsService } from '../concerts/concerts.service';
import { ReservationStatus } from '@prisma/client';
import { Logger } from '@nestjs/common';

@Processor('reservation')
export class ReservationsProcessor extends WorkerHost {
  private readonly logger = new Logger(ReservationsProcessor.name);

  constructor(
    private readonly concertService: ConcertsService,
    private readonly reservationsService: ReservationsService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    if (job.name === 'reserve-seat') {
      this.logger.log('reserve-seat job', job);

      const concert = await this.concertService.findOne(job.data.concertId);

      let status: ReservationStatus;

      if (concert.seatsAvailable > 0) {
        status = ReservationStatus.RESERVED;
        await this.concertService.updateSeat({
          concertId: concert.id,
          isReserved: true,
        });
      } else {
        status = ReservationStatus.SOLD_OUT;
      }

      await this.reservationsService.updateStatus({
        id: job.data.reservationId,
        status,
      });
    }

    if (job.name === 'cancel-seat') {
      this.logger.log('ancel-seat', job);

      await this.reservationsService.updateStatus({
        id: job.data.reservationId,
        status: 'CANCELLED',
      });

      await this.concertService.updateSeat({
        concertId: job.data.concertId,
        isReserved: false,
      });
    }

    return true;
  }
}
