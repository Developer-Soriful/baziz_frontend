"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth";
import { getAccessToken } from "./auth-storage";
import { env } from "./env";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  typingStatus: Record<string, { userId: string; isTyping: boolean }>;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingStatus, setTypingStatus] = useState<Record<string, { userId: string; isTyping: boolean }>>({});

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIsConnected(false);
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    // Resolve base origin URL dynamically from API url
    const origin = new URL(env.NEXT_PUBLIC_API_URL).origin;

    const socketInstance = io(origin, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected successfully");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    socketInstance.on("presence:update", (data: { userId: string; isOnline: boolean }) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        if (data.isOnline) {
          updated.add(data.userId);
        } else {
          updated.delete(data.userId);
        }
        return updated;
      });
    });

    socketInstance.on("typing:update", (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      setTypingStatus((prev) => ({
        ...prev,
        [data.conversationId]: { userId: data.userId, isTyping: data.isTyping },
      }));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  const joinConversation = (conversationId: string) => {
    if (socket) {
      socket.emit("conversation:join", { conversationId });
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socket) {
      socket.emit("conversation:leave", { conversationId });
    }
  };

  const startTyping = (conversationId: string) => {
    if (socket) {
      socket.emit("typing:start", { conversationId });
    }
  };

  const stopTyping = (conversationId: string) => {
    if (socket) {
      socket.emit("typing:stop", { conversationId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        typingStatus,
        joinConversation,
        leaveConversation,
        startTyping,
        stopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
