import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Razorpay from "razorpay";
import crypto from "crypto";
import { getUser, updateUser } from "@/models/User";
import { PREMIUM_MODELS } from "@/lib/constants";
import { savePayment, updatePayment } from "@/models/Payment";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Check if Razorpay credentials are configured
const isRazorpayConfigured =
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_ID !== "your-razorpay-key-id" &&
  process.env.RAZORPAY_KEY_SECRET &&
  process.env.RAZORPAY_KEY_SECRET !== "your-razorpay-key-secret";

// Model prices (in INR)
const MODEL_PRICES: { [key: string]: number } = {
  Claude: 299,
  Gemini: 199,
  Perplexity: 249,
  Grok: 349,
};

// Create Razorpay order for model purchase
export async function POST(req: NextRequest) {
  try {
    // Check if Razorpay is configured
    if (!isRazorpayConfigured) {
      console.error("Razorpay credentials not configured");
      return NextResponse.json(
        { error: "Payment gateway not configured. Please contact administrator." },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { model } = await req.json();

    if (!model || !PREMIUM_MODELS.includes(model)) {
      return NextResponse.json(
        { error: "Invalid model" },
        { status: 400 }
      );
    }

    const price = MODEL_PRICES[model];

    if (!price) {
      return NextResponse.json(
        { error: "Model price not found" },
        { status: 400 }
      );
    }

    // Check if user already owns this model
    const user = await getUser(session.user.email);
    if (user?.unlockedModels.includes(model)) {
      return NextResponse.json(
        { error: "You already have access to this model" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: price * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `model_${model}_${Date.now()}`,
      notes: {
        email: session.user.email,
        model,
      },
    });

    // Save payment record
    await savePayment({
      userId: user._id as string,
      email: session.user.email,
      type: "model_unlock",
      amount: price,
      currency: "INR",
      status: "pending",
      razorpayOrderId: order.id,
      model,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      model,
    });
  } catch (error: any) {
    console.error("Buy model API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

// Verify payment and unlock model
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, model } =
      await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Update payment status to failed
      await updatePayment(razorpay_order_id, {
        status: "failed",
      });

      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Payment verified, unlock model for user
    const user = await getUser(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.unlockedModels.includes(model)) {
      return NextResponse.json(
        { error: "Model already unlocked" },
        { status: 400 }
      );
    }

    await updateUser(session.user.email, {
      unlockedModels: [...user.unlockedModels, model],
    });

    // Update payment status to success
    await updatePayment(razorpay_order_id, {
      status: "success",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    const updatedUser = await getUser(session.user.email);

    return NextResponse.json({
      success: true,
      unlockedModels: updatedUser?.unlockedModels || [],
      message: `Successfully unlocked ${model}!`,
    });
  } catch (error: any) {
    console.error("Verify model payment API error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
