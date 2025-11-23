import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ReservationsService } from './reservations.service';
import {
  CancelInput,
  CancelResponse,
  ReserveInput,
  ReserveResponse,
} from '@/types/gql';

@Resolver('Reservation')
export class ReservationsResolver {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Mutation('reserve')
  reserve(@Args('input') input: ReserveInput): Promise<ReserveResponse> {
    return this.reservationsService.reserve(input);
  }

  @Mutation('cancel')
  cancel(@Args('input') input: CancelInput): Promise<CancelResponse> {
    return this.reservationsService.cancel(input);
  }
}
