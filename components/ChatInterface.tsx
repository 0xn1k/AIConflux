"use client";

import { useState, useEffect, useRef } from "react";
import { ALL_MODELS, DEFAULT_FREE_MODELS } from "@/lib/constants";
import BuyModelModal from "./BuyModelModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Sparkles,
  Lock,
  Bot,
  User as UserIcon,
  Zap,
  Brain,
  Cpu,
  MessageSquare,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  model?: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  currentChatId?: string;
}

export default function ChatInterface({ currentChatId }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>(DEFAULT_FREE_MODELS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [unlockedModels, setUnlockedModels] = useState<string[]>(DEFAULT_FREE_MODELS);
  const [showBuyModel, setShowBuyModel] = useState(false);
  const [modelToBuy, setModelToBuy] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserData();
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat session when currentChatId changes
  useEffect(() => {
    if (currentChatId === undefined) {
      // New chat - clear everything
      setMessages([]);
      setCurrentSessionId(undefined);
    } else {
      // Load existing chat session
      setCurrentSessionId(currentChatId);
      fetchHistory(currentChatId);
    }
  }, [currentChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUnlockedModels(data.unlockedModels || DEFAULT_FREE_MODELS);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const fetchHistory = async (sessionId?: string) => {
    try {
      const url = sessionId
        ? `/api/history?sessionId=${sessionId}`
        : "/api/history";
      const res = await fetch(url);
      const data = await res.json();
      if (data.history) {
        setMessages(
          data.history.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const handleModelToggle = (model: string) => {
    if (!unlockedModels.includes(model)) {
      setModelToBuy(model);
      setShowBuyModel(true);
      return;
    }

    setSelectedModels((prev) =>
      prev.includes(model)
        ? prev.filter((m) => m !== model)
        : [...prev, model]
    );
  };

  const handleSend = async () => {
    if (!message.trim() || selectedModels.length === 0) return;

    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
          models: selectedModels,
          sessionId: currentSessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needsUnlock) {
          alert(data.error);
        } else if (data.needsTokens) {
          alert(data.error);
        } else {
          alert(data.error || "Failed to send message");
        }
        return;
      }

      // Add AI responses
      const aiMessages: Message[] = data.responses.map((r: any) => ({
        role: "assistant" as const,
        content: r.response,
        model: r.model,
        timestamp: new Date(),
      }));

      setMessages((prev) => [...prev, ...aiMessages]);

      // Update sessionId if it's a new chat
      if (!currentSessionId && data.sessionId) {
        setCurrentSessionId(data.sessionId);
      }

      // Trigger UserStats refresh with updated data
      if (data.user) {
        window.dispatchEvent(new CustomEvent('userStatsUpdate', {
          detail: data.user
        }));
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModelUnlockSuccess = () => {
    fetchUserData();
    setShowBuyModel(false);
    setModelToBuy(null);
  };

  const getModelIcon = (model: string) => {
    if (model.toLowerCase().includes("gpt")) return <Brain className="h-4 w-4" />;
    if (model.toLowerCase().includes("claude")) return <Sparkles className="h-4 w-4" />;
    if (model.toLowerCase().includes("deepseek")) return <Cpu className="h-4 w-4" />;
    if (model.toLowerCase().includes("gemini")) return <Zap className="h-4 w-4" />;
    return <Bot className="h-4 w-4" />;
  };

  const getModelColor = (model: string) => {
    if (model.toLowerCase().includes("gpt")) return "from-green-500 to-emerald-600";
    if (model.toLowerCase().includes("claude")) return "from-purple-500 to-pink-600";
    if (model.toLowerCase().includes("deepseek")) return "from-blue-500 to-cyan-600";
    if (model.toLowerCase().includes("gemini")) return "from-orange-500 to-red-600";
    return "from-indigo-500 to-blue-600";
  };

  return (
    <>
      <div className="h-full flex flex-col bg-slate-900/30 backdrop-blur-sm">
        {/* Model Selector */}
        <div className="flex-shrink-0 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
            <h3 className="text-white font-semibold text-sm sm:text-base">AI Models</h3>
            {selectedModels.length > 0 && (
              <Badge className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                {selectedModels.length} active
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_MODELS.map((model) => {
              const isUnlocked = unlockedModels.includes(model);
              const isSelected = selectedModels.includes(model);

              return (
                <button
                  key={model}
                  onClick={() => handleModelToggle(model)}
                  className={`
                    group relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium transition-all duration-300
                    flex items-center gap-2 text-xs sm:text-sm
                    ${
                      isSelected
                        ? `bg-gradient-to-r ${getModelColor(model)} text-white shadow-lg scale-105 border-2 border-white/20`
                        : isUnlocked
                        ? "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600"
                        : "bg-slate-800/30 text-slate-500 border border-slate-700/50 hover:bg-slate-800/40"
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer rounded-xl"></div>
                  )}
                  <span className="relative flex items-center gap-2">
                    {getModelIcon(model)}
                    {model}
                    {!isUnlocked && <Lock className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-3 sm:px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4 sm:p-6 rounded-3xl shadow-2xl">
                  <MessageSquare className="w-10 h-10 sm:w-16 sm:h-16 text-white" />
                </div>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Start Your AI Conversation
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                Select one or more AI models above and type your message below to get started
              </p>
              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl">
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl mb-2">💡</div>
                  <p className="text-xs sm:text-sm text-slate-300">Ask anything</p>
                </div>
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl mb-2">🚀</div>
                  <p className="text-xs sm:text-sm text-slate-300">Get instant answers</p>
                </div>
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl mb-2">✨</div>
                  <p className="text-xs sm:text-sm text-slate-300">Compare responses</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 pb-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2 sm:gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  } animate-in fade-in slide-in-from-bottom-4 duration-500`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${getModelColor(msg.model || "")} flex items-center justify-center shadow-lg`}>
                        {getModelIcon(msg.model || "")}
                      </div>
                    </div>
                  )}
                  <div
                    className={`
                      max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-lg
                      ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white"
                          : "bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-slate-100"
                      }
                    `}
                  >
                    {msg.model && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                        {getModelIcon(msg.model)}
                        <span className="text-xs font-bold opacity-80">
                          {msg.model}
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{msg.content}</p>
                    <div className="mt-2 text-xs opacity-50">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {msg.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                        <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg animate-pulse">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-5 py-4 shadow-lg">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-purple-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-pink-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 bg-slate-900/50 backdrop-blur-xl border-t border-slate-800/50 p-3 sm:p-4">
          {selectedModels.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Sending to:</span>
              {selectedModels.map((model) => (
                <Badge
                  key={model}
                  onClick={() => handleModelToggle(model)}
                  className={`
                    bg-gradient-to-r ${getModelColor(model)} text-white border-0 text-xs
                    cursor-pointer hover:scale-105 transition-all duration-300
                    hover:shadow-lg group
                  `}
                >
                  {getModelIcon(model)}
                  <span className="ml-1">{model}</span>
                  <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">×</span>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative group">
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                placeholder={
                  selectedModels.length === 0
                    ? "Select at least one model..."
                    : "Type your message..."
                }
                disabled={loading || selectedModels.length === 0}
                className="
                  w-full h-12 sm:h-14 px-4 sm:px-6
                  bg-slate-800/50 backdrop-blur-sm
                  border-2 border-slate-700/50
                  text-white placeholder:text-slate-500
                  rounded-xl sm:rounded-2xl
                  focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  text-sm sm:text-base
                "
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-purple-500/10 group-focus-within:to-pink-500/10 rounded-xl sm:rounded-2xl pointer-events-none transition-all duration-300"></div>
            </div>
            <Button
              onClick={handleSend}
              disabled={loading || !message.trim() || selectedModels.length === 0}
              className="
                h-12 sm:h-14 px-4 sm:px-8
                bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
                hover:from-blue-500 hover:via-purple-500 hover:to-pink-500
                text-white font-semibold
                rounded-xl sm:rounded-2xl
                shadow-lg shadow-purple-500/50
                transition-all duration-300
                hover:scale-105 hover:shadow-purple-500/70
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                group
                text-sm sm:text-base
              "
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
              <span className="ml-2 hidden sm:inline">Send</span>
            </Button>
          </div>
        </div>
      </div>
      {showBuyModel && modelToBuy && (
        <BuyModelModal
          model={modelToBuy}
          onClose={() => {
            setShowBuyModel(false);
            setModelToBuy(null);
          }}
          onSuccess={handleModelUnlockSuccess}
        />
      )}
    </>
  );
}
