"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { Card, Avatar, Button } from "@/components/ui/primitives";
import { chats } from "@/lib/data";
import { colorFromString, cn } from "@/lib/utils";
import { Send, Paperclip, Check, CheckCheck } from "lucide-react";

interface Msg { id: number; text: string; me: boolean; time: string; read?: boolean; }

export default function ChatDetail() {
  const { id } = useParams<{ id: string }>();
  const chat = chats.find((c) => c.id === id) ?? chats[0];
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, text: "Hi! The bathroom tap is still dripping. Could you arrange a plumber?", me: false, time: "10:28 AM" },
    { id: 2, text: "Of course — I'll get someone out this week. I'll keep you posted.", me: true, time: "10:31 AM", read: true },
  ]);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { id: Date.now(), text, me: true, time: "Now", read: false }]);
    setText("");
  };

  return (
    <div className="animate-in mx-auto flex min-h-[70vh] max-w-3xl flex-col">
      <PageTitle title={chat.name} subtitle={chat.address} back="/messages" />
      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {msgs.map((m) => (
            <div key={m.id} className={cn("flex items-end gap-2", m.me ? "justify-end" : "justify-start")}>
              {!m.me && <Avatar name={chat.name} color={colorFromString(chat.name)} size={30} />}
              <div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5", m.me ? "rounded-br-sm bg-primary text-white" : "rounded-bl-sm bg-surface-2")}>
                <p className="text-sm">{m.text}</p>
                <p className={cn("mt-1 flex items-center gap-1 text-[10px]", m.me ? "text-white/70" : "text-text-faint")}>{m.time}{m.me && (m.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-border p-3">
          <button className="rounded-xl p-2.5 text-text-muted hover:bg-surface-2"><Paperclip className="h-5 w-5" /></button>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message…" className="input-base flex-1" />
          <Button onClick={send} className="!px-3"><Send className="h-4 w-4" /></Button>
        </div>
      </Card>
    </div>
  );
}
