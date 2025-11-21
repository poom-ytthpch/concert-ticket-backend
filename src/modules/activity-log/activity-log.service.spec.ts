import { Test, TestingModule } from '@nestjs/testing';
import { ActivityLogService } from './activity-log.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { ActivityLogAction } from '@prisma/client';
import { HttpException } from '@nestjs/common';

describe('ActivityLogService', () => {
  let service: ActivityLogService;
  let mockPrismaService = {
    activityLog: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockBullQueue: any = {
    add: jest.fn(),
    process: jest.fn(),
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
  });
});
