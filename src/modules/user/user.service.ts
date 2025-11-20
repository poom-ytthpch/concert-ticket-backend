import { HttpException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UserService {
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
        throw new HttpException('User not found', 404);
      }

      return user;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
