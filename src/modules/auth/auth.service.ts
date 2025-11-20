import { HttpException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterInput, RegisterResponse } from 'src/types/gql';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly repos: PrismaService) {}

  async register(input: RegisterInput): Promise<RegisterResponse> {
    try {
      return {
        status: true,
        message: 'User registered successfully',
      };
    } catch (err) {
      throw new HttpException(err.message, err.status);
    }
  }
}
