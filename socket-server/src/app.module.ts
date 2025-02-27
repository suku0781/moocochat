import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RedisIoAdapter } from './redis.adapter';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'dev.env',
    }),
  ],
  providers: [ChatGateway, RedisIoAdapter],
})
export class AppModule {}
