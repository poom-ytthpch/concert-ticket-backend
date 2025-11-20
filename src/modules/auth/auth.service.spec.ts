import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { RegisterInput, RoleType } from '../../../src/types/gql';
import { HttpException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;

  let mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const input: RegisterInput = {
        email: 'user@example.com',
        password: 'password',
        username: 'John Doe',
        roles: [RoleType.USER, RoleType.ADMIN],
      };
      const user = {
        id: '1',
        email: 'user@example.com',
        roles: [{ id: 'r1', name: 'user' }],
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      mockPrismaService.user.create.mockResolvedValue(user);

      const result = await service.register(input);

      expect(result).toEqual({
        status: true,
        message: 'User registered successfully',
      });
    });

    it('should throw an error if user already exists', async () => {
      const input: RegisterInput = {
        email: 'user@example.com',
        password: 'password',
        username: 'John Doe',
        roles: [RoleType.USER, RoleType.ADMIN],
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue({
        id: '1',
        email: 'user@example.com',
      } as any);

      try {
        await service.register(input);
        throw new Error('Expected method to throw.');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('User already exist');
        expect((err as any).status).toBe(400);
      }
    });
  });
});
