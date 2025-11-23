import {
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002':
        throw new ConflictException(
          'A record with this unique field already exists.',
        );
      case 'P2003':
        throw new UnprocessableEntityException(
          'Related record does not exist.',
        );
      case 'P2025':
        throw new NotFoundException('The requested record was not found.');
      default:
        throw new GraphQLError(`Prisma error: ${exception.message}`, {
          extensions: { code: exception.code },
        });
    }
  }
}
