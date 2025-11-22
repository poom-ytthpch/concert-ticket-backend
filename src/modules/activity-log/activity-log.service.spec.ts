import { Test, TestingModule } from '@nestjs/testing';
import { ActivityLogService } from './activity-log.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { ActivityLogAction } from '@prisma/client';
import { HttpException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('ActivityLogService', () => {
  let service: ActivityLogService;
  const mockPrismaService = {
    activityLog: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockBullQueue: any = {
    add: jest.fn(),
    process: jest.fn(),
  };

  const mockCacheManager: any = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityLogService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: getQueueToken('activityLog'),
          useValue: mockBullQueue,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ActivityLogService>(ActivityLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create activity log', async () => {
      const mockCreate = {
        userId: '1',
        concertId: '1',
        action: ActivityLogAction.RESERVE,
      };

      mockPrismaService.activityLog.create.mockResolvedValue({
        userId: '1',
        concertId: '1',
        action: ActivityLogAction.RESERVE,
      } as any);

      const result = await service.create(mockCreate);

      expect(result).toEqual({
        userId: '1',
        concertId: '1',
        action: ActivityLogAction.RESERVE,
      });
    });

    it('should throw HttpException when prisma error occurs', async () => {
      const mockCreate = {
        userId: '1',
        concertId: '1',
        action: ActivityLogAction.RESERVE,
      };

      jest
        .spyOn(mockPrismaService.activityLog, 'create')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.create(mockCreate)).rejects.toBeInstanceOf(
        HttpException,
      );

      await expect(service.create(mockCreate)).rejects.toThrow('DB error');
    });

    beforeEach(() => {
      mockPrismaService.activityLog.findMany = jest.fn();
    });

    describe('findAll', () => {
      it('should return cached activity logs when cache hit', async () => {
        const ctx = { req: { user: { id: '1' } } } as any;
        const input = { take: 5, skip: 0 } as any;

        const cached = [
          {
            createdAt: new Date(),
            user: { username: 'alice' },
            concert: { name: 'Gig' },
          },
        ];

        mockCacheManager.get.mockResolvedValueOnce(cached);

        const result = await service.findAll(input, ctx);

        expect(result).toEqual(cached);
        expect(mockPrismaService.activityLog.findMany).not.toHaveBeenCalled();
      });

      it('should fetch from db and set cache when cache miss', async () => {
        const ctx = { req: { user: { id: '1' } } } as any;
        const input = { take: 5, skip: 0 } as any;

        const dbResult = [
          {
            createdAt: new Date(),
            user: { username: 'bob' },
            concert: { name: 'Festival' },
          },
        ];

        mockCacheManager.get.mockResolvedValueOnce(null);
        mockPrismaService.activityLog.findMany.mockResolvedValueOnce(dbResult);

        const result = await service.findAll(input, ctx);

        expect(result).toEqual(dbResult);
        expect(mockPrismaService.activityLog.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { userId: '1' },
            select: expect.any(Object),
            orderBy: { createdAt: 'desc' },
            take: 5,
            skip: 0,
          }),
        );
        expect(mockCacheManager.set).toHaveBeenCalledWith(
          `activity_logs:1:take=5:skip=0`,
          dbResult,
        );
      });

      it('should throw HttpException when prisma findMany throws', async () => {
        const ctx = { req: { user: { id: '1' } } } as any;
        const input = { take: 5, skip: 0 } as any;

        mockCacheManager.get.mockResolvedValueOnce(null);

        jest
          .spyOn(mockPrismaService.activityLog, 'findMany')
          .mockRejectedValue(new Error('DB error'));

        await expect(service.findAll(input, ctx)).rejects.toBeInstanceOf(
          HttpException,
        );
        await expect(service.findAll(input, ctx)).rejects.toThrow('DB error');
      });
    });
  });
});
