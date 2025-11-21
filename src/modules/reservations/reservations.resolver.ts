import { Resolver } from '@nestjs/graphql';
import { ReservationsService } from './reservations.service';

@Resolver('Reservation')
export class ReservationsResolver {
  constructor(private readonly reservationsService: ReservationsService) {}
}
