import { ExecutionContext, Type } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth-guard';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../modules/user/user.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockJwt: Partial<JwtService>;
  let mockConfig: Partial<ConfigService>;
  let mockReflector: Partial<Reflector>;
  let mockUserService: Partial<UserService>;
  let createSpy: jest.SpyInstance;

  beforeEach(() => {
    mockJwt = {
      verifyAsync: jest.fn(),
    };
    mockConfig = {
      get: jest.fn().mockReturnValue('test-secret'),
    };
    mockReflector = {
      getAllAndOverride: jest.fn().mockReturnValue([]),
    };
    mockUserService = {
      findOne: jest.fn(),
    };

    guard = new JwtAuthGuard(
      mockJwt as JwtService,
      mockConfig as ConfigService,
      mockReflector as Reflector,
      mockUserService as UserService,
    );

    createSpy = jest
      .spyOn(GqlExecutionContext, 'create')
      .mockImplementation((ctx: any) => {
        return {
          getContext: () => ({ req: (ctx as any).__req }),
        } as any;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function makeContext(req: any, handler = () => {}, clazz = class {}) {
    const context: Partial<ExecutionContext> = {
      getHandler: () => handler,
      getClass: <T = any>() => clazz as unknown as Type<T>,
    };
    (context as any).__req = req;
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
    const decodedPayload = { userInfo: { id: 'u3' }, another: 'field' };
    const req: any = { headers: { authorization: 'Bearer validtoken' } };
    const ctx = makeContext(req);
    (mockJwt.verifyAsync as jest.Mock).mockResolvedValue({
      payload: decodedPayload,
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

  test('returns true when required roles present and user has matching role', async () => {
    const decodedPayload = { userInfo: { id: 'u4' } };
    const req: any = { headers: { authorization: 'Bearer validtoken2' } };
    const ctx = makeContext(req);
    (mockJwt.verifyAsync as jest.Mock).mockResolvedValue({
      payload: decodedPayload,
    });
    (mockUserService.findOne as jest.Mock).mockResolvedValue({
      id: 'u4',
      roles: [{ type: 'ADMIN' }, { type: 'USER' }],
    });
    (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(req.user).toEqual(decodedPayload);
  });
});
