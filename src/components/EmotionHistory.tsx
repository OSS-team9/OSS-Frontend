"use client";

import Image from "next/image";
import Card from "@/components/Card";
import { EmotionLog } from "@/types";
import { parseDate } from "@/utils/dateUtils";

const EMOTION_COLORS: Record<string, string> = {
  joy: "bg-joy-bg",
  panic: "bg-panic-bg",
  anger: "bg-anger-bg",
  anxiety: "bg-anxiety-bg",
  hurt: "bg-hurt-bg",
  sadness: "bg-sadness-bg",
  neutral: "bg-neutral-bg",
};

// ⭐️ Props 정의: 부모로부터 로그 리스트를 받음
interface EmotionHistoryProps {
  logs: EmotionLog[];
}

export default function EmotionHistory({ logs }: EmotionHistoryProps) {
  return (
    <Card className="px-6 py-4">
      <div className="">
        <h3 className="font-bold text-xl mb-2">감정 기록</h3>
        <p className="text-sm text-gray-500">최근 감정 흐름입니다 :)</p>
      </div>

      <div className="flex justify-between gap-4 mt-4">
        {/* ⭐️ logs 배열을 순회하며 렌더링 */}
        {logs.map((item) => {
          const { mmdd, dayOfWeek } = parseDate(item.date);
          const bgColor = EMOTION_COLORS[item.emotion] || "bg-gray-100";

          return (
            <div
              key={item.id}
              className={`flex flex-col items-center justify-between 
                          flex-1 w-full h-30 py-3 px-1 rounded-3xl shadow-sm 
                          ${bgColor}`}
            >
              <span className="text-base font-bold text-black/80">
                {dayOfWeek}
              </span>
              <span className="text-sm text-gray-600 font-medium mt-3">
                {mmdd}
              </span>

              <div className="relative w-8 h-8 mt-2">
                <Image
                  src={`/emotions/${item.emotion}.png`}
                  alt={item.emotion}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
