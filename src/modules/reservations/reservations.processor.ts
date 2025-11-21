import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('reservation')
export class ReservationsProcessor extends WorkerHost {
  async process(job: Job<any>): Promise<any> {
    if (job.name === 'reserve-seat') {
      console.log('Processing reserve:', job.data);
    }

    if (job.name === 'cancel-seat') {
      console.log('Processing cancel:', job.data);
    }

    return true;
  }
}
