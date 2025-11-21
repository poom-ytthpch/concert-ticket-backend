import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly repos: PrismaService) {}

  async findOne(
    id: string,
  ): Promise<Prisma.UserGetPayload<{ include: { roles: true } }>> {
    try {
      const user = await this.repos.user.findUnique({
        where: {
          id: id,
        },
        include: {
          roles: true,
        },
      });

      if (!user) {
        this.logger.error('User not found');
        throw new HttpException('User not found', 404);
      }

      return user;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.repos.user.findUnique({
        where: {
          email: email,
        },
        include: {
          roles: true,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, error.status);
    }
  }
}
