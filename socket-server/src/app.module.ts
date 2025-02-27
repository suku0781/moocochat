import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ChatGateway],
})
export class AppModule {}
