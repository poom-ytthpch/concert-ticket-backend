import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ReservationsService } from './reservations.service';
import { ConcertsService } from '../concerts/concerts.service';
import { ReservationStatus } from '@prisma/client';

@Processor('reservation')
export class ReservationsProcessor extends WorkerHost {
  constructor(
    private readonly concertService: ConcertsService,
    private readonly reservationsService: ReservationsService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    if (job.name === 'reserve-seat') {
      console.log('Processing reserve:', job.data);

      const concert = await this.concertService.findOne(job.data.concertId);

      let status: ReservationStatus;

      if (concert.seatsAvailable > 0) {
        status = ReservationStatus.RESERVED;
      } else {
        status = ReservationStatus.SOLD_OUT;
      }

      await this.reservationsService.updateStatus({
        id: job.data.reservationId,
        status,
      });
    }

    if (job.name === 'cancel-seat') {
      console.log('Processing cancel:', job.data);

      await this.reservationsService.updateStatus({
        id: job.data.reservationId,
        status: 'CANCELLED',
      });
    }

    return true;
  }
}
