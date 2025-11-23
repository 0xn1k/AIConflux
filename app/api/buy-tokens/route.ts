import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Razorpay from "razorpay";
import crypto from "crypto";
import { getUser, updateUser } from "@/models/User";
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

// Token packages
const TOKEN_PACKAGES = {
  small: { tokens: 10, price: 99 }, // ₹99 for 10 tokens
  medium: { tokens: 50, price: 399 }, // ₹399 for 50 tokens
  large: { tokens: 100, price: 699 }, // ₹699 for 100 tokens
};

// Create Razorpay order
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

    const { packageType } = await req.json();

    if (!packageType || !TOKEN_PACKAGES[packageType as keyof typeof TOKEN_PACKAGES]) {
      return NextResponse.json(
        { error: "Invalid package type" },
        { status: 400 }
      );
    }

    const pkg = TOKEN_PACKAGES[packageType as keyof typeof TOKEN_PACKAGES];

    // Get user for userId
    const user = await getUser(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: pkg.price * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `token_${Date.now()}`,
      notes: {
        email: session.user.email,
        packageType,
        tokens: pkg.tokens,
      },
    });

    // Save payment record
    await savePayment({
      userId: user._id as string,
      email: session.user.email,
      type: "token_purchase",
      amount: pkg.price,
      currency: "INR",
      status: "pending",
      razorpayOrderId: order.id,
      packageType,
      tokensAdded: pkg.tokens,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Buy tokens API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

// Verify Razorpay payment and add tokens
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageType } =
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

    // Payment verified, add tokens to user account
    const pkg = TOKEN_PACKAGES[packageType as keyof typeof TOKEN_PACKAGES];
    const user = await getUser(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await updateUser(session.user.email, {
      tokens: user.tokens + pkg.tokens,
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
      tokens: updatedUser?.tokens || 0,
      message: `Successfully added ${pkg.tokens} tokens!`,
    });
  } catch (error: any) {
    console.error("Verify payment API error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
