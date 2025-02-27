import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisIoAdapter = app.get(RedisIoAdapter);
  redisIoAdapter.connectToRedis(app.getHttpServer());

  await app.listen(4000);
}

bootstrap();
