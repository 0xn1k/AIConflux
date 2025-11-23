import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getPaymentHistory } from "@/models/Payment";
import { getUser } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUser(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payments = await getPaymentHistory(user._id as string);

    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error("Payment history API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payment history" },
      { status: 500 }
    );
  }
}
