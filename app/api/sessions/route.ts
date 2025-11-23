import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getChatSessions, deleteChatSession } from "@/models/Chat";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await getChatSessions(session.user.email);

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("Sessions API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    await deleteChatSession(session.user.email, sessionId);

    return NextResponse.json({ success: true, message: "Chat deleted successfully" });
  } catch (error: any) {
    console.error("Delete session API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete chat" },
      { status: 500 }
    );
  }
}
