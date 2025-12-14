"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import savingAnimation from "@/lottie/saving.json";

const MESSAGES = [
  "오늘의 감정을 기록하는 중... 📝",
  "추억을 상자에 담는 중... ☁️",
  "올해는 과연 산타가 선물을?... 🎅",
  "거의 다 됐어요! ✨",
];

export default function FullScreenLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-app-bg/95 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in cursor-wait">
      {/* Lottie 애니메이션 영역 */}
      <div className="w-52 h-52 mb-4">
        <Lottie animationData={savingAnimation} loop={true} autoplay={true} />
      </div>

      {/* 바뀌는 멘트 */}
      <h2 className="text-xl font-bold text-[#56412C] font-lotte min-h-[1.5em] text-center animate-pulse px-4">
        {MESSAGES[msgIndex]}
      </h2>

      <p className="text-[#8D7B68] text-xs mt-2">
        창을 닫지 말고 잠시만 기다려주세요
      </p>
    </div>
  );
}
