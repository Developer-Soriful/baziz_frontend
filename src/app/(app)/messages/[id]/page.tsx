"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { Card, Avatar, Button } from "@/components/ui/primitives";
import { colorFromString, cn } from "@/lib/utils";
import { Send, Paperclip, Check, CheckCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService, type ChatMessage } from "@/lib/services/chat.service";
import { useAuth } from "@/lib/auth";
import { useSocket } from "@/lib/socket";

export default function ChatDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    socket,
    onlineUsers,
    typingStatus,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
  } = useSocket();

  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: chat, isLoading: isChatLoading } = useQuery({
    queryKey: ["chat", id],
    queryFn: () => chatService.getChat(id),
  });

  const { data: initialMsgs = [], isLoading: isMsgsLoading } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => chatService.getMessages(id),
  });

  // Sync loaded messages once
  useEffect(() => {
    if (initialMsgs.length > 0) {
      setMsgs(initialMsgs);
    }
  }, [initialMsgs]);

  // Connect & Join room on mount
  useEffect(() => {
    if (id) {
      joinConversation(id);
      return () => {
        leaveConversation(id);
      };
    }
  }, [id, joinConversation, leaveConversation]);

  // Real-time message events listener
  useEffect(() => {
    if (!socket || !id) return;

    const handleNewMessage = (data: { message: any; conversationId: string }) => {
      if (data.conversationId === id) {
        setMsgs((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [
            ...prev,
            {
              id: data.message.id,
              _id: data.message.id,
              senderId: data.message.senderId,
              receiverId: data.message.conversationId,
              content: data.message.content?.text || "",
              timestamp: data.message.sentAt,
              read: false,
            },
          ];
        });
      }
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket, id]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => chatService.sendMessage(id, content),
    onSuccess: (newMsg) => {
      // Optimistic or direct push
      setMsgs((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const send = () => {
    if (!text.trim()) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    stopTyping(id);
    sendMutation.mutate(text);
    setText("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    startTyping(id);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(id);
    }, 2000);
  };

  // Scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs]);

  if (isChatLoading) {
    return (
      <div className="p-10 text-center text-text-muted">Loading chat...</div>
    );
  }

  if (!chat) {
    return (
      <div className="p-10 text-center text-text-muted">Chat not found</div>
    );
  }

  // Find other participant user ID if direct chat
  const otherParticipant = chat.participants?.find(
    (p: any) => p.userId !== (user as any)?._id && p.userId !== user?.id
  ) || chat;

  const otherUserId = otherParticipant?.userId || "";
  const isOtherOnline = otherUserId && onlineUsers.has(otherUserId);

  // Check if other participant is currently typing
  const currentTypingState = typingStatus[id];
  const isOtherTyping =
    currentTypingState?.isTyping &&
    currentTypingState?.userId !== (user as any)?._id &&
    currentTypingState?.userId !== user?.id;

  return (
    <div className="animate-in mx-auto flex min-h-[70vh] max-w-3xl flex-col">
      <div className="flex items-center justify-between">
        <PageTitle title={chat.name} subtitle={chat.address} back="/messages" />
        {isOtherOnline && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Online
          </span>
        )}
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {msgs.length === 0 && !isMsgsLoading && (
            <p className="text-center text-sm text-text-muted mt-10">
              No messages yet. Say hi!
            </p>
          )}
          {msgs.map((m) => {
            const isMe =
              m.senderId === (user as any)?._id || m.senderId === user?.id;
            const timeStr = m.timestamp
              ? new Date(m.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <div
                key={m.id || m._id}
                className={cn(
                  "flex items-end gap-2",
                  isMe ? "justify-end" : "justify-start",
                )}
              >
                {!isMe && (
                  <Avatar
                    name={chat.name}
                    color={colorFromString(chat.name)}
                    size={30}
                  />
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5",
                    isMe
                      ? "rounded-br-sm bg-primary text-white"
                      : "rounded-bl-sm bg-surface-2",
                  )}
                >
                  <p className="text-sm">{m.content}</p>
                  <p
                    className={cn(
                      "mt-1 flex items-center gap-1 text-[10px]",
                      isMe ? "text-white/70" : "text-text-faint",
                    )}
                  >
                    {timeStr}
                    {isMe &&
                      (m.read ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      ))}
                  </p>
                </div>
              </div>
            );
          })}

          {isOtherTyping && (
            <div className="flex items-center gap-2 justify-start">
              <Avatar
                name={chat.name}
                color={colorFromString(chat.name)}
                size={30}
              />
              <div className="rounded-2xl rounded-bl-sm bg-surface-2 px-4 py-3">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 border-t border-border p-3">
          <button className="rounded-xl p-2.5 text-text-muted hover:bg-surface-2">
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            value={text}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
            className="input-base flex-1"
            disabled={sendMutation.isPending}
          />
          <Button
            onClick={send}
            disabled={sendMutation.isPending}
            className="!px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
