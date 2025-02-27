export class ChatJoinSocketDto {
  roomId: number;
}

export class ChatMessageSocketDto {
  userId: number;
  roomId: number;
  message: string;
}
