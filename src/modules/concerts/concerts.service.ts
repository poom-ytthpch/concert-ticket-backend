import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateConcertInput, CreateConcertResponse } from '@/types/gql';
import { GqlContext } from '@/types/gql-context';
import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class ConcertsService {
  constructor(private readonly repos: PrismaService) {}

  async create(
    input: CreateConcertInput,
    ctx: GqlContext,
  ): Promise<CreateConcertResponse> {
    try {
      const createdConcert = await this.repos.concert.create({
        data: {
          name: input.name,
          description: input.description,
          totalSeats: input.totalSeats,
          seatsAvailable: input.seatsAvailable,
          createdBy: ctx.req.user?.username,
        },
      });

      return {
        status: true,
        message: 'Concert created successfully',
        data: createdConcert,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
