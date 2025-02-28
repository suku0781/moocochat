import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Server } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisIoAdapter extends IoAdapter {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async connectToRedis(server: Server) {
    const redisUrl = this.configService.get<string>('REDIS_HOST');
    const redisPassword = this.configService.get<string>('REDIS_PW');
    console.log('url : ' + redisUrl);
    console.log('pw : ' + redisPassword);

    if (!redisUrl) {
      throw new Error(
        'Redis 설정이 올바르지 않습니다! .env 파일을 확인하세요.',
      );
    }

    try {
      const pubClient = createClient({
        url: redisUrl,
        password: redisPassword || undefined,
      });

      const subClient = pubClient.duplicate();

      await pubClient.connect();
      await subClient.connect();

      console.log('Redis Adapter 연결 성공!');

      const socketServer = server as any;

      socketServer.adapter(createAdapter(pubClient, subClient));
    } catch (error) {
      console.error('Redis Adapter 연결 실패:', error);
    }
  }
}
