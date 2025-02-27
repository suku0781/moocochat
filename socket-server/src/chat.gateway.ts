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

@WebSocketGateway({
  transport: ['websocket'],
  namespace: '/',
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(private readonly httpService: HttpService) {}

  private socketRoomName(roomId: number) {
    return `room:${roomId}`;
  }

  @WebSocketServer()
  server: Server;

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

    console.log(`사용자 ${userId} 연결 완료`);
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
      console.error('Error joining room:', e);
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
      console.log(chatModel);

      // const userResponse = await lastValueFrom(
      //   this.httpService.get(`http://localhost:3000/user?userId=${userId}`),
      // );
      // chatModel.sender = userResponse.data;

      this.server.to(this.socketRoomName(body.roomId)).emit('message', {
        chat: chatModel,
      });
    } catch (e) {
      console.log(e);
    }
  }
}
