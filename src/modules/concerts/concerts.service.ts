import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateConcertInput,
  CreateConcertResponse,
  GetConcertsResponse,
  ConcertGql,
  GetConcertsInput,
} from '@/types/gql';
import { GqlContext } from '@/types/gql-context';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { Concert, Prisma } from '@prisma/client';
import { Cache } from 'cache-manager';
import { UpdateSeatDto } from './dto/concert.dto';
@Injectable()
export class ConcertsService {
  private readonly logger = new Logger(ConcertsService.name);

  constructor(
    private readonly repos: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async delete(id: string): Promise<boolean> {
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
      this.logger.error(error);
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
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async getConcerts(
    input: GetConcertsInput,
    ctx: GqlContext,
  ): Promise<GetConcertsResponse> {
    const { take = 10, skip = 0 } = input;

    let summaryRaw;
    let concertsRaw;

    try {
      const userId = ctx.req.user?.id;

      const summaryKey = 'concert_summary';
      const listKey = `concert_list_user_${userId}_take_${take}_skip_${skip}`;

      const cachedSummary = await this.cacheManager.get<{
        totalSeat: number;
        reserved: number;
        cancelled: number;
      }>(summaryKey);
      const cachedList = await this.cacheManager.get<ConcertGql[]>(listKey);

      if (cachedSummary && cachedList) {
        return {
          summary: cachedSummary,
          data: cachedList,
        };
      }

      summaryRaw = await this.repos.$queryRaw<
        [{ totalSeat: bigint; reserved: bigint; cancelled: bigint }]
      >`
        SELECT 
          SUM(c."totalSeats") AS "totalSeat",
          SUM(CASE WHEN r."status" = 'RESERVED' THEN 1 ELSE 0 END) AS "reserved",
          SUM(CASE WHEN r."status" = 'CANCELLED' THEN 1 ELSE 0 END) AS "cancelled"
        FROM "Concert" c
        LEFT JOIN "Reservation" r ON c.id = r."concertId";
      `;

       concertsRaw = await this.repos.$queryRaw<ConcertGql[]>`
        SELECT 
          c.*,
          r."status" AS "userReservationStatus"
        FROM "Concert" c
        LEFT JOIN "Reservation" r 
          ON c.id = r."concertId" 
          AND r."userId" = ${userId}
        ORDER BY c."createdAt" DESC
        LIMIT ${take}
        OFFSET ${skip};
    `;

      const parsedSummary = {
        totalSeat: Number(summaryRaw[0].totalSeat),
        reserved: Number(summaryRaw[0].reserved),
        cancelled: Number(summaryRaw[0].cancelled),
      };

      await this.cacheManager.set(summaryKey, parsedSummary);
      await this.cacheManager.set(listKey, concertsRaw);

      return {
        summary: parsedSummary,
        data: concertsRaw,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async updateSeat(input: UpdateSeatDto) {
    try {
      let data: Prisma.ConcertUpdateInput;

      if (input.isReserved) {
        data = {
          seatsAvailable: {
            decrement: 1,
          },
        };
      } else {
        data = {
          seatsAvailable: {
            increment: 1,
          },
        };
      }

      return await this.repos.concert.update({
        where: {
          id: input.concertId,
        },
        data,
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
