import { Module } from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { ConcertsResolver } from './concerts.resolver';

@Module({
  providers: [ConcertsResolver, ConcertsService],
})
export class ConcertsModule {}
