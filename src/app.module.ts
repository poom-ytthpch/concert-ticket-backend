import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { UserModule } from './modules/user/user.module';
import { GqlThrottlerGuard } from './common/guard/gql-throttler.guard';
import { ConcertsModule } from './modules/concerts/concerts.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { BullModule } from '@nestjs/bullmq';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL') || 60000,
            limit: configService.get<number>('THROTTLE_LIMIT') || 100,
          },
        ],
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        typePaths: ['./**/**/*.graphql'],
        definitions: {
          path: join(process.cwd(), 'src/types/gql.ts'),
          outputAs: 'class',
        },
        csrfPrevention: false,
        installSubscriptionHandlers: false,
        cors: false,
        playground: false,
        skipCheck: true,
        validate: false,
        introspection:
          configService.get<string>('NODE_ENV') !== 'production' ? true : false,
        context: ({ req, res }) => ({ req, res }),
        plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ConcertsModule,
    ReservationsModule,
    ActivityLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
