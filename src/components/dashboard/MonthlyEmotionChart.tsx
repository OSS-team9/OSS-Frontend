"use client";

import { EmotionLog } from "@/types";
import Card from "@/components/common/Card";

interface MonthlyEmotionChartProps {
  logs: EmotionLog[];
}

// 감정별 색상 정의 (Tailwind 클래스 또는 Hex 코드)
const EMOTION_COLORS: Record<string, string> = {
  joy: "bg-joy", // 노랑
  anger: "bg-anger", // 빨강
  sadness: "bg-sadness", // 파랑
  panic: "bg-panic", // 보라
  hurt: "bg-hurt", // 초록
  anxiety: "bg-anxiety", // 주황
  neutral: "bg-neutral", // 회색
};

// 감정 순서 (차트에 표시될 순서)
const EMOTION_ORDER = [
  "joy",
  "anger",
  "sadness",
  "panic",
  "hurt",
  "anxiety",
  "neutral",
];

export default function MonthlyEmotionChart({
  logs,
}: MonthlyEmotionChartProps) {
  // 1. 감정별 개수 카운트
  const emotionCounts = logs.reduce((acc, log) => {
    if (log.emotion && log.emotion !== "empty") {
      acc[log.emotion] = (acc[log.emotion] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // 2. 최대 개수 계산 (막대 높이 비율용, 최소값 5로 설정하여 여백 확보)
  const maxCount = Math.max(5, ...Object.values(emotionCounts));

  return (
    <Card className="px-6 py-5">
      <h3 className="font-bold text-lg mb-6 text-black">이번달에 모인 감정</h3>

      <div className="flex justify-between items-end h-48 px-2 gap-2">
        {EMOTION_ORDER.map((emotion) => {
          const count = emotionCounts[emotion] || 0;
          const colorClass = EMOTION_COLORS[emotion] || "bg-gray-400";

          // 막대(트랙) 안에 동그라미를 쌓는 방식으로 구현
          // 최대 maxCount(예: 5개)만큼의 슬롯을 생성
          const slots = Array.from({ length: maxCount });

          return (
            <div
              key={emotion}
              className="flex flex-col items-center justify-end h-full w-8"
            >
              {/* 회색 트랙 배경 */}
              <div className="relative w-full h-full bg-gray-100 rounded-full flex flex-col-reverse items-center justify-start p-1 gap-1">
                {/* 아래에서부터 동그라미 쌓기 */}
                {slots.map((_, index) => {
                  // 현재 인덱스가 count보다 작으면 색칠, 아니면 투명(공간만 차지)
                  const isActive = index < count;

                  if (!isActive) return null; // 빈 공간은 렌더링 안 함 (또는 회색 원으로 채울 수도 있음)

                  return (
                    <div
                      key={index}
                      className={`w-full aspect-square rounded-full ${colorClass} shadow-sm`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
