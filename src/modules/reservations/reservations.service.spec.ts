import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { HttpException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { ConcertsService } from '../concerts/concerts.service';

describe('ReservationsService', () => {
  let service: ReservationsService;
  const mockPrismaService = {
    reservation: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const mockBullQueue: any = {
    add: jest.fn(),
    process: jest.fn(),
  };

  const mockConcertService = {
    findOne: jest.fn(),
    updateSeat: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: getQueueToken('reservations'),
          useValue: mockBullQueue,
        },
        {
          provide: getQueueToken('activityLog'),
          useValue: mockBullQueue,
        },
        {
          provide: ConcertsService,
          useValue: mockConcertService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByUserConId', () => {
    it('should return a reservation when found', async () => {
      const mockReservation = {
        id: '1',
        userId: '1',
        concertId: '1',
        status: 'pending',
      };
      mockPrismaService.reservation.findUnique.mockResolvedValue(
        mockReservation as any,
      );

      const result = await service.findOneByUserConId('1', '1');

      expect(result).toEqual(mockReservation);
      expect(mockPrismaService.reservation.findUnique).toHaveBeenCalledWith({
        where: { userId_concertId: { userId: '1', concertId: '1' } },
      });
    });

    it('should throw HttpException when prisma error occurs', async () => {
      jest
        .spyOn(mockPrismaService.reservation, 'findUnique')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.findOneByUserConId('1', '1')).rejects.toBeInstanceOf(
        HttpException,
      );

      await expect(service.findOneByUserConId('1', '1')).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('reserve', () => {
    it('should return a reservation when found', async () => {
      const mockReservation = {
        id: '1',
        userId: '1',
        concertId: '1',
        status: 'pending',
      };
      mockPrismaService.reservation.create.mockResolvedValue(
        mockReservation as any,
      );

      jest.spyOn(service, 'findOneByUserConId').mockResolvedValue(null);

      const result = await service.reserve({
        userId: '1',
        concertId: '1',
      } as any);

      expect(result).toEqual({
        status: true,
        message: 'Reservation created successfully',
      });
      expect(mockPrismaService.reservation.create).toHaveBeenCalledWith({
        data: { userId: '1', concertId: '1' },
      });
    });

    it('should thorw HttpException when reservation already exist', async () => {
      const mockReservation = {
        id: '1',
        userId: '1',
        concertId: '1',
        status: 'pending',
      };

      jest
        .spyOn(service, 'findOneByUserConId')
        .mockReturnValue({ id: '1', status: ReservationStatus.PENDING } as any);

      await expect(service.reserve(mockReservation)).rejects.toBeInstanceOf(
        HttpException,
      );

      await expect(service.reserve(mockReservation)).rejects.toThrow(
        'Reservation already exist',
      );
    });

    it('should update status', async () => {
      jest.spyOn(service, 'findOneByUserConId').mockReturnValue({
        id: '1',
        status: ReservationStatus.CANCELLED,
      } as any);

      const result = await service.reserve({
        userId: '1',
        concertId: '1',
      } as any);

      expect(result).toEqual({
        status: true,
        message: 'Reservation created successfully',
      });
      expect(mockPrismaService.reservation.create).toHaveBeenCalledWith({
        data: { userId: '1', concertId: '1' },
      });
    });
  });

  describe('create', () => {
    it('should throw HttpException when prisma error occurs', async () => {
      const mockCreate = {
        userId: '1',
        concertId: '1',
      };

      jest
        .spyOn(mockPrismaService.reservation, 'create')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.create(mockCreate)).rejects.toBeInstanceOf(
        HttpException,
      );

      await expect(service.create(mockCreate)).rejects.toThrow('DB error');
    });
  });

  describe('updateStatus', () => {
    it('should throw HttpException when prisma error occurs', async () => {
      const mockUpdate = {
        id: '1',
        status: ReservationStatus.RESERVED,
      };

      jest
        .spyOn(mockPrismaService.reservation, 'update')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.updateStatus(mockUpdate)).rejects.toBeInstanceOf(
        HttpException,
      );

      await expect(service.updateStatus(mockUpdate)).rejects.toThrow(
        'DB error',
      );
    });

    it('should update status', async () => {
      const mockUpdate = {
        id: '1',
        status: ReservationStatus.RESERVED,
      };

      mockPrismaService.reservation.update.mockResolvedValue(undefined);

      await expect(service.updateStatus(mockUpdate)).resolves.toBe(undefined);
    });
  });

  describe('cancel', () => {
    it('should throw HttpException when prisma error occurs', async () => {
      const mockInput = {
        userId: '1',
        concertId: '1',
      };

      jest
        .spyOn(mockPrismaService.reservation, 'update')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.cancel(mockInput)).rejects.toBeInstanceOf(
        HttpException,
      );

      await expect(service.cancel(mockInput)).rejects.toThrow('DB error');
    });

    it('should update status', async () => {
      const mockInput = {
        userId: '1',
        concertId: '1',
      };

      jest.spyOn(service, 'findOneByUserConId').mockResolvedValue(null);

      mockBullQueue.add.mockResolvedValue(undefined);

      await expect(service.cancel(mockInput)).rejects.toBeInstanceOf(
        HttpException,
      );

      await expect(service.cancel(mockInput)).rejects.toThrow(
        'Reservation not found',
      );
    });

    it('should cancel reservation when found', async () => {
      const mockInput = {
        userId: '1',
        concertId: '1',
      };

      const mockReservation = {
        id: 'res1',
        userId: '1',
        concertId: '1',
        status: 'pending',
      };

      jest
        .spyOn(service, 'findOneByUserConId')
        .mockResolvedValue(mockReservation as any);

      mockBullQueue.add.mockResolvedValue(undefined);

      const result = await service.cancel(mockInput as any);

      expect(result).toEqual({
        status: true,
        message: 'Reservation cancelled successfully',
      });

      expect(mockBullQueue.add).toHaveBeenCalled();

      expect(mockBullQueue.add.mock.calls[0]).toEqual([
        'reserve-seat',
        { reservationId: '1', concertId: '1' },
      ]);

      expect(mockBullQueue.add.mock.calls[1][0]).toBe('create-activity-log');
      expect(mockBullQueue.add.mock.calls[1][1]).toMatchObject({
        concertId: '1',
      });
    });

    it('should throw HttpException when queue add fails', async () => {
      const mockInput = {
        userId: '1',
        concertId: '1',
      };

      const mockReservation = {
        id: 'res1',
        userId: '1',
        concertId: '1',
      };

      jest
        .spyOn(service, 'findOneByUserConId')
        .mockResolvedValue(mockReservation as any);

      mockBullQueue.add.mockRejectedValue(new Error('Queue error'));

      await expect(service.cancel(mockInput as any)).rejects.toBeInstanceOf(
        HttpException,
      );

      await expect(service.cancel(mockInput as any)).rejects.toThrow(
        'Queue error',
      );
    });
  });
});
