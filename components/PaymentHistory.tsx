"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Payment {
  _id: string;
  type: "token_purchase" | "model_unlock";
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed";
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  packageType?: string;
  tokensAdded?: number;
  model?: string;
  createdAt: string;
}

interface Props {
  onClose: () => void;
}

export default function PaymentHistory({ onClose }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payment-history");
      const data = await res.json();

      if (res.ok) {
        setPayments(data.payments);
      } else {
        console.error("Failed to fetch payment history:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTransactionDetails = (payment: Payment) => {
    if (payment.type === "token_purchase") {
      return `${payment.tokensAdded} Tokens (${payment.packageType})`;
    } else {
      return `${payment.model} Model Unlock`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] p-4 pt-20 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Payment History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading payment history...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">No payment history yet</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              Your purchases will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Details
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Amount
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Transaction ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-800 dark:text-gray-200 font-medium">
                      {payment.type === "token_purchase" ? "Token Purchase" : "Model Unlock"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {getTransactionDetails(payment)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-800 dark:text-gray-200 font-semibold text-right">
                      ₹{payment.amount}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-500 font-mono">
                      {payment.razorpayPaymentId || payment.razorpayOrderId.substring(0, 20) + "..."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> All transactions are processed securely through Razorpay.
            If you have any questions about a payment, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
