export interface Chat {
  _id?: string;
  userId: string;
  sessionId: string;
  role: "user" | "assistant";
  model: string;
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  sessionId: string;
  userId: string;
  title: string;
  preview: string;
  lastMessage: Date;
  messageCount: number;
}

export async function saveChat(chat: Omit<Chat, "_id">): Promise<void> {
  const { getChatsCollection } = await import("@/lib/db");
  const chats = await getChatsCollection();
  await chats.insertOne(chat as any);
}

export async function getChatHistory(
  userId: string,
  sessionId?: string,
  limit: number = 50
): Promise<Chat[]> {
  const { getChatsCollection } = await import("@/lib/db");
  const chats = await getChatsCollection();

  const query: any = { userId };
  if (sessionId) {
    query.sessionId = sessionId;
  }

  return chats
    .find(query)
    .sort({ timestamp: 1 })
    .limit(limit)
    .toArray() as Promise<Chat[]>;
}

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  const { getChatsCollection } = await import("@/lib/db");
  const chats = await getChatsCollection();

  const sessions = await chats.aggregate([
    { $match: { userId } },
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: "$sessionId",
        userId: { $first: "$userId" },
        lastMessage: { $first: "$timestamp" },
        messageCount: { $sum: 1 },
        firstUserMessage: {
          $first: {
            $cond: [{ $eq: ["$role", "user"] }, "$content", null]
          }
        },
        messages: { $push: "$$ROOT" }
      }
    },
    { $sort: { lastMessage: -1 } },
    { $limit: 20 }
  ]).toArray();

  return sessions.map((session: any) => {
    // Find first user message for preview
    const firstUserMsg = session.messages.find((m: any) => m.role === "user");
    const preview = firstUserMsg?.content || "New conversation";

    // Generate title from first message
    const title = preview.length > 50
      ? preview.substring(0, 50) + "..."
      : preview;

    return {
      sessionId: session._id,
      userId: session.userId,
      title,
      preview,
      lastMessage: session.lastMessage,
      messageCount: session.messageCount,
    };
  });
}

export async function clearChatHistory(userId: string): Promise<void> {
  const { getChatsCollection } = await import("@/lib/db");
  const chats = await getChatsCollection();
  await chats.deleteMany({ userId });
}

export async function deleteChatSession(userId: string, sessionId: string): Promise<void> {
  const { getChatsCollection } = await import("@/lib/db");
  const chats = await getChatsCollection();
  await chats.deleteMany({ userId, sessionId });
}
