import { createClient, RedisClientType } from 'redis';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisInstance {
  client: RedisClientType;
  subClient: RedisClientType;

  constructor() {
    // this.client = createClient({
    //   url: `${process.env.REDIS_HOST}`,
    //   password: `${process.env.REDIS_PW}`,
    //   socket: {
    //     connectTimeout: 60000,
    //   },
    // });
    // this.client.on('error', (err) => {
    //   console.log('redis error ', err);
    // });
    // this.client.connect().then(() => {
    //   console.log('Connect to redis done');
    // });
    // this.subClient = this.client.duplicate();
    // process.on('exit', () => {
    //   this.disconnect();
    // });
    // process.on('SIGINT', () => {
    //   this.disconnect();
    //   process.exit(2);
    // });
  }

  disconnect() {
    // console.log('disconnect');
    // this.client.quit();
  }
}
