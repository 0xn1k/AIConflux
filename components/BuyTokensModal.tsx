"use client";

import { useState, useEffect } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const TOKEN_PACKAGES = {
  small: { tokens: 10, price: 99, label: "10 Tokens - ₹99" },
  medium: { tokens: 50, price: 399, label: "50 Tokens - ₹399" },
  large: { tokens: 100, price: 699, label: "100 Tokens - ₹699" },
};

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BuyTokensModal({ onClose, onSuccess }: Props) {
  const [selectedPackage, setSelectedPackage] = useState<keyof typeof TOKEN_PACKAGES>("medium");
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if (window.Razorpay) {
      setScriptLoaded(true);
      return;
    }

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      alert("Failed to load payment gateway. Please refresh and try again.");
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script when component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handlePurchase = async () => {
    if (!scriptLoaded) {
      alert("Payment gateway is loading. Please wait a moment and try again.");
      return;
    }

    setLoading(true);

    try {
      // Create order
      const res = await fetch("/api/buy-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageType: selectedPackage }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || "Failed to create order";
        console.error("Order creation failed:", errorMsg);
        alert(`Order creation failed: ${errorMsg}`);
        setLoading(false);
        return;
      }

      // Load Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "AI Conflux",
        description: TOKEN_PACKAGES[selectedPackage].label,
        order_id: data.orderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch("/api/buy-tokens", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageType: selectedPackage,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyRes.ok) {
            alert(verifyData.message);
            onSuccess();
          } else {
            alert(verifyData.error || "Payment verification failed");
          }
          setLoading(false);
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Failed to initiate purchase");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] p-4 pt-20 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Buy Tokens
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {Object.entries(TOKEN_PACKAGES).map(([key, pkg]) => (
              <button
                key={key}
                onClick={() => setSelectedPackage(key as keyof typeof TOKEN_PACKAGES)}
                className={`w-full p-4 rounded-lg border-2 transition ${
                  selectedPackage === key
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {pkg.tokens} Tokens
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    ₹{pkg.price}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ₹{(pkg.price / pkg.tokens).toFixed(2)} per token
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handlePurchase}
            disabled={loading || !scriptLoaded}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : !scriptLoaded ? "Loading..." : "Proceed to Payment"}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </>
  );
}
