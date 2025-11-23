import { Test, TestingModule } from '@nestjs/testing';
import { ConcertsService } from './concerts.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RoleType } from '@prisma/client';
import { HttpException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { take } from 'rxjs';

describe('ConcertsService', () => {
  let service: ConcertsService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
    concert: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockCacheManager: any = {
    get: jest.fn(),
    set: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ConcertsService>(ConcertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new concert', async () => {
      const input = {
        name: 'Concert Name',
        description: 'Concert Description',
        totalSeats: 100,
        seatsAvailable: 100,
      };

      const ctx = {
        req: {
          user: {
            username: 'testuser',
            roles: [RoleType.ADMIN],
          },
        },
      };

      mockPrismaService.concert.create.mockResolvedValue({
        name: input.name,
        description: input.description,
        totalSeats: input.totalSeats,
        seatsAvailable: input.seatsAvailable,
        createdBy: ctx.req.user?.username,
      });

      const result = await service.create(input, ctx as any);

      expect(result).toEqual({
        status: true,
        message: 'Concert created successfully',
        data: {
          createdBy: 'testuser',
          description: 'Concert Description',
          name: 'Concert Name',
          seatsAvailable: 100,
          totalSeats: 100,
        },
      });
    });

    it('should throw HttpException when prisma error occurs', async () => {
      const input = {
        name: 'Concert Name',
        description: 'Concert Description',
        totalSeats: 100,
        seatsAvailable: 100,
      };

      const ctx = {
        req: {
          user: {
            username: 'testuser',
            roles: [RoleType.ADMIN],
          },
        },
      };

      jest
        .spyOn(mockPrismaService.concert, 'create')
        .mockRejectedValue(new Error('DB error'));

      await expect(
        service.create(input as any, ctx as any),
      ).rejects.toBeInstanceOf(HttpException);

      await expect(service.create(input as any, ctx as any)).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('delete', () => {
    it('should delete a concert', async () => {
      const id = '1';
      const ctx = {
        req: {
          user: {
            username: 'testuser',
            roles: [RoleType.ADMIN],
          },
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValue({
        id,
        name: 'Concert Name',
        description: 'Concert Description',
      } as any);

      mockPrismaService.concert.delete.mockResolvedValue({
        id,
        name: 'Concert Name',
        description: 'Concert Description',
        totalSeats: 100,
        seatsAvailable: 100,
        createdBy: ctx.req.user?.username,
      });

      const result = await service.delete(id);

      expect(result).toEqual(true);
    });

    it('should throw HttpException when concert not found', async () => {
      const id = '1';

      jest.spyOn(service, 'findOne').mockReturnValue(null as any);

      await expect(service.delete(id)).rejects.toBeInstanceOf(HttpException);

      await expect(service.delete(id)).rejects.toThrow('Concert not found');
    });

    it('should throw HttpException when prisma error occurs', async () => {
      const id = '1';

      jest.spyOn(service, 'findOne').mockReturnValue({ id } as any);

      jest
        .spyOn(mockPrismaService.concert, 'delete')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.delete(id)).rejects.toBeInstanceOf(HttpException);

      await expect(service.delete(id)).rejects.toThrow('DB error');
    });
  });

  describe('findOne', () => {
    it('should find a concert', async () => {
      const id = '1';
      const ctx = {
        req: {
          user: {
            username: 'testuser',
            roles: [RoleType.ADMIN],
          },
        },
      };

      mockPrismaService.concert.findUnique.mockResolvedValue({
        id,
        name: 'Concert Name',
        description: 'Concert Description',
        totalSeats: 100,
        seatsAvailable: 100,
        createdBy: ctx.req.user?.username,
      });

      const result = await service.findOne(id);

      expect(result).toEqual({
        id,
        name: 'Concert Name',
        description: 'Concert Description',
        totalSeats: 100,
        seatsAvailable: 100,
        createdBy: ctx.req.user?.username,
      });
    });

    it('should throw HttpException when prisma error occurs', async () => {
      const id = '1';

      jest
        .spyOn(mockPrismaService.concert, 'findUnique')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.findOne(id)).rejects.toBeInstanceOf(HttpException);

      await expect(service.findOne(id)).rejects.toThrow('DB error');
    });
  });

  describe('getConcerts', () => {
    it('should get concerts', async () => {
      const mockInput = { isAdmin: false };

      const ctx = {
        req: { user: { id: 'u1', username: 'test', roles: [RoleType.ADMIN] } },
      };

      mockCacheManager.get.mockResolvedValue(null);

      mockPrismaService.$queryRaw
        .mockResolvedValueOnce([
          { totalSeat: 100n, reserved: 10n, cancelled: 5n },
        ])
        .mockResolvedValueOnce([
          {
            id: '1',
            name: 'Concert Name',
            description: 'Concert Description',
            totalSeats: 100,
            seatsAvailable: 90,
            userReservationStatus: 'RESERVED',
          },
        ]);

      const result = await service.getConcerts(mockInput, ctx as any);

      expect(result).toEqual({
        summary: { totalSeat: 100, reserved: 10, cancelled: 5 },
        data: [
          {
            id: '1',
            name: 'Concert Name',
            description: 'Concert Description',
            totalSeats: 100,
            seatsAvailable: 90,
            userReservationStatus: 'RESERVED',
          },
        ],
      });

      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should get concerts with take and skip', async () => {
      const mockInput = {
        take: 10,
        skip: 0,
        isAdmin: false,
      };

      const ctx = {
        req: { user: { id: 'u1', username: 'test', roles: [RoleType.ADMIN] } },
      };

      mockCacheManager.get.mockResolvedValue(null);

      mockPrismaService.$queryRaw
        .mockResolvedValueOnce([
          { totalSeat: 100n, reserved: 10n, cancelled: 5n },
        ])
        .mockResolvedValueOnce([
          {
            id: '1',
            name: 'Concert Name',
            description: 'Concert Description',
            totalSeats: 100,
            seatsAvailable: 90,
            userReservationStatus: 'RESERVED',
          },
        ]);

      const result = await service.getConcerts(mockInput, ctx as any);

      expect(result).toEqual({
        summary: { totalSeat: 100, reserved: 10, cancelled: 5 },
        data: [
          {
            id: '1',
            name: 'Concert Name',
            description: 'Concert Description',
            totalSeats: 100,
            seatsAvailable: 90,
            userReservationStatus: 'RESERVED',
          },
        ],
      });

      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should return cached value when cache exists', async () => {
      const mockInput = {
        take: 10,
        skip: 0,
        isAdmin: false,
      };

      const cachedSummary = { totalSeat: 100, reserved: 10, cancelled: 5 };
      const cachedList = [{ id: '1', name: 'Concert A', seatsAvailable: 50 }];

      mockCacheManager.get
        .mockResolvedValueOnce(cachedSummary)
        .mockResolvedValueOnce(cachedList);

      const ctx = {
        req: { user: { id: 'u1', username: 'test' } },
      };

      const result = await service.getConcerts(mockInput, ctx as any);

      expect(result).toEqual({
        summary: cachedSummary,
        data: cachedList,
      });
    });

    it('should get concerts isAdmin', async () => {
      const mockInput = { isAdmin: true };

      const ctx = {
        req: { user: { id: 'u1', username: 'test', roles: [RoleType.ADMIN] } },
      };

      mockCacheManager.get.mockResolvedValue(null);

      mockPrismaService.$queryRaw
        .mockResolvedValueOnce([
          { totalSeat: 100n, reserved: 10n, cancelled: 5n },
        ])
        .mockResolvedValueOnce([
          {
            id: '1',
            name: 'Concert Name',
            description: 'Concert Description',
            totalSeats: 100,
            seatsAvailable: 90,
            userReservationStatus: 'RESERVED',
          },
        ]);

      const result = await service.getConcerts(mockInput, ctx as any);

      expect(result).toEqual({
        summary: { totalSeat: 100, reserved: 10, cancelled: 5 },
        data: [
          {
            id: '1',
            name: 'Concert Name',
            description: 'Concert Description',
            totalSeats: 100,
            seatsAvailable: 90,
            userReservationStatus: 'RESERVED',
          },
        ],
      });

      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should get concerts with take and skip isAdmin', async () => {
      const mockInput = {
        take: 10,
        skip: 0,
        isAdmin: true,
      };

      const ctx = {
        req: { user: { id: 'u1', username: 'test', roles: [RoleType.ADMIN] } },
      };

      mockCacheManager.get.mockResolvedValue(null);

      mockPrismaService.$queryRaw
        .mockResolvedValueOnce([
          { totalSeat: 100n, reserved: 10n, cancelled: 5n },
        ])
        .mockResolvedValueOnce([
          {
            id: '1',
            name: 'Concert Name',
            description: 'Concert Description',
            totalSeats: 100,
            seatsAvailable: 90,
            userReservationStatus: 'RESERVED',
          },
        ]);

      const result = await service.getConcerts(mockInput, ctx as any);

      expect(result).toEqual({
        summary: { totalSeat: 100, reserved: 10, cancelled: 5 },
        data: [
          {
            id: '1',
            name: 'Concert Name',
            description: 'Concert Description',
            totalSeats: 100,
            seatsAvailable: 90,
            userReservationStatus: 'RESERVED',
          },
        ],
      });

      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should return cached value when cache exists isAdmin', async () => {
      const mockInput = {
        take: 10,
        skip: 0,
        isAdmin: true,
      };

      const cachedSummary = { totalSeat: 100, reserved: 10, cancelled: 5 };
      const cachedList = [{ id: '1', name: 'Concert A', seatsAvailable: 50 }];

      mockCacheManager.get
        .mockResolvedValueOnce(cachedSummary)
        .mockResolvedValueOnce(cachedList);

      const ctx = {
        req: { user: { id: 'u1', username: 'test' } },
      };

      const result = await service.getConcerts(mockInput, ctx as any);

      expect(result).toEqual({
        summary: cachedSummary,
        data: cachedList,
      });
    });

    it('should throw HttpException when prisma error occurs', async () => {
      const mockInput = {
        take: 10,
        skip: 0,
        isAdmin: false,
      };

      const ctx = {
        req: { user: { id: 'u1', username: 'test', roles: [RoleType.ADMIN] } },
      };

      jest
        .spyOn(mockPrismaService, '$queryRaw')
        .mockRejectedValue(new Error('DB error'));

      await expect(
        service.getConcerts(mockInput, ctx as any),
      ).rejects.toBeInstanceOf(HttpException);

      await expect(service.getConcerts(mockInput, ctx as any)).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('updateSeat', () => {
    it('should update seats', async () => {
      mockPrismaService.concert.update.mockResolvedValue({
        id: '1',
        name: 'Concert Name',
        description: 'Concert Description',
        totalSeats: 100,
        seatsAvailable: 90,
      });

      const result = await service.updateSeat({
        concertId: '1',
        isReserved: true,
      } as any);

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Concert Name',
          description: 'Concert Description',
          totalSeats: 100,
          seatsAvailable: 90,
        }),
      );
    });

    it('should update seats if isReserved is false', async () => {
      mockPrismaService.concert.update.mockResolvedValue({
        id: '1',
        name: 'Concert Name',
        description: 'Concert Description',
        totalSeats: 100,
        seatsAvailable: 90,
      });

      const result = await service.updateSeat({
        concertId: '1',
        isReserved: false,
      } as any);

      expect(result).toEqual(
        expect.objectContaining({
          id: '1',
          name: 'Concert Name',
          description: 'Concert Description',
          totalSeats: 100,
          seatsAvailable: 90,
        }),
      );
    });

    it('should throw HttpException when prisma error occurs', async () => {
      const input = {
        concertId: '1',
        isReserved: true,
      };

      jest
        .spyOn(mockPrismaService.concert, 'update')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.updateSeat(input as any)).rejects.toBeInstanceOf(
        HttpException,
      );

      await expect(service.updateSeat(input as any)).rejects.toThrow(
        'DB error',
      );
    });
  });
});
