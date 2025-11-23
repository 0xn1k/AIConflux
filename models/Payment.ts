export interface Payment {
  _id?: string;
  userId: string;
  email: string;
  type: "token_purchase" | "model_unlock";
  amount: number; // Amount in INR
  currency: string;
  status: "pending" | "success" | "failed";
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  // For token purchases
  packageType?: string;
  tokensAdded?: number;

  // For model unlocks
  model?: string;

  createdAt: Date;
  updatedAt: Date;
}

export async function savePayment(payment: Omit<Payment, "_id">): Promise<Payment> {
  const { getPaymentsCollection } = await import("@/lib/db");
  const payments = await getPaymentsCollection();

  const result = await payments.insertOne(payment as any);
  return { ...payment, _id: result.insertedId.toString() } as Payment;
}

export async function updatePayment(
  razorpayOrderId: string,
  update: Partial<Payment>
): Promise<void> {
  const { getPaymentsCollection } = await import("@/lib/db");
  const payments = await getPaymentsCollection();

  await payments.updateOne(
    { razorpayOrderId },
    { $set: { ...update, updatedAt: new Date() } }
  );
}

export async function getPaymentHistory(
  userId: string,
  limit: number = 50
): Promise<Payment[]> {
  const { getPaymentsCollection } = await import("@/lib/db");
  const payments = await getPaymentsCollection();

  const result = await payments
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return result as unknown as Payment[];
}

export async function getPaymentByOrderId(
  razorpayOrderId: string
): Promise<Payment | null> {
  const { getPaymentsCollection } = await import("@/lib/db");
  const payments = await getPaymentsCollection();

  return payments.findOne({ razorpayOrderId }) as Promise<Payment | null>;
}
