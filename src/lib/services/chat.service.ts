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
      const convos =
        data?.conversations || data?.rooms || (Array.isArray(data) ? data : []);

      return convos.map((c: any) => {
        // Find other participant for name
        const otherParticipant = c.participants?.find(
          (p: any) =>
            p.user &&
            p.user.id !==
              c.participants.find((self: any) => !self.user)?.userId,
        ); // simplified heuristic, mostly relies on 'not me'

        // Attempt to find viewerId by assuming it's the one not easily mapped or we just find first other user
        const other = c.participants?.find((p: any) => p.user);

        let name = c.title;
        if (c.type === "direct" && other?.user) {
          name = other.user.firstName || other.user.name || "User";
        }

        const lastMsgTime = c.lastMessage?.sentAt
          ? new Date(c.lastMessage.sentAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";

        const categoryMap: any = {
          tenant: "Tenant",
          marketplace: "Marketplace",
          group: "Group",
        };

        return {
          id: c.id,
          name: name || "Chat",
          preview: c.lastMessage?.text || "No messages yet",
          time: lastMsgTime,
          address: c.title || "Property",
          category: categoryMap[c.category] || "Tenant",
          unread: c.unreadCount || 0,
        } as ChatPreview;
      });
    }),

  getChat: (id: string) =>
    apiClient.get<any>(`${ENDPOINTS.CHAT.ROOMS}/${id}`).then((r) => {
      const c = r.data?.data?.conversation;
      if (!c) return null;

      const other = c.participants?.find((p: any) => p.user);
      let name = c.title;
      if (c.type === "direct" && other?.user) {
        name = other.user.firstName || other.user.name || "User";
      }

      const categoryMap: any = {
        tenant: "Tenant",
        marketplace: "Marketplace",
        group: "Group",
      };

      return {
        id: c.id,
        name: name || "Chat",
        preview: c.lastMessage?.text || "No messages yet",
        time: c.lastMessage?.sentAt
          ? new Date(c.lastMessage.sentAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        address: c.title || "Property",
        category: categoryMap[c.category] || "Tenant",
        unread: c.unreadCount || 0,
      } as ChatPreview;
    }),

  getMessages: (chatId: string) =>
    apiClient.get<any>(ENDPOINTS.CHAT.MESSAGES(chatId)).then((r) => {
      const messages = r.data?.data?.messages || r.data?.data || [];
      return messages.map((m: any) => ({
        id: m.id,
        _id: m.id,
        senderId: m.senderId,
        receiverId: m.conversationId,
        content: m.content?.text || "",
        timestamp: m.sentAt,
        read: m.readBy?.length > 0,
      })) as ChatMessage[];
    }),

  sendMessage: (chatId: string, content: string) =>
    apiClient
      .post<any>(ENDPOINTS.CHAT.MESSAGES(chatId), { text: content })
      .then((r) => {
        const m = r.data?.data?.message;
        return {
          id: m.id,
          _id: m.id,
          senderId: m.senderId,
          receiverId: m.conversationId,
          content: m.content?.text || "",
          timestamp: m.sentAt,
          read: false,
        } as ChatMessage;
      }),
};
