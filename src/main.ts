import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config/default';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://svelte-test-bay-eight.vercel.app',
    ],
    allowedHeaders: ['content-type', 'Authorization'],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  await app.listen(config.server.port);
}
bootstrap();
