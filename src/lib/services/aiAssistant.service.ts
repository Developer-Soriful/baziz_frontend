/**
 * AI Assistant Service (Frontend)
 * All AI, news search, and audio calls are proxied through our own backend.
 * No third-party secrets are exposed to the browser.
 */

import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ExaResult {
  title: string;
  url: string;
  publishedDate?: string;
  highlights?: string[];
}

// ─── Keyword Detection (client-side only for UI feedback) ─────────────────────

export const isNewsQuery = (text: string): boolean => {
  const lower = text.toLowerCase();
  const keywords = [
    "news", "latest", "update", "today", "this week", "this month", "recent",
    "market update", "property market", "housing market", "interest rate",
    "bank of england", "base rate", "mortgage rate", "regulation",
    "renters reform", "renters rights", "section 21", "eviction", "legislation",
    "stamp duty", "sdlt", "budget", "tax change", "housing policy", "breaking",
    "2025", "2026",
  ];
  return keywords.some((kw) => lower.includes(kw));
};

// ─── Chat Completion via Backend Proxy ────────────────────────────────────────

export const getCompletion = async (
  messages: ChatMessage[],
  isNews = false
): Promise<{ text: string; sources?: ExaResult[] }> => {
  const response = await apiClient.post<any>(ENDPOINTS.AI.CHAT, { messages, isNews });
  const data = response.data?.data || response.data;
  return {
    text: data.text || "",
    sources: data.sources,
  };
};

// ─── Audio Transcription via Backend Proxy ────────────────────────────────────

export const transcribeAudio = async (
  base64Audio: string,
  mediaType = "audio/m4a"
): Promise<string> => {
  const response = await apiClient.post<any>(ENDPOINTS.AI.TRANSCRIBE, { base64Audio, mediaType });
  return response.data?.data?.text || "";
};

// ─── Exported service object (legacy-compatible) ─────────────────────────────

export const aiAssistantService = {
  isNewsQuery,
  getCompletion,
  transcribeAudio,
};
