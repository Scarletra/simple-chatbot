export interface AttachedFile {
  id: number;
  name: string;
  type: string;
  size: number;
  file: File;
  data?: string;
}

export interface Recommendation {
  type: 'video' | 'pdf' | 'image';
  title: string;
  thumbnail?: string;
  duration?: string;
  pages?: number;
  size?: string;
  src?: string;
  downloadUrl?: string;
  filename?: string;
}

export interface Message {
  id: number;
  type: 'bot' | 'user';
  content: string;
  files?: AttachedFile[];
  recommendations?: Recommendation[];
  timestamp: Date;
}

export type MessageType = 'bot' | 'user';

export interface ChatbotState {
  messages: Message[];
  inputMessage: string;
  attachedFiles: AttachedFile[];
  isTyping: boolean;
}