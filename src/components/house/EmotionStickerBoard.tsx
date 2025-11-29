"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IoChevronUp, IoChevronDown } from "react-icons/io5";
import { toEnglishEmotion } from "@/utils/emotionUtils";

const MOCK_COLLECTED_EMOTIONS = [
  "기쁨",
  "슬픔",
  "분노",
  "당황",
  "불안",
  "상처",
  "중립",
];

export default function EmotionStickerBoard() {
  const [uniqueEmotions, setUniqueEmotions] = useState<string[]>([]);

  // 1. 열림/닫힘 상태 관리
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const uniqueSet = new Set(MOCK_COLLECTED_EMOTIONS);
    const uniqueArray = Array.from(uniqueSet);
    const englishEmotions = uniqueArray.map((koreanName) =>
      toEnglishEmotion(koreanName)
    );
    setUniqueEmotions(englishEmotions);
  }, []);

  const totalSlots = Math.ceil(Math.max(uniqueEmotions.length, 15) / 5) * 5;
  const slots = Array.from({ length: totalSlots });

  return (
    // 2. ⭐️ 위치 및 높이 제어 수정
    // - bottom-16: 네비게이션 바 바로 위에 고정 (절대 침범하지 않음)
    // - h-80 vs h-12: 열리면 320px, 닫히면 48px(핸들만 보임)
    <div
      className={`fixed bottom-16 left-0 right-0 z-30 
                  bg-app-bg-tertiary
                  rounded-t-[2.5rem] shadow-[0_-4px_20px_rgba(0,0,0,0.2)]
                  transition-all duration-300 ease-in-out overflow-hidden
                  ${isOpen ? "h-80" : "h-12"}`}
    >
      {/* 3. 토글 버튼 (핸들바) - 높이 h-12 (48px) 고정 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 flex justify-center items-center cursor-pointer hover:bg-white/5 transition-colors outline-none"
      >
        {/* 아이콘 애니메이션은 유지 */}
        {isOpen ? (
          <IoChevronDown className="text-white/80 text-2xl animate-bounce" />
        ) : (
          <IoChevronUp className="text-white/80 text-2xl animate-bounce" />
        )}
      </button>

      {/* 4. 내부 콘텐츠 (스크롤 영역) */}
      {/* h-full에서 핸들바 높이(h-12)만큼 뺀 공간 사용 */}
      <div className="h-[calc(100%-3rem)] px-8 pb-6 flex flex-col">
        {/* 타이틀 */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="text-white/90 font-bold text-sm">나의 감정 컬렉션</h3>
          <span className="text-white/50 text-xs">
            {uniqueEmotions.length}개 수집
          </span>
        </div>

        {/* 스티커 그리드 */}
        <div className="w-full overflow-y-auto scrollbar-hide pb-10">
          <div className="grid grid-cols-5 gap-3 justify-items-center">
            {slots.map((_, index) => {
              const emotion = uniqueEmotions[index];
              return (
                <div
                  key={index}
                  className="w-14 h-14 bg-[#FDFCF8] rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden shrink-0"
                >
                  {emotion ? (
                    <Image
                      src={`/emotions/${emotion}_3.png`}
                      alt={emotion}
                      width={40}
                      height={40}
                      className="object-contain drop-shadow-sm hover:scale-110 transition-transform cursor-pointer"
                    />
                  ) : (
                    <div className="w-full h-full opacity-50" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
