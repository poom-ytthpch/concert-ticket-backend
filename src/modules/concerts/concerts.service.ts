import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateConcertInput, CreateConcertResponse } from '@/types/gql';
import { GqlContext } from '@/types/gql-context';
import { HttpException, Injectable } from '@nestjs/common';
import { Concert } from '@prisma/client';

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

  async delete(id: string, ctx: GqlContext): Promise<Boolean> {
    try {
      const isConcertExist = await this.findOne(id);

      if (!isConcertExist) {
        throw new HttpException('Concert not found', 404);
      }

      await this.repos.concert.delete({
        where: {
          id: id,
        },
      });

      return true;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async findOne(id: string): Promise<Concert> {
    try {
      const concert = await this.repos.concert.findUnique({
        where: {
          id: id,
        },
      });
      return concert as Concert;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
