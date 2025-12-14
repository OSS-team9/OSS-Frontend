"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IoChevronUp, IoChevronDown } from "react-icons/io5";
import { toEnglishEmotion } from "@/utils/emotionUtils";
import { useEmotion, EmotionItem } from "@/components/auth/EmotionContext";
import { useAuth } from "@/components/auth/AuthContext";

interface EmotionStickerBoardProps {
  onSelectSticker?: (item: EmotionItem) => void;
  selectedEmotion?: EmotionItem | null;
}
export default function EmotionStickerBoard({
  onSelectSticker,
  selectedEmotion,
}: EmotionStickerBoardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { collectedEmotions, setCollectedEmotions } = useEmotion();
  const { authFetch, token } = useAuth();

  useEffect(() => {
    // 1. 이미 캐시된 데이터가 있거나 토큰이 없으면 스킵
    if (collectedEmotions || !token) return;

    const fetchUnlockedEmotions = async () => {
      try {
        console.log("🌐 해금된 감정 목록 요청: /unlocked-emotions");

        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/unlocked-emotions`
        );

        if (!response.ok) {
          throw new Error("감정 목록 로드 실패");
        }

        const data = await response.json();
        console.log("🔥 Server Response (Unlocked Emotions):", data);

        if (data.state === "success" && Array.isArray(data.unlocked_emotions)) {
          // ⭐️ 중복 제거 로직 삭제! 있는 그대로 매핑
          const mappedEmotions: EmotionItem[] = data.unlocked_emotions.map(
            (item: any) => ({
              emotion: toEnglishEmotion(item.emotion), // "기쁨" -> "joy"
              level: item.level, // 1, 2, 3
            })
          );

          setCollectedEmotions(mappedEmotions);
        }
      } catch (error) {
        console.error("해금 감정 로드 에러:", error);
      }
    };
    fetchUnlockedEmotions();
  }, [collectedEmotions, setCollectedEmotions, authFetch, token]);

  const emotions = collectedEmotions || [];
  const totalSlots = Math.ceil(Math.max(emotions.length, 15) / 5) * 5;
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
        className="w-full h-12 shrink-0 flex justify-center items-center cursor-pointer transition-colors outline-none"
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
            {emotions.length}개 수집
          </span>
        </div>

        <div className="flex-1 w-full overflow-y-auto scrollbar-hide pb-4">
          <div className="grid grid-cols-5 gap-3 justify-items-center p-1">
            {" "}
            {/* ⭐️ p-1 추가하여 테두리 잘림 방지 */}
            {slots.map((_, index) => {
              const item = emotions[index]; // item: { emotion: "joy", level: 1 }

              // ⭐️ 선택 여부 확인 (감정 종류와 레벨이 모두 같아야 함)
              const isSelected =
                selectedEmotion && item
                  ? selectedEmotion.emotion === item.emotion &&
                    selectedEmotion.level === item.level
                  : false;
              return (
                <div
                  key={index}
                  onClick={() =>
                    item && onSelectSticker && onSelectSticker(item)
                  }
                  className={`w-14 h-14 bg-[#FDFCF8] rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden shrink-0 
                              transition-all duration-200
                              ${item ? "cursor-pointer hover:scale-105" : ""}
                              ${
                                isSelected
                                  ? "border-4 border-yellow-400 bg-yellow-50 scale-105 shadow-lg"
                                  : "hover:shadow-md border-2 border-transparent"
                              }`}
                >
                  {item ? (
                    <Image
                      src={`/images/emotions/${item.emotion}_${item.level}.png`} // ⭐️ 레벨별 이미지 사용
                      alt={`${item.emotion} ${item.level}`}
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
