// src/components/EmotionChart.tsx
"use client";

import Card from "./Card";

export default function EmotionChart() {
  // ⭐️ 막대 그래프 데이터 (높이 0~100%)
  // (나중에는 서버에서 받아온 데이터를 쓰면 됩니다)
  const chartData = [
    { height: 40, color: "bg-blue-400" },
    { height: 60, color: "bg-blue-400" },
    { height: 80, color: "bg-blue-400" },
    { height: 30, color: "bg-blue-400" },
    { height: 90, color: "bg-blue-400" },
    { height: 50, color: "bg-blue-400" },
    { height: 20, color: "bg-blue-400" },
    { height: 40, color: "bg-blue-400" },
    { height: 70, color: "bg-blue-400" },
    { height: 50, color: "bg-blue-400" },
  ];

  return (
    <Card className="p-6">
      {/* 1. 제목 및 설명 */}
      <div className="mb-6">
        <h3 className="font-bold text-xl mb-2 text-black">감정 변화</h3>
        <p className="text-sm text-gray-600 mb-1">
          이번주는 기분이 다운되어 보이시네요. 😭
        </p>
        <p className="text-xs text-gray-400 font-medium">
          연속 00일째 슬픔 • 이번달 기쁨 지수 30%
        </p>
      </div>

      {/* 2. 막대 그래프 영역 */}
      {/* items-end: 막대를 바닥부터 채움 */}
      <div className="w-full h-32 flex items-end justify-between gap-1 mt-4">
        {chartData.map((data, i) => (
          <div
            key={i}
            className="w-full h-full bg-gray-100 rounded-t-md relative overflow-hidden group"
          >
            {/* 실제 데이터 막대 (애니메이션 효과 추가) */}
            <div
              className={`absolute bottom-0 left-0 w-full rounded-t-md 
                          transition-all duration-1000 ease-out
                          ${data.color}`}
              // ⭐️ 높이를 style로 직접 지정
              style={{ height: `${data.height}%` }}
            />

            {/* (옵션) 호버 시 수치 표시 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-bold text-gray-600">
                {data.height}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
