import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatJoinSocketDto, ChatMessageSocketDto } from './dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { RedisIoAdapter } from './redis.adapter';
import { Injectable, OnModuleInit } from '@nestjs/common';

@WebSocketGateway({
  transport: ['websocket'],
  namespace: '/',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class ChatGateway implements OnModuleInit {
  constructor(
    private readonly httpService: HttpService,
    private readonly redisIoAdapter: RedisIoAdapter, // RedisIoAdapter 추가
  ) {}

  @WebSocketServer()
  server: Server;

  // 서버가 실행될 때 Redis Adapter 연결
  async onModuleInit() {
    this.redisIoAdapter.connectToRedis(this.server);
  }

  private socketRoomName(roomId: number) {
    return `room:${roomId}`;
  }

  // WebSocket 연결 시 userId 저장
  async handleConnection(@ConnectedSocket() socket: Socket) {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      console.error('userId 없음. 연결 종료');
      socket.disconnect();
      return;
    }

    socket.data.userId = userId;
    socket.emit('authenticated', { userId });

    console.log(`사용자 ${userId} WebSocket 연결 완료`);
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() body: ChatJoinSocketDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `http://localhost:3000/chat/room?roomId=${body.roomId}`,
        ),
      );
      const chatRoom = response.data;

      socket.join(this.socketRoomName(body.roomId));

      socket.emit('room', {
        room: chatRoom,
      });
    } catch (e) {
      console.error('채팅방 참가 중 오류 발생:', e);
    }
  }

  @SubscribeMessage('message')
  async send(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: ChatMessageSocketDto,
  ) {
    try {
      const userId = socket.data.userId;
      if (!userId) throw new Error('User not authenticated');

      const response = await lastValueFrom(
        this.httpService.post(`http://localhost:3000/chat/message`, {
          userId,
          roomId: body.roomId,
          message: body.message,
        }),
      );
      const chatModel = response.data;

      console.log('📢 채팅 메시지 전송:', chatModel);

      // Redis를 통해 다른 서버에서도 동일한 메시지 브로드캐스트
      this.server.to(this.socketRoomName(body.roomId)).emit('message', {
        chat: chatModel,
      });
    } catch (e) {
      console.error('메시지 전송 중 오류 발생:', e);
    }
  }
}
