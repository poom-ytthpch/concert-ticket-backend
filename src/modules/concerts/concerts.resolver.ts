import { Resolver } from '@nestjs/graphql';
import { ConcertsService } from './concerts.service';

@Resolver('Concert')
export class ConcertsResolver {
  constructor(private readonly concertsService: ConcertsService) {}
}
