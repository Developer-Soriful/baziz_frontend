"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { Card, Avatar, Button } from "@/components/ui/primitives";
import { colorFromString, cn } from "@/lib/utils";
import { Send, Paperclip, Check, CheckCheck, Smile, Trash2, MoreVertical } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService, type ChatMessage } from "@/lib/services/chat.service";
import { useAuth } from "@/lib/auth";
import { useSocket } from "@/lib/socket";
import { Modal } from "@/components/ui/modal";

const REACTION_EMOJIS: Record<string, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

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

  // UI state for reactions & delete menus
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);

  const { data: chat, isLoading: isChatLoading } = useQuery({
    queryKey: ["chat", id],
    queryFn: () => chatService.getChat(id),
  });

  const { data: initialMsgs = [], isLoading: isMsgsLoading } = useQuery({
    queryKey: ["messages", id],
    queryFn: () => chatService.getMessages(id),
  });

  // Sync loaded messages once and mark last message as read
  useEffect(() => {
    if (initialMsgs.length > 0) {
      setMsgs(initialMsgs);
      const lastMsg = initialMsgs[initialMsgs.length - 1];
      const selfId = (user as any)?._id || user?.id;
      if (lastMsg && lastMsg.id && lastMsg.senderId !== selfId) {
        chatService.markAsRead(id, lastMsg.id).catch(() => {});
      }
    }
  }, [initialMsgs, id, user]);

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
              content: data.message.content?.text || (data.message.deletedAt ? "This message was deleted." : ""),
              timestamp: data.message.sentAt,
              read: false,
              deletedAt: data.message.deletedAt,
              reactions: data.message.reactions || [],
            },
          ];
        });

        // Automatically mark read if message is from the other user
        const selfId = (user as any)?._id || user?.id;
        if (data.message.senderId !== selfId) {
          chatService.markAsRead(id, data.message.id).catch(() => {});
        }
      }
    };

    const handleMessageUpdated = (data: { message: any }) => {
      if (data.message.conversationId === id) {
        setMsgs((prev) =>
          prev.map((m) => {
            if (m.id === data.message.id) {
              return {
                ...m,
                content: data.message.content?.text || (data.message.deletedAt ? "This message was deleted." : ""),
                reactions: data.message.reactions || [],
                deletedAt: data.message.deletedAt,
              };
            }
            return m;
          })
        );
      }
    };

    const handleMessageDeleted = (data: { messageId: string; scope: string; conversationId: string }) => {
      if (data.conversationId === id) {
        if (data.scope === "everyone") {
          setMsgs((prev) =>
            prev.map((m) => {
              if (m.id === data.messageId) {
                return {
                  ...m,
                  content: "This message was deleted.",
                  deletedAt: new Date().toISOString(),
                };
              }
              return m;
            })
          );
        } else {
          setMsgs((prev) => prev.filter((m) => m.id !== data.messageId));
        }
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:updated", handleMessageUpdated);
    socket.on("message:deleted", handleMessageDeleted);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:updated", handleMessageUpdated);
      socket.off("message:deleted", handleMessageDeleted);
    };
  }, [socket, id, user]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => chatService.sendMessage(id, content),
    onSuccess: (newMsg) => {
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

  const handleReact = async (messageId: string, emojiType: string) => {
    setActiveMenuId(null);
    const selfId = (user as any)?._id || user?.id;
    const msg = msgs.find((m) => m.id === messageId);
    const currentReaction = msg?.reactions?.find((r) => r.userId === selfId);

    try {
      if (currentReaction?.type === emojiType) {
        // Toggle off
        const updated = await chatService.removeReaction(messageId);
        setMsgs((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, reactions: updated.reactions || [] } : m))
        );
      } else {
        const updated = await chatService.addReaction(messageId, emojiType);
        setMsgs((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, reactions: updated.reactions || [] } : m))
        );
      }
    } catch (err) {
      console.error("Failed to update reaction", err);
    }
  };

  const handleDeleteMessage = async (scope: "me" | "everyone") => {
    if (!messageToDelete || !messageToDelete.id) return;
    try {
      await chatService.deleteMessage(messageToDelete.id, scope);
      if (scope === "everyone") {
        setMsgs((prev) =>
          prev.map((m) =>
            m.id === messageToDelete.id
              ? { ...m, content: "This message was deleted.", deletedAt: new Date().toISOString() }
              : m
          )
        );
      } else {
        setMsgs((prev) => prev.filter((m) => m.id !== messageToDelete.id));
      }
    } catch (err) {
      console.error("Failed to delete message", err);
    } finally {
      setDeleteModalOpen(false);
      setMessageToDelete(null);
    }
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

      <Card className="flex flex-1 flex-col overflow-hidden relative">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          {msgs.length === 0 && !isMsgsLoading && (
            <p className="text-center text-sm text-text-muted mt-10">
              No messages yet. Say hi!
            </p>
          )}
          {msgs.map((m) => {
            const selfId = (user as any)?._id || user?.id;
            const isMe = m.senderId === selfId;
            const isDeleted = !!m.deletedAt;

            const timeStr = m.timestamp
              ? new Date(m.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            // Group reactions
            const reactionCounts = (m.reactions || []).reduce((acc, curr) => {
              acc[curr.type] = (acc[curr.type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            return (
              <div
                key={m.id || m._id}
                className={cn(
                  "flex items-end gap-2 group relative",
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

                {/* Left/Right actions for messages */}
                {!isDeleted && (
                  <div
                    className={cn(
                      "flex items-center gap-1 bg-surface-2/90 border border-border px-1.5 py-0.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10",
                      isMe ? "order-first" : "order-last"
                    )}
                  >
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === m.id ? null : (m.id || null))}
                      className="p-1 text-text-muted hover:text-text rounded hover:bg-surface-3 transition"
                      title="React or Actions"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setMessageToDelete(m);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1 text-danger/80 hover:text-danger rounded hover:bg-danger/10 transition"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className="relative">
                  {/* Floating reactions picker bar if open */}
                  {activeMenuId === m.id && (
                    <div
                      className={cn(
                        "absolute bottom-[calc(100%+8px)] flex items-center gap-1.5 bg-surface border border-border p-1.5 rounded-xl shadow-xl z-20 animate-in fade-in slide-in-from-bottom-2",
                        isMe ? "right-0" : "left-0"
                      )}
                    >
                      {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => {
                        const hasReacted = m.reactions?.some((r) => r.userId === selfId && r.type === type);
                        return (
                          <button
                            key={type}
                            onClick={() => handleReact(m.id!, type)}
                            className={cn(
                              "text-lg hover:scale-125 transition-transform p-1 rounded-lg",
                              hasReacted && "bg-primary/10"
                            )}
                          >
                            {emoji}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[100%] rounded-2xl px-4 py-2.5 relative",
                      isMe
                        ? "rounded-br-sm bg-primary text-white"
                        : "rounded-bl-sm bg-surface-2",
                      isDeleted && "italic text-text-faint bg-surface-2"
                    )}
                  >
                    <p className="text-sm">{m.content}</p>

                    {/* Reactions view */}
                    {!isDeleted && m.reactions && m.reactions.length > 0 && (
                      <div
                        className={cn(
                          "flex items-center gap-1 mt-1.5 flex-wrap",
                          isMe ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className="flex items-center gap-0.5 bg-surface-3/80 border border-border/40 px-1.5 py-0.5 rounded-full text-xs text-text shadow-sm font-medium">
                          {Object.entries(reactionCounts).map(([type, count]) => (
                            <span key={type} className="inline-block" title={`${count} reaction(s)`}>
                              {REACTION_EMOJIS[type]}
                            </span>
                          ))}
                          <span className="text-[10px] text-text-muted ml-0.5">{m.reactions.length}</span>
                        </div>
                      </div>
                    )}

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

      {/* Delete message modal confirmation */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMessageToDelete(null);
        }}
        title="Delete Message"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteModalOpen(false);
                setMessageToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleDeleteMessage("me")}>
              Delete for me
            </Button>
            {messageToDelete &&
              (messageToDelete.senderId === ((user as any)?._id || user?.id)) && (
                <Button variant="danger" onClick={() => handleDeleteMessage("everyone")}>
                  Delete for everyone
                </Button>
              )}
          </div>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete this message? This action is permanent.
        </p>
      </Modal>
    </div>
  );
}
