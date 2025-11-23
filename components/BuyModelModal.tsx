"use client";

import { useState, useEffect } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const MODEL_PRICES: { [key: string]: number } = {
  Claude: 299,
  Gemini: 199,
  Perplexity: 249,
  Grok: 349,
};

const MODEL_DESCRIPTIONS: { [key: string]: string } = {
  Claude: "Advanced reasoning and analysis by Anthropic",
  Gemini: "Google's multimodal AI with broad knowledge",
  Perplexity: "Real-time web search and research capabilities",
  Grok: "xAI's conversational AI with unique personality",
};

interface Props {
  model: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BuyModelModal({ model, onClose, onSuccess }: Props) {
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
      const res = await fetch("/api/buy-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
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
        description: `Unlock ${model}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch("/api/buy-model", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              model,
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

  const price = MODEL_PRICES[model];
  const description = MODEL_DESCRIPTIONS[model];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] p-4 pt-20 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Unlock {model}
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

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {model}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {description}
              </p>
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                ₹{price}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                One-time purchase • Lifetime access
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Unlimited messages with {model}
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Use alongside other models
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Chat history saved forever
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={loading || !scriptLoaded}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : !scriptLoaded ? "Loading..." : `Purchase for ₹${price}`}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </>
  );
}
