import { Test, TestingModule } from '@nestjs/testing';
import { ConcertsService } from './concerts.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RoleType } from '@prisma/client';
import { HttpException } from '@nestjs/common';

describe('ConcertsService', () => {
  let service: ConcertsService;
  let mockPrismaService = {
    concert: {
      create: jest.fn(),
    },
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
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
});
