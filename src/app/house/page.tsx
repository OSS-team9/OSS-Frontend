"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IoSaveOutline } from "react-icons/io5";

import withAuth from "@/components/auth/withAuth";
import { useAuth } from "@/components/auth/AuthContext";
import BorderCard from "@/components/common/BorderCard";
import EmotionStickerBoard from "@/components/house/EmotionStickerBoard";
import { useEmotion } from "@/components/auth/EmotionContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

function HousePage() {
  const router = useRouter();
  const { token, authFetch } = useAuth();

  // ⭐️ Context에서 캐시 데이터와 함수 가져오기
  const {
    houseEmotion,
    setHouseEmotion,
    isHouseFetched,
    setIsHouseFetched,
    invalidateEmotionsCache, // 저장 시 컬렉션 갱신용
  } = useEmotion();

  const [placedEmotion, setPlacedEmotion] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!isHouseFetched); // 캐시 없으면 로딩 시작

  // 1. ⭐️ 데이터 로드 (캐시 우선)
  useEffect(() => {
    // 캐시가 있으면 바로 적용하고 종료
    if (isHouseFetched) {
      console.log("🚀 무드 라운지: 캐시 데이터 사용");
      setPlacedEmotion(houseEmotion);
      setIsLoading(false);
      return;
    }

    // 캐시 없으면 서버 요청
    const fetchHouseData = async () => {
      if (!token) return;

      console.log("🌐 무드 라운지: 서버 데이터 요청");
      try {
        // (가짜 API 호출 - 나중에 실제 엔드포인트로 교체)
        // const res = await authFetch('/api/house');
        // const data = await res.json();

        // Mock 데이터 (예: 서버에 저장된게 'joy'라고 가정)
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockServerData = null; // 처음엔 없음 (또는 "joy")

        // ⭐️ 받아온 데이터를 Context와 로컬 state에 저장
        setHouseEmotion(mockServerData);
        setPlacedEmotion(mockServerData);
        setIsHouseFetched(true); // "불러왔음" 표시
      } catch (error) {
        console.error("불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHouseData();
  }, [token, isHouseFetched, houseEmotion, setHouseEmotion, setIsHouseFetched]);

  // 2. 스티커 선택 핸들러
  const handleSelectSticker = (emotion: string) => {
    if (placedEmotion === emotion) {
      setPlacedEmotion(null);
    } else {
      setPlacedEmotion(emotion);
    }
  };

  // 3. 저장 핸들러 (저장 후 캐시도 업데이트)
  const handleSaveRoom = async () => {
    if (!placedEmotion) {
      alert("배치할 감정 스티커를 선택해주세요!");
      return;
    }

    setIsSaving(true);
    try {
      // (서버 저장 로직)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log(`방 꾸미기 저장 완료: ${placedEmotion}`);

      // ⭐️ [핵심] 저장 성공 시 Context 캐시도 최신값으로 업데이트!
      setHouseEmotion(placedEmotion);
      // (이미 isHouseFetched=true 이므로, 다시 들어와도 이 값을 씀)

      // (선택) 다른 화면(메인 등)의 캐시 갱신이 필요하면 호출
      invalidateEmotionsCache();

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
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-sm">
              <LoadingSpinner />
            </div>
          )}
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
