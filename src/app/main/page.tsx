"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import withAuth from "@/components/withAuth";

import DailyResult from "@/components/DailyResult";
import EmotionHistory from "@/components/EmotionHistory";
import EmotionChart from "@/components/EmotionChart";
import { EmotionLog } from "@/types";

function MainPage() {
  const { token } = useAuth();

  // ⭐️ (가짜 데이터) 서버에서 받아왔다고 가정하는 '오늘의 데이터'
  // 데이터가 없으면(null이면) 빈 화면 처리를 할 수도 있습니다.
  const todayData: EmotionLog = {
    id: "1",
    date: "11. 04 (토)", // 디자인 시안 날짜
    imageUrl: "/images/face.jpg",
    emotion: "joy",
    emotionLevel: 3,
  };

  // 2. ⭐️ 과거 기록 데이터 (가짜 데이터)
  const historyData: EmotionLog[] = [
    { id: "h1", date: "2025-10-31", emotion: "joy", emotionLevel: 2 },
    { id: "h2", date: "2025-11-01", emotion: "sadness", emotionLevel: 1 },
    { id: "h3", date: "2025-11-02", emotion: "neutral", emotionLevel: 1 },
    { id: "h4", date: "2025-11-03", emotion: "anger", emotionLevel: 3 },
  ];

  // (참고) 만약 데이터가 없다면 null로 설정
  // const todayData = null;

  return (
    <div className="min-h-screen bg-app-bg">
      {/* 상단 (진한 갈색 영역 + DailyResult) */}
      <section className="bg-app-bg-tertiary">
        <div className="mobile-container">
          <DailyResult data={todayData} />
        </div>
      </section>
      <section className="px-4 py-3">
        <div className="mobile-container">
          {/* ⭐️ 감정 기록 (데이터 전달) */}
          <EmotionHistory logs={historyData} />
        </div>
      </section>
      <hr className="border-white mx-6" />
      <section className="px-4 py-3">
        <div className="mobile-container flex flex-col gap-4 pb-24">
          <EmotionChart />
        </div>
      </section>
    </div>
  );
}

export default withAuth(MainPage);
