import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server } from 'socket.io';
import Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  async connectToRedis(server: Server) {
    const pubClient = new Redis({ host: 'localhost', port: 6379 });
    const subClient = pubClient.duplicate();

    const socketServer = server as any;
    if (!socketServer.of) {
      console.error('server is not a valid Socket.IO server instance!');
      return;
    }

    socketServer.adapter(createAdapter(pubClient, subClient));
  }
}
