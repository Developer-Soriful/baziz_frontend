"use client";

import React, { useState, useRef, useEffect } from "react";
import { PageTitle } from "@/components/page-title";
import { Card, Button } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { 
  Send, 
  Sparkles, 
  TrendingUp, 
  Newspaper, 
  Lightbulb, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  Loader2
} from "lucide-react";
import { isNewsQuery, getCompletion, ChatMessage, ExaResult } from "@/lib/services/aiAssistant.service";
import { useToast } from "@/components/ui/toast";

interface Msg {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
  isNews?: boolean;
  isVoice?: boolean;
  sources?: ExaResult[];
}

const SUGGESTIONS = [
  { text: "What's my total rental income?", icon: TrendingUp },
  { text: "Latest UK property market news", icon: Newspaper },
  { text: "Which of my properties has the best yield?", icon: Lightbulb },
  { text: "How can I improve my portfolio cashflow?", icon: TrendingUp },
];

export default function AiAssistantPage() {
  const toast = useToast();
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! I am your Propertera AI Assistant. How can I help you manage your portfolio today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [text, setText] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [pendingText, setPendingText] = useState("Thinking...");
  const [isRecording, setIsRecording] = useState(false);
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of messages container
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  // Setup Web Speech API recognition for voice input
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-GB";

        rec.onstart = () => {
          setIsRecording(true);
          toast("Listening... Speak your question.");
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleSend(transcript, true);
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
          if (event.error === "no-speech") {
            toast("I couldn't hear you clearly. Please try speaking again.", "error");
          } else {
            toast("I couldn't transcribe your voice. Please check microphone permission.", "error");
          }
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const handleSend = async (messageText: string, isVoice = false) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMsgId = Date.now().toString();
    const newUserMsg: Msg = {
      id: userMsgId,
      role: "user",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setText("");

    // Detect if this is a news query to show appropriate loading text
    const isNews = isNewsQuery(messageText);
    setPendingText(isNews ? "Searching for latest UK property news..." : "Thinking...");
    setIsPending(true);

    try {
      // Map state messages to API request structure
      const chatHistory: ChatMessage[] = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text
        }));
      chatHistory.push({ role: "user", content: messageText });

      const response = await getCompletion(chatHistory, isNews);

      const botMsg: Msg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isNews,
        sources: response.sources
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      toast("Connection error. Could not reach AI gateway.", "error");
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: "Sorry, I encountered an issue processing your request. Please verify your connection and try again.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsPending(false);
    }
  };

  // Toggle speech-to-text recording
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast("Speech recognition is not supported in this browser.", "error");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      // Stop any playing TTS first
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
        setActiveSpeechMsgId(null);
      }
      recognitionRef.current.start();
    }
  };

  // Speak bot message using HTML5 Web Speech Synthesis API
  const speakMessage = (msgId: string, textToSpeak: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast("Text-to-speech is not supported in this browser.", "error");
      return;
    }

    if (activeSpeechMsgId === msgId) {
      window.speechSynthesis.cancel();
      setActiveSpeechMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Clean text from markdown bold/italic formatting
    const cleanText = textToSpeak.replace(/[\*\#\-\`]/g, "");
    
    const utterance = new SpeechSynthesisUtterance(cleanText.substring(0, 1000));
    utterance.lang = "en-GB";
    
    utterance.onend = () => {
      setActiveSpeechMsgId(null);
    };

    utterance.onerror = () => {
      setActiveSpeechMsgId(null);
    };

    setActiveSpeechMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const hasOnlyWelcome = messages.length === 1 && messages[0].id === "welcome";

  return (
    <div className="animate-in mx-auto flex min-h-[78vh] max-w-4xl flex-col">
      <PageTitle title="AI Portfolio Assistant" subtitle="Ask questions about UK property regulations, yields, stamp duty, or view market news" />
      
      <Card className="flex flex-1 flex-col overflow-hidden h-[600px] border border-border">
        {/* Messages body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-surface-1">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex items-start gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
              {/* Bot icon / Newspaper icon */}
              {m.role === "assistant" && (
                <span className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full shadow-sm",
                  m.isNews ? "bg-accent/12 text-accent" : "bg-primary/12 text-primary"
                )}>
                  {m.isNews ? <Newspaper className="h-4.5 w-4.5" /> : <Sparkles className="h-4.5 w-4.5" />}
                </span>
              )}

              {/* Message Bubble */}
              <div className="flex flex-col max-w-[78%] space-y-1.5">
                <div className={cn(
                  "rounded-2xl px-4 py-3 shadow-sm",
                  m.role === "user" 
                    ? "rounded-tr-sm bg-primary text-white" 
                    : "rounded-tl-sm bg-surface-2 border border-border"
                )}>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-[10px] opacity-60 font-semibold uppercase tracking-wider">
                      {m.role === "user" ? (m.isVoice ? "Voice Input" : "You") : "AI Assistant"}
                    </span>
                    <span className="text-[10px] opacity-60">{m.time}</span>
                  </div>

                  <p className="text-sm whitespace-pre-line leading-relaxed">{m.text}</p>

                  {/* Speak button for Bot messages */}
                  {m.role === "assistant" && (
                    <button 
                      onClick={() => speakMessage(m.id, m.text)}
                      className="mt-2 flex items-center gap-1.5 text-xs text-text-muted hover:text-primary transition"
                    >
                      {activeSpeechMsgId === m.id ? (
                        <>
                          <VolumeX className="h-3.5 w-3.5 text-danger" />
                          <span>Stop playback</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* News Search Citations / Source Cards */}
                {m.sources && m.sources.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                    {m.sources.map((src, idx) => (
                      <a 
                        key={idx}
                        href={src.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2 border border-border hover:border-accent hover:bg-surface-3 transition"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-xs font-bold truncate text-text-strong">{src.title}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">
                            Source {idx + 1} &bull; {src.publishedDate ? new Date(src.publishedDate).toLocaleDateString() : "News Article"}
                          </p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-text-muted flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Pending Typing Indicator */}
          {isPending && (
            <div className="flex items-center gap-3 justify-start animate-pulse">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </span>
              <div className="rounded-2xl rounded-tl-sm bg-surface-2 border border-border px-4 py-3">
                <p className="text-xs text-text-muted font-medium flex items-center gap-2">
                  <span>{pendingText}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Input panel */}
        <div className="border-t border-border p-4 bg-surface-2">
          {/* Suggestion Chips */}
          {hasOnlyWelcome && (
            <div className="mb-3">
              <p className="text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">Quick Prompts:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUGGESTIONS.map((sug, idx) => {
                  const Icon = sug.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(sug.text)}
                      className="flex items-center gap-2 text-left p-2.5 rounded-xl border border-border bg-surface-1 text-xs text-text-strong font-medium transition hover:border-primary hover:text-primary hover:bg-primary/5"
                    >
                      <Icon className="h-4 w-4 text-text-muted flex-shrink-0" />
                      <span>{sug.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input field controls */}
          <div className="flex items-center gap-2">
            <input 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleSend(text)}
              disabled={isPending || isRecording}
              placeholder={isRecording ? "Transcribing voice input..." : "Ask Propertera AI about tax rules, yields, or news..."} 
              className="input-base flex-1 focus:ring-primary focus:border-primary" 
            />

            {/* Speech-to-text toggler */}
            <Button 
              variant={isRecording ? "danger" : "outline"} 
              onClick={toggleRecording}
              disabled={isPending}
              className="!px-3"
            >
              {isRecording ? <MicOff className="h-4.5 w-4.5 animate-pulse" /> : <Mic className="h-4.5 w-4.5" />}
            </Button>

            {/* Submit button */}
            <Button 
              onClick={() => handleSend(text)} 
              disabled={isPending || isRecording || !text.trim()} 
              className="!px-4 bg-primary text-white"
            >
              <Send className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
