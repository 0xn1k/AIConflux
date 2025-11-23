"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquarePlus,
  Clock,
  Sparkles,
  Trash2,
  ChevronRight,
  Zap,
  Brain,
} from "lucide-react";

interface ChatHistory {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
}

interface ChatSidebarProps {
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  currentChatId?: string;
}

export default function ChatSidebar({
  onNewChat,
  onSelectChat,
  currentChatId,
}: ChatSidebarProps) {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      if (data.sessions) {
        setChatHistory(
          data.sessions.map((session: any) => ({
            id: session.sessionId,
            title: session.title,
            preview: session.preview,
            timestamp: new Date(session.lastMessage),
            messageCount: session.messageCount,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();

    // Set up interval to refresh sessions
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleDeleteChat = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch("/api/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      if (res.ok) {
        // Refresh the chat list
        await fetchSessions();

        // If the deleted chat was currently selected, create a new chat
        if (currentChatId === sessionId) {
          onNewChat();
        }
      } else {
        alert(data.error || "Failed to delete chat");
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
      alert("Failed to delete chat. Please try again.");
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800/50">
      {/* Header with gradient */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 backdrop-blur-sm border-b border-slate-800/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-lg opacity-50 animate-pulse"></div>
            <Avatar className="relative h-10 w-10 sm:h-12 sm:w-12 border-2 border-slate-700">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
              AI Conflux
            </h2>
            <p className="text-xs text-slate-400 truncate">Multi-AI Chat</p>
          </div>
          <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse hidden sm:block" />
        </div>

        {/* New Chat Button */}
        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/70 group"
        >
          <MessageSquarePlus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm sm:text-base">New Chat</span>
          <Zap className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </div>

      {/* Chat History Section */}
      <div className="flex-1 overflow-hidden">
        <div className="p-3 sm:p-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          <h3 className="text-xs sm:text-sm font-semibold text-slate-300">
            Recent Chats
          </h3>
          <Badge
            variant="outline"
            className="ml-auto text-xs border-purple-500/50 text-purple-400 bg-purple-500/10"
          >
            {chatHistory.length}
          </Badge>
        </div>

        <Separator className="bg-slate-800/50" />

        <ScrollArea className="h-full">
          <div className="p-2 sm:p-3 space-y-2">
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Loading chats...
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No chats yet. Start a new conversation!
              </div>
            ) : (
              chatHistory.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`
                  group relative p-3 sm:p-4 rounded-xl cursor-pointer
                  transition-all duration-300 hover:scale-[1.02]
                  ${
                    currentChatId === chat.id
                      ? "bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20"
                      : "bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600/50"
                  }
                `}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 rounded-xl transition-all duration-300"></div>

                <div className="relative">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-1 flex-1">
                      {chat.title}
                    </h4>
                    <ChevronRight className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                    {chat.preview}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {formatTimestamp(chat.timestamp)}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-slate-700/50 text-slate-300 text-xs px-2 py-0"
                    >
                      {chat.messageCount} msgs
                    </Badge>
                  </div>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  title="Delete chat"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )))}
          </div>
        </ScrollArea>
      </div>

      {/* Footer with stats */}
      <div className="p-3 sm:p-4 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent border-t border-slate-800/50">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
            <div className="text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {chatHistory.length}
            </div>
            <div className="text-xs text-slate-500">Chats</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
            <div className="text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {chatHistory.reduce((sum, chat) => sum + chat.messageCount, 0)}
            </div>
            <div className="text-xs text-slate-500">Messages</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
            <div className="text-xs sm:text-sm font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              24/7
            </div>
            <div className="text-xs text-slate-500">Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}
