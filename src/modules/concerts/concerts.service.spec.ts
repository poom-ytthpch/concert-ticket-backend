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
      delete: jest.fn(),
      findUnique: jest.fn(),
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
      const ctx = {
        req: {
          user: {
            username: 'testuser',
            roles: [RoleType.ADMIN],
          },
        },
      };

      jest.spyOn(service, 'findOne').mockReturnValue(null as any);

      await expect(service.delete(id)).rejects.toBeInstanceOf(HttpException);

      await expect(service.delete(id)).rejects.toThrow('Concert not found');
    });

    it('should throw HttpException when prisma error occurs', async () => {
      const id = '1';
      const ctx = {
        req: {
          user: {
            username: 'testuser',
            roles: [RoleType.ADMIN],
          },
        },
      };

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
      const ctx = {
        req: {
          user: {
            username: 'testuser',
            roles: [RoleType.ADMIN],
          },
        },
      };

      jest
        .spyOn(mockPrismaService.concert, 'findUnique')
        .mockRejectedValue(new Error('DB error'));

      await expect(service.findOne(id)).rejects.toBeInstanceOf(HttpException);

      await expect(service.findOne(id)).rejects.toThrow('DB error');
    });
  });
});
