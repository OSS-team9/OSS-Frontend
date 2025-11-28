"use client";

import Image from "next/image";
import Link from "next/link";
import { IoShareSocialOutline, IoAdd, IoCameraOutline } from "react-icons/io5";
import { getFormattedDate } from "@/utils/dateUtils";
import { EmotionLog } from "@/types";
import Card from "@/components/common/BorderCard";
import { useShareAndDownload } from "@/hooks/useShareAndDownload";

interface DailyResultProps {
  data: EmotionLog | null;
}

export default function DailyResult({ data }: DailyResultProps) {
  const { shareImage } = useShareAndDownload();
  const displayDate = data?.date || getFormattedDate();

  const characterImage = data
    ? `/emotions/${data.emotion}_${data.emotionLevel}.png`
    : "/images/question.png";

  const handleShareClick = async () => {
    if (data?.imageUrl) {
      try {
        // 이미지 URL을 Blob으로 변환
        const response = await fetch(data.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "emotion_result.png", {
          type: "image/png",
        });

        // 공유 함수 호출
        shareImage(file);
      } catch (error) {
        console.error("이미지 변환 실패:", error);
        alert("이미지를 공유할 수 없습니다.");
      }
    }
  };

  return (
    <div className="w-full px-6 pb-5 bg-app-bg-secondary">
      <div className="inline-block my-3 rounded-full px-4 py-1 bg-white/25">
        <span className="text-white font-bold font-lotte text-4xl">
          {displayDate}
        </span>
      </div>

      <div className="flex gap-5 h-64">
        {/* 왼쪽: 내 사진 (서버 URL) */}
        <Card className="flex-1.8 bg-[#FFF8E7] relative">
          {data?.imageUrl ? (
            // (A) 데이터 있음: 내 사진 표시
            <div className="w-full h-full relative aspect-3/4">
              <Image
                src={data.imageUrl}
                alt="내 사진"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            // (B) ⭐️ 데이터 없음: 기록 유도 UI (점선 테두리 효과)
            <div className="w-full h-full p-2 aspect-3/4">
              <div className="w-full h-full border-2 border-dashed border-[#8b7e66] rounded-2xl flex flex-col items-center justify-center relative">
                {/* 카메라 아이콘 */}
                <IoCameraOutline className="w-12 h-12 text-[#8b4513] mb-2" />

                {/* 텍스트 */}
                <div className="text-center font-bold text-[#3e2723] text-sm leading-tight">
                  오늘의 표정을
                  <br />
                  남겨주세요 😉
                </div>
              </div>
            </div>
          )}
          <Link
            href="/camera"
            className="absolute bottom-3 right-3 w-10 h-10 bg-[#A8815B] rounded-full flex items-center justify-center shadow-md hover:bg-[#8d7355] transition-colors"
          >
            <IoAdd className="w-6 h-6 text-white" />
          </Link>
        </Card>

        {/* 오른쪽: 캐릭터 + 공유 버튼 */}
        <div className="flex-1 flex flex-col gap-5">
          {/* 캐릭터 이미지 */}
          <Card className="flex-1 relative bg-gray-200">
            {/* 배경 이미지 (항상 보임) */}
            <Image
              src="/images/icon_background.png"
              alt="카드 배경"
              fill
              className="object-cover"
            />

            {/* 내용물 (캐릭터 또는 물음표) */}
            <div className="w-full h-full relative z-1 flex items-center justify-center">
              <Image
                src={characterImage}
                alt={data ? `${data.emotion} character` : "기록 없음"}
                width={data ? 120 : 100} // 크기 조절 (물음표는 조금 작게)
                height={data ? 120 : 100}
                className="object-contain drop-shadow-md"
              />
            </div>
          </Card>

          {/* 공유 버튼 */}
          <button
            className="bg-white py-3 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            onClick={handleShareClick}
          >
            <IoShareSocialOutline className="w-7 h-7 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
