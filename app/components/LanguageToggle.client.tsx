"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "~/context/language-context";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on client side before using translations
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLanguageChange = (newLanguage: "ko" | "en") => {
    setLanguage(newLanguage);
  };

  return (
    <button
      onClick={() => handleLanguageChange(language === "ko" ? "en" : "ko")}
      className="fixed top-20 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors"
      title={language === "ko" ? "Switch to English" : "한국어로 전환"}
    >
      <span className="text-lg">{language === "ko" ? "🇺🇸" : "🇰🇷"}</span>
      <span className="text-sm font-medium ml-2">
        {language === "ko" ? "EN" : "KO"}
      </span>
    </button>
  );
}
