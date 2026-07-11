import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface ChatMessage {
  id?: string;
  _id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ChatPreview {
  id: string; // Chat ID or User ID
  name: string;
  preview: string;
  time: string;
  address: string;
  category: "Tenant" | "Marketplace" | "Group";
  unread: number;
}

export const chatService = {
  getChats: () =>
    apiClient.get<ChatPreview[]>(ENDPOINTS.CHAT.ROOMS).then((r) => r.data),
    
  getMessages: (chatId: string) =>
    apiClient.get<ChatMessage[]>(ENDPOINTS.CHAT.MESSAGES(chatId)).then((r) => r.data),
    
  sendMessage: (chatId: string, content: string) =>
    apiClient.post<ChatMessage>(ENDPOINTS.CHAT.MESSAGES(chatId), { content }).then((r) => r.data),
};
