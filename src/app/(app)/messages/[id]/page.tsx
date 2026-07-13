"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { Card, Avatar, Button } from "@/components/ui/primitives";
import { colorFromString, cn } from "@/lib/utils";
import { Send, Paperclip, Check, CheckCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/lib/services/chat.service";
import { useAuth } from "@/lib/auth";

export default function ChatDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: chat, isLoading: isChatLoading } = useQuery({
    queryKey: ["chat", id],
    queryFn: () => chatService.getChat(id),
  });

  const { data: msgs = [], isLoading: isMsgsLoading } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => chatService.getMessages(id),
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => chatService.sendMessage(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", id] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const send = () => {
    if (!text.trim()) return;
    sendMutation.mutate(text);
    setText("");
  };

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

  return (
    <div className="animate-in mx-auto flex min-h-[70vh] max-w-3xl flex-col">
      <PageTitle title={chat.name} subtitle={chat.address} back="/messages" />
      <Card className="flex flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {msgs.length === 0 && (
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
        </div>
        <div className="flex items-center gap-2 border-t border-border p-3">
          <button className="rounded-xl p-2.5 text-text-muted hover:bg-surface-2">
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
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
