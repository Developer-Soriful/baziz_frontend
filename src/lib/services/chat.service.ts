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
    apiClient.get<any>(ENDPOINTS.CHAT.ROOMS).then((r) => {
      const data = r.data?.data;
      return (data?.conversations || data?.rooms || (Array.isArray(data) ? data : [])) as ChatPreview[];
    }),
    
  getMessages: (chatId: string) =>
    apiClient.get<any>(ENDPOINTS.CHAT.MESSAGES(chatId)).then((r) => (r.data.data.messages || r.data.data) as ChatMessage[]),
    
  sendMessage: (chatId: string, content: string) =>
    apiClient.post<ChatMessage>(ENDPOINTS.CHAT.MESSAGES(chatId), { content }).then((r) => r.data),
};
