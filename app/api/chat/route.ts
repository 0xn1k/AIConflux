import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserOrCreate, getUser, updateUser } from "@/models/User";
import { DEFAULT_FREE_MODELS } from "@/lib/constants";
import { saveChat } from "@/models/Chat";
import { callAI } from "@/lib/ai-clients";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, models, sessionId } = await req.json();

    if (!message || !models || !Array.isArray(models)) {
      return NextResponse.json(
        { error: "Message and models array required" },
        { status: 400 }
      );
    }

    // Generate sessionId if not provided (new chat)
    const chatSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get or create user data (ensures all fields exist)
    const user = await getUserOrCreate(
      session.user.email,
      session.user.name || undefined,
      session.user.image || undefined
    );

    console.log('=== TOKEN DEBUG ===');
    console.log('User:', user.email);
    console.log('Current tokens:', user.tokens);
    console.log('Models selected:', models);

    // Calculate tokens required (all models cost 1 token each)
    const tokensRequired = models.length;
    console.log('Tokens required:', tokensRequired);

    // Check if user has enough tokens
    if (user.tokens < tokensRequired) {
      return NextResponse.json(
        {
          error: "Insufficient tokens. Please purchase more tokens to continue.",
          needsTokens: true,
        },
        { status: 403 }
      );
    }

    // Check if all selected models are unlocked
    const unlockedModels = user.unlockedModels || DEFAULT_FREE_MODELS;
    const lockedModels = models.filter(
      (model) => !unlockedModels.includes(model)
    );

    if (lockedModels.length > 0) {
      return NextResponse.json(
        {
          error: `You need to unlock these models first: ${lockedModels.join(
            ", "
          )}`,
          lockedModels,
          needsUnlock: true,
        },
        { status: 403 }
      );
    }

    // Save user message to chat history
    await saveChat({
      userId: session.user.email,
      sessionId: chatSessionId,
      role: "user",
      model: "user",
      content: message,
      timestamp: new Date(),
    });

    // Call all selected AI models in parallel
    const responses = await Promise.all(
      models.map(async (model) => {
        const response = await callAI(model, message);

        // Save AI response to chat history
        await saveChat({
          userId: session.user.email,
          sessionId: chatSessionId,
          role: "assistant",
          model,
          content: response,
          timestamp: new Date(),
        });

        return { model, response };
      })
    );

    // Deduct tokens (all models cost 1 token each)
    const tokenCost = models.length;
    const newTokenCount = user.tokens - tokenCost;

    console.log('Token cost for this message:', tokenCost);
    console.log('Deducting tokens. Old:', user.tokens, 'New:', newTokenCount);

    await updateUser(session.user.email, { tokens: newTokenCount });

    // Get updated user data
    const updatedUser = await getUser(session.user.email);
    console.log('After update - tokens:', updatedUser?.tokens);
    console.log('=== END TOKEN DEBUG ===');

    return NextResponse.json({
      responses,
      sessionId: chatSessionId,
      user: {
        tokens: updatedUser?.tokens || 0,
        unlockedModels: updatedUser?.unlockedModels || DEFAULT_FREE_MODELS,
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
