import { ExecutionContext, Type } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth-guard';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../modules/user/user.service';
import { User } from '@prisma/client';
import { Request, Response } from 'express';

type PartialGqlExecutionContext = Partial<GqlExecutionContext>;

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockJwt: Partial<JwtService>;
  let mockConfig: Partial<ConfigService>;
  let mockReflector: Partial<Reflector>;
  let mockUserService: Partial<UserService>;

  beforeEach(() => {
    mockJwt = { verifyAsync: jest.fn() };
    mockConfig = { get: jest.fn().mockReturnValue('test-secret') };
    mockReflector = { getAllAndOverride: jest.fn().mockReturnValue([]) };
    mockUserService = { findOne: jest.fn() };

    guard = new JwtAuthGuard(
      mockJwt as JwtService,
      mockConfig as ConfigService,
      mockReflector as Reflector,
      mockUserService as UserService,
    );

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockImplementation((context: any) => {
        return {
          getContext: () => ({ req: context.__req }),
        } as unknown as GqlExecutionContext;
      });
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  function makeContext(req: any, handler = () => {}, clazz = class {}) {
    const context: Partial<ExecutionContext> & { __req?: any } = {
      getHandler: () => handler,
      getClass: <T = any>() => clazz as unknown as Type<T>,
      __req: req,
    };
    return context as ExecutionContext;
  }

  test('throws Unauthorized when no Authorization header', async () => {
    const req = { headers: {} };
    const ctx = makeContext(req);

    await expect(guard.canActivate(ctx)).rejects.toThrow('Unauthorized');
  });

  test('throws Unauthorized when jwt.verifyAsync fails', async () => {
    const req = { headers: { authorization: 'Bearer badtoken' } };
    const ctx = makeContext(req);
    (mockJwt.verifyAsync as jest.Mock).mockRejectedValue(
      new Error('invalid token'),
    );

    await expect(guard.canActivate(ctx)).rejects.toThrow('Unauthorized');
    expect(mockJwt.verifyAsync).toHaveBeenCalledWith('badtoken', {
      secret: 'test-secret',
    });
  });

  test('throws Unauthorized when user not found', async () => {
    const req = { headers: { authorization: 'Bearer sometoken' } };
    const ctx = makeContext(req);
    (mockJwt.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { userInfo: { id: 'u1' } },
    });
    (mockUserService.findOne as jest.Mock).mockResolvedValue(null);

    await expect(guard.canActivate(ctx)).rejects.toThrow('Unauthorized');
    expect(mockUserService.findOne).toHaveBeenCalledWith('u1');
  });

  test('throws Unauthorized when user lacks required roles', async () => {
    const req = { headers: { authorization: 'Bearer goodtoken' } };
    const ctx = makeContext(req);
    (mockJwt.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { userInfo: { id: 'u2' } },
    });
    (mockUserService.findOne as jest.Mock).mockResolvedValue({
      id: 'u2',
      roles: [{ type: 'USER' }],
    });
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);

    await expect(guard.canActivate(ctx)).rejects.toThrow('Unauthorized');
  });

  test('returns true and attaches user when token valid and roles satisfied (no required roles)', async () => {
    const decodedPayload = { id: 'u3' };
    const req = {
      headers: { authorization: 'Bearer validtoken' },
      user: decodedPayload,
    };
    const ctx = makeContext(req);

    (mockJwt.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { userInfo: decodedPayload },
    });
    (mockUserService.findOne as jest.Mock).mockResolvedValue({
      id: 'u3',
      roles: [{ type: 'USER' }],
    });
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue([]);
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(req.user).toEqual(decodedPayload);
  });

  test('throws Unauthorized when decoded payload missing userInfo', async () => {
    const req = { headers: { authorization: 'Bearer tokenNoUserInfo' } };
    const ctx = makeContext(req);
    (mockJwt.verifyAsync as jest.Mock).mockResolvedValue({
      payload: {},
    });
    (mockUserService.findOne as jest.Mock).mockResolvedValue(null);

    await expect(guard.canActivate(ctx)).rejects.toThrow('Unauthorized');
    expect(mockUserService.findOne).toHaveBeenCalledWith(undefined);
  });

  test('throws Unauthorized when user.roles is undefined but roles are required', async () => {
    const req = { headers: { authorization: 'Bearer tokenRolesUndefined' } };
    const ctx = makeContext(req);
    (mockJwt.verifyAsync as jest.Mock).mockResolvedValue({
      payload: { userInfo: { id: 'u5' } },
    });
    (mockUserService.findOne as jest.Mock).mockResolvedValue({
      id: 'u5',
    } as any);
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);

    await expect(guard.canActivate(ctx)).rejects.toThrow('Unauthorized');
    expect(mockUserService.findOne).toHaveBeenCalledWith('u5');
  });
});
