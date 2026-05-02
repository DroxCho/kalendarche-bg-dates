import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Trash2, Download, Upload, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

type SavedConversation = {
  id: string;
  title: string;
  messages: Message[];
  savedAt: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const STORAGE_KEY = "chatbot_conversations";

function loadConversations(): SavedConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConversations(convos: SavedConversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convos));
}

function generateTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "Разговор";
  return first.content.length > 40
    ? first.content.slice(0, 40) + "…"
    : first.content;
}

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || "Грешка при връзка с AI");
    return;
  }

  if (!resp.body) {
    onError("Няма отговор от AI");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

const ChatBot = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBg = i18n.language === "bg";

  useEffect(() => {
    setSavedConversations(loadConversations());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !showHistory) inputRef.current?.focus();
  }, [isOpen, showHistory]);

  const clearChat = useCallback(() => {
    setMessages([]);
    toast.success(isBg ? "Чатът е изчистен" : "Chat cleared");
  }, [isBg]);

  const saveConversation = useCallback(() => {
    if (messages.length === 0) {
      toast.error(isBg ? "Няма съобщения за запазване" : "No messages to save");
      return;
    }
    const convo: SavedConversation = {
      id: crypto.randomUUID(),
      title: generateTitle(messages),
      messages: [...messages],
      savedAt: new Date().toISOString(),
    };
    const updated = [convo, ...savedConversations].slice(0, 20);
    setSavedConversations(updated);
    saveConversations(updated);
    toast.success(isBg ? "Разговорът е запазен" : "Conversation saved");
  }, [messages, savedConversations, isBg]);

  const loadConversation = useCallback((convo: SavedConversation) => {
    setMessages(convo.messages);
    setShowHistory(false);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      const updated = savedConversations.filter((c) => c.id !== id);
      setSavedConversations(updated);
      saveConversations(updated);
      toast.success(isBg ? "Разговорът е изтрит" : "Conversation deleted");
    },
    [savedConversations, isBg]
  );

  const exportConversations = useCallback(() => {
    const json = JSON.stringify(savedConversations, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-history.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isBg ? "Историята е експортирана" : "History exported");
  }, [savedConversations, isBg]);

  const importConversations = useCallback(() => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (Array.isArray(data)) {
            setSavedConversations(data);
            saveConversations(data);
            toast.success(isBg ? "Историята е импортирана" : "History imported");
          }
        } catch {
          toast.error(isBg ? "Невалиден файл" : "Invalid file");
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  }, [isBg]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (msg) => {
          toast.error(msg);
          setIsLoading(false);
        },
      });
    } catch {
      toast.error(isBg ? "Грешка при връзка с AI" : "Error connecting to AI");
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-4rem)] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold text-sm">
                {isBg ? "AI Асистент" : "AI Assistant"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={saveConversation}>
                    <Download className="h-4 w-4 mr-2" />
                    {isBg ? "Запази разговора" : "Save conversation"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowHistory(!showHistory)}>
                    <History className="h-4 w-4 mr-2" />
                    {isBg ? "История" : "History"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportConversations}>
                    <Download className="h-4 w-4 mr-2" />
                    {isBg ? "Експорт (JSON)" : "Export (JSON)"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={importConversations}>
                    <Upload className="h-4 w-4 mr-2" />
                    {isBg ? "Импорт (JSON)" : "Import (JSON)"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearChat} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isBg ? "Изчисти чата" : "Clear chat"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* History panel */}
          {showHistory ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  {isBg ? "Запазени разговори" : "Saved conversations"}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)} className="text-xs h-7">
                  {isBg ? "Назад" : "Back"}
                </Button>
              </div>
              {savedConversations.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">
                  {isBg ? "Няма запазени разговори" : "No saved conversations"}
                </p>
              ) : (
                savedConversations.map((convo) => (
                  <div
                    key={convo.id}
                    className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer group"
                    onClick={() => loadConversation(convo)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{convo.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(convo.savedAt).toLocaleDateString(isBg ? "bg-BG" : "en-US")} · {convo.messages.length}{" "}
                        {isBg ? "съобщ." : "msgs"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(convo.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    {isBg
                      ? "Здравейте! 👋 Попитайте ме за български празници, именни дни или нещо друго."
                      : "Hello! 👋 Ask me about Bulgarian holidays, name days, or anything else."}
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex gap-2 items-center">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-xl px-3 py-2">
                      <span className="inline-flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-3 flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={isBg ? "Напишете съобщение..." : "Type a message..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  onClick={send}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;
