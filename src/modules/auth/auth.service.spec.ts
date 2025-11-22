import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserService } from '../user/user.service';
import {
  LoginInput,
  RegisterInput,
  RegisterUserInput,
  RoleType,
} from '../../../src/types/gql';
import { HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;

  const mockPrismaService = {
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
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('TOKEN123'),
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

      const ctx = {
        req: {
          user: {
            username: 'testuser',
            roles: [RoleType.ADMIN],
          },
        },
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      mockPrismaService.user.create.mockResolvedValue(user);

      const result = await service.register(input, ctx as any);

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

      const ctx = {
        req: {
          user: {
            username: 'testuser',
            roles: [RoleType.ADMIN],
          },
        },
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue({
        id: '1',
        email: 'user@example.com',
      } as any);

      try {
        await service.register(input, ctx as any);
        throw new Error('Expected method to throw.');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('User already exist');
        expect(err.status).toBe(400);
      }
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const input: LoginInput = {
        email: 'user@example.com',
        password: 'password',
      };
      const user = {
        id: '1',
        email: 'user@example.com',
        password: 'password',
        roles: [{ id: 'r1', name: 'user' }],
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user as any);
      (
        jest.spyOn(bcrypt, 'compare') as unknown as jest.SpyInstance<
          Promise<boolean>,
          any
        >
      ).mockResolvedValue(true);

      const result = await service.login(input);

      expect(result).toEqual({
        status: true,
        message: 'Login successful',
        token: 'TOKEN123',
      });
    });

    it('should throw an error if user not found', async () => {
      const input: LoginInput = {
        email: 'user@example.com',
        password: 'password',
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      (
        jest.spyOn(bcrypt, 'compare') as unknown as jest.SpyInstance<
          Promise<boolean>,
          any
        >
      ).mockResolvedValue(true);

      try {
        await service.login(input);
        throw new Error('Expected method to throw.');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('User not found');
        expect(err.status).toBe(404);
      }
    });

    it('should throw an error if wrong password', async () => {
      const input: LoginInput = {
        email: 'user@example.com',
        password: 'password',
      };
      const user = {
        id: '1',
        email: 'user@example.com',
        password: 'password',
        roles: [{ id: 'r1', name: 'user' }],
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user as any);
      (
        jest.spyOn(bcrypt, 'compare') as unknown as jest.SpyInstance<
          Promise<boolean>,
          any
        >
      ).mockResolvedValue(false);

      try {
        await service.login(input);
        throw new Error('Expected method to throw.');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('Invalid credentials');
        expect(err.status).toBe(401);
      }
    });
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const input: RegisterUserInput = {
        email: 'user@example.com',
        password: 'password',
        confirmPassword: 'password',
        username: 'John Doe',
      };
      const user = {
        id: '1',
        email: 'user@example.com',
        roles: [{ id: 'r1', name: 'user' }],
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      mockPrismaService.user.create.mockResolvedValue(user);

      const result = await service.registerUser(input);

      expect(result).toEqual({
        status: true,
        message: 'User registered successfully',
      });
    });

    it('should throw an error if user already exists', async () => {
      const input: RegisterUserInput = {
        email: 'user@example.com',
        password: 'password',
        confirmPassword: 'password',
        username: 'John Doe',
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue({
        id: '1',
        email: 'user@example.com',
      } as any);

      try {
        await service.registerUser(input);
        throw new Error('Expected method to throw.');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('User already exist');
        expect(err.status).toBe(400);
      }
    });

    it('should throw an error if password does not match', async () => {
      const input: RegisterUserInput = {
        email: 'user@example.com',
        password: 'password',
        confirmPassword: 'passwordpassword',
        username: 'John Doe',
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      try {
        await service.registerUser(input);
        throw new Error('Expected method to throw.');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.message).toBe('Password does not match');
        expect(err.status).toBe(400);
      }
    });
  });
});
