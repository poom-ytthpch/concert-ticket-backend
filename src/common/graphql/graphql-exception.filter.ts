import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch(HttpException, GraphQLError, Error)
export class GqlExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GqlExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext();
    const request = ctx.req;

    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error('Unknown error thrown', JSON.stringify(exception));
    }

    if (exception instanceof GraphQLError) {
      return exception;
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const status = exception.getStatus();

      const message =
        typeof response === 'string'
          ? response
          : (response as any).message || (response as any).error || 'Error';

      const statusCodeMap: Record<number, string> = {
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        409: 'CONFLICT',
        422: 'UNPROCESSABLE_ENTITY',
        500: 'INTERNAL_SERVER_ERROR',
      };

      const gqlCode = statusCodeMap[status] || 'HTTP_ERROR';

      return new GraphQLError(message, {
        extensions: {
          code: gqlCode,
          timestamp: new Date().toISOString(),
          path:
            gqlHost.getInfo().fieldName || request.originalUrl || request.url,
        },
      });
    }

    if (exception instanceof Error) {
      return new GraphQLError(exception.message, {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          http: { status: 500 },
        },
      });
    }

    return new GraphQLError('Unexpected error', {
      extensions: {
        code: 'UNKNOWN_ERROR',
        http: { status: 500 },
        raw: exception,
      },
    });
  }
}
