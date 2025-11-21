import { PrismaService } from '../..//common/prisma/prisma.service';
import { ReserveInput, ReserveResponse } from '@/types/gql';
import { InjectQueue } from '@nestjs/bullmq';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Reservation } from '@prisma/client';
import { Queue } from 'bullmq';
import { UpdateReservationStatusDto } from './dto/reservations.dto';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    private readonly repos: PrismaService,
    @InjectQueue('reservations') private reservationQueue: Queue,
  ) {}

  async findOneByUserConId(userId: string, conId: string) {
    try {
      const reservation = await this.repos.reservation.findUnique({
        where: {
          userId_concertId: {
            userId: userId,
            concertId: conId,
          },
        },
      });

      return reservation;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async reserve(input: ReserveInput): Promise<ReserveResponse> {
    const { userId, concertId } = input;
    try {
      const isReservationExist = await this.findOneByUserConId(
        userId,
        concertId,
      );

      if (isReservationExist) {
        throw new HttpException('Reservation already exist', 400);
      }

      const reservation = await this.create(input);

      await this.reservationQueue.add('reserve-seat', {
        reservationId: reservation.id,
        concertId: reservation.concertId,
      });

      return {
        status: true,
        message: 'Reservation created successfully',
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async create(input: ReserveInput): Promise<Reservation> {
    const { userId, concertId } = input;

    try {
      const createReservation = await this.repos.reservation.create({
        data: {
          userId,
          concertId,
        },
      });

      return createReservation;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async updateStatus(input: UpdateReservationStatusDto) {
    try {
      return await this.repos.reservation.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
