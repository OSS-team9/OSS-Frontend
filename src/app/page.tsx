// src/app/page.tsx
"use client";

import Link from "next/link";
import DailyResult from "@/components/DailyResult";
// import EmotionHistory from "@/components/EmotionHistory";
// import EmotionChart from "@/components/EmotionChart";
import { AnalysisResult } from "../types";

export default function HomePage() {
  // ⭐️ (가짜 데이터) 서버에서 받아왔다고 가정하는 '오늘의 데이터'
  // 데이터가 없으면(null이면) 빈 화면 처리를 할 수도 있습니다.
  const todayData: AnalysisResult = {
    id: "1",
    date: "11. 04 (토)", // 디자인 시안 날짜
    imageUrl: "/face.jpg",
    emotion: "joy",
    emotionLevel: 3,
  };

  // (참고) 만약 데이터가 없다면 null로 설정
  // const todayData = null;

  return (
    <div className="min-h-screen bg-app-bg">
      {/* 1. 상단 (진한 갈색 영역 + DailyResult) */}
      <section className="bg-app-bg-tertiary">
        <div className="mobile-container">
          {/* ⭐️ 오늘의 결과 카드 */}
          <DailyResult data={todayData} />

          {/* (선택) 데이터가 없을 때 '기록하기' 버튼 표시 */}
          {!todayData && (
            <div className="text-center mt-4">
              <p className="text-white/80 mb-4">아직 오늘의 기록이 없어요!</p>
              <Link
                href="/camera" // ⭐️ 촬영 페이지로 이동
                className="px-6 py-3 bg-white text-black rounded-full font-bold shadow-lg"
              >
                오늘의 기분 기록하기
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
