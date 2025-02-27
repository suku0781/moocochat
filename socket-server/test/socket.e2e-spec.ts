import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { io, Socket } from 'socket.io-client';

describe('WebSocket Server (e2e)', () => {
  let app: INestApplication;
  let socket: Socket;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.listen(4000);
  });

  afterAll(async () => {
    socket.close();
    await app.close();
  });

  it('✅ WebSocket 연결 테스트', (done) => {
    socket = io('http://localhost:4000', { auth: { userId: 1 } });

    socket.on('connect', () => {
      expect(socket.connected).toBe(true);
      done();
    });

    socket.on('connect_error', (err) => {
      done.fail(`WebSocket 연결 실패: ${err.message}`);
    });
  });

  it('✅ 채팅방 참가 테스트', (done) => {
    socket.emit('join', { roomId: 3 });

    socket.on('room', (data) => {
      expect(data).toHaveProperty('room');
      done();
    });

    socket.on('error', (err) => {
      done.fail(`채팅방 참가 실패: ${err.message}`);
    });
  });

  it('✅ 메시지 전송 테스트', (done) => {
    socket.emit('message', {
      roomId: 3,
      message: 'e2e 테스트중!',
    });

    socket.on('message', (data) => {
      expect(data.chat).toHaveProperty('senderId', 1);
      expect(data.chat).toHaveProperty('roomId', 3);
      expect(data.chat).toHaveProperty('content', 'e2e 테스트중!');
      done();
    });

    socket.on('error', (err) => {
      done.fail(`메시지 전송 실패: ${err.message}`);
    });
  });
});
