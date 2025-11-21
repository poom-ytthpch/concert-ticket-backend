import { Module } from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { ConcertsResolver } from './concerts.resolver';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UserService } from '../user/user.service';

@Module({
  providers: [ConcertsResolver, ConcertsService, PrismaService, UserService],
})
export class ConcertsModule {}
