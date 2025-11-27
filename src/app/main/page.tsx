"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";

import DailyResult from "@/components/DailyResult";
import EmotionHistory from "@/components/EmotionHistory";
import { EmotionLog } from "@/types";
import { toEnglishEmotion } from "@/utils/emotionUtils";
import withAuth from "@/components/withAuth";
import LoadingSpinner from "@/components/LoadingSpinner";

function MainPage() {
  const { token, authFetch } = useAuth();

  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [todayData, setTodayData] = useState<EmotionLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchEmotions = async () => {
      try {
        // 1. 날짜 계산 (오늘 ~ 3일 전 = 총 4일)
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const today = new Date(now.getTime() - offset);

        const todayStr = today.toISOString().split("T")[0];

        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        const startDateStr = threeDaysAgo.toISOString().split("T")[0];

        // 2. API 호출
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/emotions?start_date=${startDateStr}&end_date=${todayStr}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("데이터를 불러오지 못했습니다.");
        }

        const json = await response.json();
        const serverData: any[] = json.data || [];
        const last4Days: EmotionLog[] = [];

        for (let i = 3; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];

          // 해당 날짜 데이터 찾기
          const found = serverData.find((item) => item.date === dateStr);

          if (found) {
            // [데이터 있음] 변환해서 추가
            last4Days.push({
              id: found.id,
              date: found.date,
              emotion: toEnglishEmotion(found.emotion),
              emotionLevel: found.emotionLevel || found.intensity || 1,
              imageUrl: found.imageData || found.imageUrl,
            });
          } else {
            // [데이터 없음] ⭐️ '빈 날짜 객체' 추가 (id는 임시값, emotion은 'empty' 같은 값)
            // EmotionHistory에서 emotion이 없거나 'empty'일 때 빈칸을 그리도록 처리해야 함
            last4Days.push({
              id: `empty_${dateStr}`,
              date: dateStr,
              emotion: "empty", // ⭐️ 'empty'라는 가상의 감정 상태 추가
              emotionLevel: 0,
            });
          }
        }

        setLogs(last4Days);

        // 오늘 데이터 찾기
        const todayLog = last4Days.find(
          (log) => log.date === todayStr && log.emotion !== "empty"
        );
        setTodayData(todayLog || null);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmotions();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center pb-20">
        <LoadingSpinner />
      </div>
    );
  }

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
          <EmotionHistory logs={logs} />
        </div>
      </section>
    </div>
  );
}

export default withAuth(MainPage);
