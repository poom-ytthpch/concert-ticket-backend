import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { json } from 'express';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const origin =
    process.env.NODE_ENV === 'production' ? process.env.ORIGIN : '*';
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'Concert Ticket',
      logLevels: ['log', 'error', 'warn', 'debug', 'verbose'],
    }),
  });

  app.use(helmet());
  app.use(json({ limit: '50mb' }));

  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production'
          ? {
              directives: {
                defaultSrc: [
                  `'self' https: http: ws: wss: 'unsafe-eval' 'unsafe-inline'`,
                ],
                styleSrc: [
                  `'self'`,
                  `'unsafe-inline'`,
                  'cdn.jsdelivr.net',
                  'fonts.googleapis.com',
                ],
                fontSrc: [`'self'`, 'fonts.gstatic.com'],
                imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
                scriptSrc: [
                  `'self'`,
                  `https: 'unsafe-inline'`,
                  `cdn.jsdelivr.net`,
                ],
              },
            }
          : false,
    }),
  );

  app.use(
    helmet.hsts({
      maxAge: 31536000,
      includeSubDomains: false,
    }),
  );

  app.enableCors({ origin });
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port).then(() => {
    console.log(`server is runing on port ${port}`);
  });
}
bootstrap();
