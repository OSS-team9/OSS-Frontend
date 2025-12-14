"use client";

import { useState, useEffect } from "react";

const MESSAGES = [
  "표정을 분석하고 있어요... 🧐",
  "오늘의 감정을 기록하는 중... 📝",
  "추억을 클라우드에 저장 중... ☁️",
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
    // z-[9999]: 네비게이션 바, 모달 등 모든 것 위에 덮어씌움
    <div className="fixed inset-0 z-[9999] bg-app-bg/95 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in cursor-wait">
      {/* 1. 귀여운 바운스 애니메이션 아이콘 */}
      <div className="text-6xl mb-6 animate-bounce">💾</div>

      {/* 2. 돌아가는 스피너 (브랜드 컬러) */}
      <div className="w-12 h-12 border-4 border-[#EADCC7] border-t-[#56412C] rounded-full animate-spin mb-8"></div>

      {/* 3. 바뀌는 멘트 */}
      <h2 className="text-xl font-bold text-[#56412C] font-lotte min-h-[1.5em] text-center animate-pulse px-4">
        {MESSAGES[msgIndex]}
      </h2>

      <p className="text-[#8D7B68] text-xs mt-2">
        창을 닫지 말고 잠시만 기다려주세요
      </p>
    </div>
  );
}
