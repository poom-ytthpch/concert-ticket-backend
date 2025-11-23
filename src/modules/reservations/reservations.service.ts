import { PrismaService } from '../..//common/prisma/prisma.service';
import {
  CancelInput,
  CancelResponse,
  ReserveInput,
  ReserveResponse,
} from '@/types/gql';
import { InjectQueue } from '@nestjs/bullmq';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import {
  ActivityLogAction,
  Reservation,
  ReservationStatus,
} from '@prisma/client';
import { Queue } from 'bullmq';
import { UpdateReservationStatusDto } from './dto/reservations.dto';
import { ConcertsService } from '../concerts/concerts.service';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    private readonly repos: PrismaService,
    @InjectQueue('reservations') private readonly reservationQueue: Queue,
    @InjectQueue('activityLog') private readonly activityLogQueue: Queue,
    private readonly concertsService: ConcertsService,
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

      if (
        isReservationExist &&
        isReservationExist.status !== ReservationStatus.CANCELLED
      ) {
        throw new HttpException('Reservation already exist', 400);
      }

      let reservation: Reservation;

      if (!isReservationExist) {
        reservation = await this.create(input);
      } else {
        reservation = isReservationExist;
      }

      await this.reservationQueue.add('reserve-seat', {
        reservationId: reservation.id,
        concertId: reservation.concertId,
      });

      const concert = await this.concertsService.findOne(reservation.concertId);

      await this.activityLogQueue.add('create-activity-log', {
        userId: reservation.userId,
        concertId: reservation.concertId,
        action: ActivityLogAction.RESERVE,
        adminId: concert?.createdBy,
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

  async cancel(input: CancelInput): Promise<CancelResponse> {
    try {
      const isReservationExist = await this.findOneByUserConId(
        input.userId,
        input.concertId,
      );

      if (!isReservationExist) {
        throw new HttpException('Reservation not found', 404);
      }

      await this.reservationQueue.add('cancel-seat', {
        reservationId: isReservationExist.id,
        concertId: isReservationExist.concertId,
      });

      const concert = await this.concertsService.findOne(
        isReservationExist.concertId,
      );

      await this.activityLogQueue.add('create-activity-log', {
        userId: input.userId,
        concertId: input.concertId,
        action: ActivityLogAction.CANCEL,
        adminId: concert?.createdBy,
      });

      return {
        status: true,
        message: 'Reservation cancelled successfully',
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
