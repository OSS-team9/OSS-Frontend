"use client";

import Image from "next/image";
import Card from "@/components/common/Card";
import { EmotionLog } from "@/types";
import { parseDate } from "@/utils/dateUtils";
import Link from "next/link"; // ⭐️ Link 추가
import { IoCalendarOutline } from "react-icons/io5";
import { getEmotionBgColor } from "@/utils/emotionUtils";

// ⭐️ Props 정의: 부모로부터 로그 리스트를 받음
interface EmotionHistoryProps {
  logs: EmotionLog[];
}

export default function EmotionHistory({ logs }: EmotionHistoryProps) {
  return (
    <Card className="px-6 py-4 relative">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="font-bold text-xl mb-1 text-black">감정 기록</h3>
          <p className="text-sm text-gray-500">최근 감정 흐름입니다 :)</p>
        </div>

        {/* ⭐️ 달력 아이콘 추가 (클릭 시 /calendar 이동) */}
        <Link
          href="/calendar"
          className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors text-black/70"
        >
          <IoCalendarOutline size={24} />
        </Link>
      </div>

      <div className="flex justify-between gap-4 mt-4">
        {logs.map((item) => {
          const { mmdd, dayOfWeek } = parseDate(item.date);
          const isEmpty = item.emotion === "empty";

          // 1. ⭐️ 공통 레이아웃 (크기, 정렬, 패딩 통일)
          // h-30 (120px)을 기준으로 맞춥니다.
          const baseStyle =
            "flex flex-col items-center justify-between flex-1 w-full h-30 py-3 px-1 rounded-3xl";

          // 2. ⭐️ 상태별 스타일 (배경, 테두리)
          // 빈 상태는 점선 테두리, 데이터 상태는 색상 배경 + 그림자
          const appearanceStyle = isEmpty
            ? "border-2 border-dashed border-gray-200 bg-gray-50"
            : `shadow-sm ${getEmotionBgColor(item.emotion) || "bg-gray-100"}`;

          // 3. ⭐️ 텍스트 색상
          const titleColor = isEmpty ? "text-gray-300" : "text-black/80";
          const subTextColor = isEmpty ? "text-gray-300" : "text-gray-600";

          return (
            <div key={item.id} className={`${baseStyle} ${appearanceStyle}`}>
              <span className={`text-lg font-bold ${titleColor}`}>
                {dayOfWeek}
              </span>

              <span className={`text-sm font-medium mt-0.5 ${subTextColor}`}>
                {mmdd}
              </span>

              {/* 4. ⭐️ 아이콘 영역 (위치/크기 통일) */}
              <div className="relative w-10 h-10 mt-2 flex items-center justify-center">
                {isEmpty ? (
                  // 빈 상태 아이콘 (회색 원)
                  <div className="w-8 h-8 rounded-full bg-gray-200/50" />
                ) : (
                  // 데이터 아이콘 (이미지)
                  <Image
                    src={`/images/emotions/${item.emotion}.png`}
                    alt={item.emotion}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
