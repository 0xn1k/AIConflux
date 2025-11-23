import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getUserOrCreate } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserOrCreate(
      session.user.email,
      session.user.name || undefined,
      session.user.image || undefined
    );

    return NextResponse.json({
      email: user.email,
      name: user.name,
      tokens: user.tokens,
      unlockedModels: user.unlockedModels,
    });
  } catch (error: any) {
    console.error("User API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
