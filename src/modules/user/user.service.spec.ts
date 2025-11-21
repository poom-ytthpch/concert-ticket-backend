import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { HttpException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;

  let mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('UserService', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    describe('findOne', () => {
      it('findOne should return a user when found', async () => {
        const fakeUser = {
          id: '1',
          email: 'user@example.com',
          roles: [{ id: 'r1', name: 'user' }],
        };
        mockPrismaService.user.findUnique.mockResolvedValue(fakeUser as any);

        const result = await service.findOne('1');

        expect(result).toEqual(fakeUser);
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
          where: { id: '1' },
          include: { roles: true },
        });
      });

      it('findOne should throw HttpException 404 when user not found', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        try {
          await service.findOne('non-existent-id');
          throw new Error('Expected method to throw.');
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.message).toBe('User not found');
          expect((err as any).status).toBe(404);
        }
      });

      it('findOne should rethrow HttpException when underlying repo throws', async () => {
        mockPrismaService.user.findUnique.mockRejectedValue({
          message: 'DB failure',
          status: 500,
        });

        try {
          await service.findOne('any-id');
          throw new Error('Expected method to throw.');
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.message).toBe('DB failure');
          expect((err as any).status).toBe(500);
        }
      });
    });

    describe('findByEmail', () => {
      it('findByEmail should return a user when found', async () => {
        const fakeUser = {
          id: '1',
          email: 'user@example.com',
          roles: [{ id: 'r1', name: 'user' }],
        };
        mockPrismaService.user.findUnique.mockResolvedValue(fakeUser as any);

        const result = await service.findByEmail('1');

        expect(result).toEqual(fakeUser);
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
          where: { email: '1' },
          include: { roles: true },
        });
      });

      it('findByEmail should rethrow HttpException when underlying repo throws', async () => {
        mockPrismaService.user.findUnique.mockRejectedValue({
          message: 'DB failure',
          status: 500,
        });

        try {
          await service.findByEmail('any-id');
          throw new Error('Expected method to throw.');
        } catch (err) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.message).toBe('DB failure');
          expect((err as any).status).toBe(500);
        }
      });
    });
  });
});
