"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  IoChevronBack,
  IoShareSocialOutline,
  IoSaveOutline,
} from "react-icons/io5";

import withAuth from "@/components/auth/withAuth";
import { useAuth } from "@/components/auth/AuthContext";
import BorderCard from "@/components/common/BorderCard";
import EmotionStickerBoard from "@/components/house/EmotionStickerBoard";

function HousePage() {
  const router = useRouter();
  const { token, authFetch } = useAuth();

  const [placedEmotion, setPlacedEmotion] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 1. ⭐️ [수정] 스티커 선택 핸들러 (토글 기능)
  const handleSelectSticker = (emotion: string) => {
    if (placedEmotion === emotion) {
      setPlacedEmotion(null); // 이미 선택된 거면 해제 (지우기)
    } else {
      setPlacedEmotion(emotion); // 아니면 배치 (교체)
    }
  };

  const handleSaveRoom = async () => {
    if (!placedEmotion) {
      alert("배치할 감정 스티커를 선택해주세요!");
      return;
    }
    // ... (저장 로직 기존 동일) ...
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`방 꾸미기 저장 완료: ${placedEmotion}`);
      alert("무드 라운지가 저장되었습니다! 🏠✨");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg pt-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-black font-lotte pt-1">
            무드 라운지
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSaveRoom}
            disabled={isSaving}
            className={`p-2 rounded-full transition ${
              placedEmotion
                ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                : "text-gray-400"
            }`}
            title="저장하기"
          >
            {isSaving ? (
              <span className="animate-spin text-lg">⏳</span>
            ) : (
              <IoSaveOutline size={22} />
            )}
          </button>
        </div>
      </div>

      <BorderCard className="p-0 w-full max-w-md mx-auto shadow-xl">
        <div className="relative w-full aspect-9/16 bg-gray-200 overflow-hidden">
          <Image
            src="/images/mood_room.png"
            alt="Mood Lounge"
            fill
            className="object-cover"
            priority
          />

          {/* 2. ⭐️ 배치된 스티커 (X 버튼 제거됨) */}
          {placedEmotion && (
            <div className="absolute bottom-[0%] left-1/2 -translate-x-1/2 w-80 h-80 animate-bounce-slow">
              <Image
                src={`/emotions/${placedEmotion}_3.png`}
                alt="Placed Sticker"
                fill
                className="object-contain drop-shadow-xl filter brightness-110"
              />
            </div>
          )}
        </div>
      </BorderCard>

      {/* 3. ⭐️ 선택된 감정(placedEmotion)을 props로 전달 */}
      <EmotionStickerBoard
        onSelectSticker={handleSelectSticker}
        selectedEmotion={placedEmotion}
      />
    </div>
  );
}

export default withAuth(HousePage);
