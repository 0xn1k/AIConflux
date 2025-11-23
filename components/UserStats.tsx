"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import BuyTokensModal from "./BuyTokensModal";

interface UserData {
  tokens: number;
  unlockedModels: string[];
}

export default function UserStats() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showBuyTokens, setShowBuyTokens] = useState(false);

  useEffect(() => {
    fetchUserData();

    // Listen for real-time updates from ChatInterface
    const handleUserStatsUpdate = (event: any) => {
      const updatedData = event.detail;
      setUserData((prevData) => ({
        tokens: updatedData.tokens,
        unlockedModels: updatedData.unlockedModels || prevData?.unlockedModels || [],
      }));
    };

    window.addEventListener('userStatsUpdate', handleUserStatsUpdate);

    return () => {
      window.removeEventListener('userStatsUpdate', handleUserStatsUpdate);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUserData({
        tokens: data.tokens,
        unlockedModels: data.unlockedModels,
      });
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  const handleTokenPurchaseSuccess = () => {
    fetchUserData();
    setShowBuyTokens(false);
  };

  if (!userData) return null;

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-green-50 dark:bg-green-900/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
          <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">
            Tokens: {userData.tokens}
          </span>
        </div>
        <button
          onClick={() => setShowBuyTokens(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition"
        >
          Buy
        </button>
      </div>
      {showBuyTokens && createPortal(
        <BuyTokensModal
          onClose={() => setShowBuyTokens(false)}
          onSuccess={handleTokenPurchaseSuccess}
        />,
        document.body
      )}
    </>
  );
}
