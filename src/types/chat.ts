export type MessageType = 'text' | 'voice';

export interface IChatMessage {
  _id: string;
  enquiryId: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType: MessageType;
  voiceDuration?: number;
  voiceUrl?: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}
