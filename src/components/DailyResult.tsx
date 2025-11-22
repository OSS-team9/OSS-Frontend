"use client";

import Image from "next/image";
import { IoShareSocialOutline } from "react-icons/io5";
import { getFormattedDate } from "@/utils/dateUtils";
import { EmotionLog } from "@/types";
import Card from "@/components/BorderCard";

interface DailyResultProps {
  data: EmotionLog | null;
}

export default function DailyResult({ data }: DailyResultProps) {
  // 데이터가 없으면 로딩 중 표시 (또는 빈 화면)
  if (!data)
    return (
      <div className="text-white text-center">분석 결과 불러오는 중...</div>
    );

  const displayDate = data.date ? data.date : getFormattedDate();

  const characterImage = `/emotions/${data.emotion}_${data.emotionLevel}.png`;

  return (
    <div className="w-full px-6 pb-5 bg-app-bg-secondary">
      <div className="inline-block my-3 rounded-full px-4 py-1 bg-white/25">
        <span className="text-white font-bold font-lotte text-4xl">
          {displayDate}
        </span>
      </div>

      <div className="flex gap-5 h-64">
        {/* 왼쪽: 내 사진 (서버 URL) */}
        <Card className="flex-1.8 bg-gray-300 relative">
          <div className="w-full h-full relative aspect-3/4">
            {data.imageUrl ? (
              <Image
                src={data.imageUrl}
                alt="내 사진"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-sm">사진 없음</span>
              </div>
            )}
          </div>
        </Card>

        {/* 오른쪽: 캐릭터 + 공유 버튼 */}
        <div className="flex-1 flex flex-col gap-5">
          {/* 캐릭터 이미지 */}
          <Card className="flex-1 relative bg-gray-200">
            <Image
              src="/images/icon_background.png"
              alt="카드 배경"
              fill
              className="object-cover" // 카드를 꽉 채움
            />
            <div className="w-full h-full relative z-1 flex items-center justify-center">
              <Image
                src={characterImage}
                alt={`${data.emotion} character`}
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
          </Card>

          {/* 공유 버튼 */}
          <button className="bg-white py-3 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <IoShareSocialOutline className="w-7 h-7 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
