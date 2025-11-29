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

interface EmotionStickerBoardProps {
  onSelectSticker?: (emotion: string) => void;
  selectedEmotion?: string | null;
}

export default function EmotionStickerBoard({
  onSelectSticker,
  selectedEmotion,
}: EmotionStickerBoardProps) {
  const [uniqueEmotions, setUniqueEmotions] = useState<string[]>([]);
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
    <div
      className={`fixed bottom-16 left-0 right-0 z-30 
                  bg-app-bg-tertiary
                  rounded-t-[2.5rem] shadow-[0_-4px_20px_rgba(0,0,0,0.2)]
                  transition-all duration-300 ease-in-out overflow-hidden
                  flex flex-col
                  ${isOpen ? "h-96" : "h-12"}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 shrink-0 flex justify-center items-center cursor-pointer hover:bg-white/5 transition-colors outline-none"
      >
        {isOpen ? (
          <IoChevronDown className="text-white/80 text-2xl animate-bounce" />
        ) : (
          <IoChevronUp className="text-white/80 text-2xl animate-bounce" />
        )}
      </button>

      <div className="flex-1 flex flex-col min-h-0 px-6 pb-6">
        <div className="flex justify-between items-center mb-4 shrink-0 px-2">
          <h3 className="text-white/90 font-bold text-sm">나의 감정 컬렉션</h3>
          <span className="text-white/50 text-xs">
            {uniqueEmotions.length}개 수집
          </span>
        </div>

        <div className="flex-1 w-full overflow-y-auto scrollbar-hide pb-4">
          <div className="grid grid-cols-5 gap-3 justify-items-center p-1">
            {" "}
            {/* ⭐️ p-1 추가하여 테두리 잘림 방지 */}
            {slots.map((_, index) => {
              const emotion = uniqueEmotions[index];
              const isSelected = emotion === selectedEmotion;

              return (
                <div
                  key={index}
                  onClick={() =>
                    emotion && onSelectSticker && onSelectSticker(emotion)
                  }
                  className={`w-14 h-14 bg-[#FDFCF8] rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden shrink-0 
                              transition-all duration-200
                              ${emotion ? "cursor-pointer hover:scale-105" : ""}
                              ${
                                isSelected
                                  ? "border-4 border-yellow-400 bg-yellow-50 scale-105 shadow-lg" // ⭐️ ring 대신 border 사용
                                  : "hover:shadow-md border-2 border-transparent"
                              }`}
                >
                  {emotion ? (
                    <Image
                      src={`/emotions/${emotion}_3.png`}
                      alt={emotion}
                      width={40}
                      height={40}
                      className={`object-contain drop-shadow-sm transition-transform
                                  ${
                                    isSelected ? "scale-110" : "active:scale-90"
                                  }`}
                    />
                  ) : (
                    <div className="w-full h-full opacity-50" />
                  )}

                  {/* 선택 시 오버레이 (선택사항) */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-yellow-400/10 pointer-events-none" />
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
