"use client";

import { useState } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { Send, Sparkles } from "lucide-react";

interface Msg { id: number; text: string; bot: boolean; time: string; }
const quick = ["Rent Status", "Maintenance", "Market Trends", "Add Expense"];

export default function AiAssistantPage() {
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 1, text: "Hello! I am your Propertera AI Assistant. How can I help you manage your portfolio today?", bot: true, time: "Just now" }]);
  const [text, setText] = useState("");

  const send = (t: string) => {
    if (!t.trim()) return;
    setMsgs((m) => [...m, { id: Date.now(), text: t, bot: false, time: "Now" }]);
    setText("");
    setTimeout(() => setMsgs((m) => [...m, { id: Date.now() + 1, text: "I am analyzing your portfolio data… I will have an answer for you in a moment.", bot: true, time: "Now" }]), 900);
  };

  return (
    <div className="animate-in mx-auto flex min-h-[70vh] max-w-3xl flex-col">
      <PageTitle title="AI Assistant" subtitle="Get help from AI" />
      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {msgs.map((m) => (
            <div key={m.id} className={cn("flex items-end gap-2", m.bot ? "justify-start" : "justify-end")}>
              {m.bot && <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-primary"><Sparkles className="h-4 w-4" /></span>}
              <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5", m.bot ? "rounded-bl-sm bg-surface-2" : "rounded-br-sm bg-primary text-white")}><p className="text-sm">{m.text}</p></div>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-3">
          <div className="mb-2 flex flex-wrap gap-2">{quick.map((q) => <button key={q} onClick={() => send(`Can you show me ${q.toLowerCase()}?`)} className="rounded-full border border-border-strong px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:border-primary hover:text-primary">{q}</button>)}</div>
          <div className="flex items-center gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(text)} placeholder="Ask Propertera AI..." className="input-base flex-1" />
            <Button onClick={() => send(text)} className="!px-3"><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
