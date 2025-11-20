import { HttpException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterInput, RegisterResponse } from 'src/types/gql';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly repos: PrismaService,
    private readonly userService: UserService,
  ) {}

  async register(input: RegisterInput): Promise<RegisterResponse> {
    try {
      const isUserExist = await this.userService.findByEmail(input.email);

      if (isUserExist) {
        throw new HttpException('User already exist', 400);
      }

      await this.repos.user.create({
        data: {
          email: input.email,
          password: input.password,
          username: input.username,
          roles: {
            createMany: {
              data: input.roles.map((role) => ({
                type: role,
                createdAt: new Date(),
                updatedAt: new Date(),
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
      throw new HttpException(err.message, err.status);
    }
  }
}
