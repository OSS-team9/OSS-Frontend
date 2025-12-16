"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IoShareSocialOutline, IoSaveOutline } from "react-icons/io5";

import withAuth from "@/components/auth/withAuth";
import { useAuth } from "@/components/auth/AuthContext";
import BorderCard from "@/components/common/BorderCard";
import EmotionStickerBoard from "@/components/house/EmotionStickerBoard";
import { useEmotion, EmotionItem } from "@/components/auth/EmotionContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useShareAndDownload } from "@/hooks/useShareAndDownload";
import { toEnglishEmotion, toKoreanEmotion } from "@/utils/emotionUtils";

const ROOM_BASE_IMAGE = "/images/room/room_base.png";
const ROOM_DECORATIONS: Record<string, string> = {
  joy: "/images/room/room_joy.png", // 별
  sadness: "/images/room/room_sadness.png", // 눈
  anger: "/images/room/room_anger.png", // 양초
  panic: "/images/room/room_panic.png", // 볼장식
  anxiety: "/images/room/room_anxiety.png",
  hurt: "/images/room/room_hurt.png",
  neutral: "/images/room/room_neutral.png",
};
const MOCK_COLLECTED_EMOTIONS = ["기쁨", "분노"];

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
    collectedEmotions,
    setCollectedEmotions,
    isEmotionsFetched,
    setIsEmotionsFetched,
  } = useEmotion();
  const { shareImage, canvasToBlob } = useShareAndDownload();

  const [placedEmotion, setPlacedEmotion] = useState<EmotionItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!isHouseFetched); // 캐시 없으면 로딩 시작

  // 애니메이션 상태
  const [isPulsing, setIsPulsing] = useState(false);
  // ⭐️ 캔버스 참조 생성 (합성용)
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. 데이터 로드 (캐싱 적용)
  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      // (A) 수집된 감정 목록 로드
      // 캐시가 없으면 로드하고 Context에 저장
      if (isHouseFetched) {
        setPlacedEmotion(houseEmotion);
        setIsLoading(false);
        return;
      }

      // (B) ⭐️ 무드 라운지 상태 로드
      if (isHouseFetched) {
        console.log("🚀 무드 라운지: 캐시 데이터 사용");
        setPlacedEmotion(houseEmotion); // 캐시된 데이터 적용
        setIsLoading(false); // 로딩 즉시 종료
        return;
      }

      // 캐시가 없으면 서버 요청
      console.log("🌐 무드 라운지: 서버 데이터 요청");
      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/user/representative-emotion`
        );

        if (!response.ok) {
          throw new Error("데이터 로드 실패");
        }

        const data = await response.json();

        // 데이터가 있고 emotion_type이 설정된 경우
        if (data.state === "success" && data.emotion_type) {
          // ⭐️ 서버에서 받은 레벨까지 저장
          const emotionItem: EmotionItem = {
            emotion: toEnglishEmotion(data.emotion_type),
            level: data.emotion_level || 3,
          };
          setHouseEmotion(emotionItem);
          setPlacedEmotion(emotionItem);
        } else {
          setHouseEmotion(null);
          setPlacedEmotion(null);
        }

        setIsHouseFetched(true); // "불러왔음" 표시
      } catch (error) {
        console.error("불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [
    token,
    isHouseFetched,
    isEmotionsFetched,
    houseEmotion,
    setHouseEmotion,
    setIsHouseFetched,
    setCollectedEmotions,
    setIsEmotionsFetched,
  ]);

  // 2. 스티커 선택 핸들러
  const handleSelectSticker = (item: EmotionItem) => {
    // ⭐️ 동일한 감정+레벨이면 선택 해제, 아니면 선택
    if (
      placedEmotion &&
      placedEmotion.emotion === item.emotion &&
      placedEmotion.level === item.level
    ) {
      setPlacedEmotion(null);
    } else {
      setPlacedEmotion(item);
    }
  };
  // 캐릭터 클릭 시 애니메이션 실행 함수
  const handleCharacterClick = () => {
    if (!placedEmotion) return; // 1. 애니메이션 실행
    if (isPulsing) return;
    setIsPulsing(true); // 2. 300ms 후에 애니메이션 상태를 false로 되돌림

    setTimeout(() => {
      setIsPulsing(false);
    }, 300);
  };

  // 3. 저장 핸들러 (저장 후 캐시도 업데이트)
  const handleSaveRoom = async () => {
    if (!placedEmotion) {
      alert("배치할 감정 스티커를 선택해주세요!");
      return;
    }

    setIsSaving(true);
    try {
      // 1. 한글 변환
      const emotionTypeKo = toKoreanEmotion(placedEmotion.emotion);

      // 2. ⭐️ API 요청: 사용자가 선택한 레벨을 그대로 전송
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/user/representative-emotion`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emotion_type: emotionTypeKo,
            emotion_level: placedEmotion.level, // ⭐️ 동적 레벨 적용
          }),
        }
      );

      if (!response.ok) throw new Error("저장 실패");

      console.log(
        `저장 완료: ${placedEmotion.emotion} (Lv.${placedEmotion.level})`
      );
      setHouseEmotion(placedEmotion); // 캐시 업데이트

      alert("무드 라운지가 저장되었습니다! 🏠✨");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. 이미지 합성 및 공유 핸들러
  const handleShareRoom = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      setIsSaving(true); // 공유 중 로딩 표시

      // (1) 기본 배경 로드
      const baseImage = new window.Image();
      baseImage.src = ROOM_BASE_IMAGE;
      baseImage.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        baseImage.onload = resolve;
        baseImage.onerror = reject;
      });

      canvas.width = baseImage.width;
      canvas.height = baseImage.height;
      ctx.drawImage(baseImage, 0, 0);

      // (2) 수집된 감정 장식들 덧그리기
      if (collectedEmotions) {
        // 감정 종류만 추출 (중복 제거)
        const uniqueEmotionTypes = new Set(
          collectedEmotions.map((e) => e.emotion)
        );

        for (const emotionType of Array.from(uniqueEmotionTypes)) {
          const decorationSrc = ROOM_DECORATIONS[emotionType];
          if (decorationSrc) {
            const decoImage = new window.Image();
            decoImage.src = decorationSrc;
            decoImage.crossOrigin = "anonymous";
            try {
              await new Promise((resolve) => (decoImage.onload = resolve));
              ctx.drawImage(decoImage, 0, 0, canvas.width, canvas.height);
            } catch (e) {}
          }
        }
      }

      // 3) 스티커가 있다면 그리기
      if (placedEmotion) {
        const stickerImage = new window.Image();
        stickerImage.src = `/images/emotions/${placedEmotion.emotion}_${placedEmotion.level}.png`;
        await new Promise((resolve) => (stickerImage.onload = resolve));

        const stickerSize = canvas.width * 0.6; // 너비의 45% 크기

        const x = (canvas.width - stickerSize) / 2; // 중앙 정렬

        //  Y 좌표 맞추기
        const y = canvas.height * 0.95 - stickerSize;

        ctx.drawImage(stickerImage, x, y, stickerSize, stickerSize);
      }

      // 4) 캔버스를 이미지 파일(Blob)로 변환
      const blob = await canvasToBlob(canvas);
      if (blob) {
        const file = new File([blob], "mood_lounge.png", { type: "image/png" });
        // 5) 공유 실행
        await shareImage(file, "나의 무드 라운지");
      }
    } catch (error) {
      console.error("이미지 합성 실패:", error);
      alert("이미지 공유에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg pt-6 px-6 ">
      <div className="mobile-container">
        <canvas ref={canvasRef} className="hidden" />
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
                  ? "text-app-bg-secondary bg-[#F5EFE6] hover:bg-amber-200" // 따뜻한 갈색/노란색 조합
                  : "text-gray-300 bg-gray-50" // 비활성화 상태도 조금 더 부드럽게
              }`}
              title="저장하기"
            >
              {isSaving ? (
                <span className="animate-spin text-lg">⏳</span>
              ) : (
                <IoSaveOutline size={24} />
              )}
            </button>
            {/* ⭐️ 공유 버튼 (페이지 내부로 이동됨) */}
            <button
              onClick={handleShareRoom}
              disabled={isSaving}
              className="p-2 text-black/70 hover:text-black rounded-full hover:bg-black/5 transition"
              title="공유하기"
            >
              <IoShareSocialOutline size={24} />
            </button>
          </div>
        </div>

        <BorderCard className="p-0 w-full max-w-md mx-auto border-10">
          <div className="relative w-full aspect-1/2 bg-gray-200 overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <LoadingSpinner />
              </div>
            )}
            <Image
              src={ROOM_BASE_IMAGE}
              alt="Room Base"
              fill
              className="object-cover"
              priority
            />

            {/* 2. 수집된 감정 장식들 (레이어드) */}
            {collectedEmotions &&
              Array.from(new Set(collectedEmotions.map((e) => e.emotion))).map(
                (emotionType) => {
                  const decorationSrc = ROOM_DECORATIONS[emotionType];
                  if (!decorationSrc) return null;
                  return (
                    <div
                      key={emotionType}
                      className="absolute inset-0 z-1 pointer-events-none"
                    >
                      <Image
                        src={decorationSrc}
                        alt="decoration"
                        fill
                        className="object-cover"
                      />
                    </div>
                  );
                }
              )}

            {/* 2. ⭐️ 배치된 스티커 */}
            {placedEmotion && (
              <div
                onClick={handleCharacterClick}
                className={`
                  absolute bottom-[5%] left-1/2 -translate-x-1/2 w-60 h-60 
                  animate-bounce-slow z-10 
                  cursor-pointer
                  // ⭐️ [핵심] 애니메이션 클래스 적용
                  transition-transform duration-300 ease-out transform 
                  ${isPulsing ? "scale-[1.05]" : "scale-100"} 
                `}
              >
                <Image
                  src={`/images/emotions/${placedEmotion.emotion}_${placedEmotion.level}.png`}
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
    </div>
  );
}

export default withAuth(HousePage);
