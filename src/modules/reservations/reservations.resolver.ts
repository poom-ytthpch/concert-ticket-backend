import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ReservationsService } from './reservations.service';
import { ReserveInput, ReserveResponse } from '@/types/gql';

@Resolver('Reservation')
export class ReservationsResolver {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Mutation('reserve')
  reserve(@Args('input') input: ReserveInput): Promise<ReserveResponse> {
    return this.reservationsService.reserve(input);
  }
}
