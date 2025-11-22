import { HttpException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  RegisterUserInput,
  RegisterUserResponse,
} from 'src/types/gql';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { GqlContext } from '@/types/gql-context';
import { RoleType } from '@prisma/client';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly repos: PrismaService,
    private readonly userService: UserService,
    private readonly jwt: JwtService,
  ) {}

  async register(
    input: RegisterInput,
    ctx: GqlContext,
  ): Promise<RegisterResponse> {
    try {
      const isUserExist = await this.userService.findByEmail(input.email);

      if (isUserExist) {
        throw new HttpException('User already exist', 400);
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const now = new Date();

      await this.repos.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          username: input.username,
          createdBy: ctx.req.user?.username,
          roles: {
            createMany: {
              data: input.roles.map((role) => ({
                type: role,
                createdAt: now,
                updatedAt: now,
              })),
            },
          },
        },
      });
      return {
        status: true,
        message: 'User registered successfully',
      };
    } catch (err) {
      this.logger.error(err);
      throw new HttpException(err.message, err.status);
    }
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    try {
      const user = await this.userService.findByEmail(input.email);

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      const passwordMatch = await bcrypt.compare(input.password, user.password);

      if (!passwordMatch) {
        throw new HttpException('Invalid credentials', 401);
      }

      const payload = {
        userInfo: {
          id: user.id,
          email: user.email,
          username: user.username,
          roles: user.roles.map((role) => role.type),
        },
      };

      const token = await this.jwt.signAsync({ sub: user.id, payload });

      return {
        status: true,
        message: 'Login successful',
        token,
      };
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async registerUser(input: RegisterUserInput): Promise<RegisterUserResponse> {
    try {
      if (input.password !== input.confirmPassword) {
        throw new HttpException('Password does not match', 400);
      }

      const isUserExist = await this.userService.findByEmail(input.email);

      if (isUserExist) {
        throw new HttpException('User already exist', 400);
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const now = new Date();

      await this.repos.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          username: input.username,
          roles: {
            createMany: {
              data: [
                {
                  type: RoleType.USER,
                  createdAt: now,
                  updatedAt: now,
                },
              ],
            },
          },
        },
      });

      return {
        status: true,
        message: 'User registered successfully',
      };
    } catch (error) {
      this.logger.log(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
