"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { useEmotion } from "@/components/auth/EmotionContext";

import DailyResult from "@/components/dashboard/DailyResult";
import EmotionHistory from "@/components/dashboard/EmotionHistory";
import { EmotionLog } from "@/types";
import { toEnglishEmotion } from "@/utils/emotionUtils";
import withAuth from "@/components/auth/withAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import InstallBanner from "@/components/common/InstallBanner";

function MainPage() {
  const { token, authFetch } = useAuth();

  const { logs, setLogs, todayData, setTodayData, isFetched, setIsFetched } =
    useEmotion();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchEmotions = async () => {
      // 2. ⭐️ 이미 데이터가 있으면(캐시됨) 서버 요청 스킵!
      if (isFetched) {
        console.log("🚀 EmotionContext 캐시 사용 (서버 요청 X)");
        setIsLoading(false);
        return;
      }

      console.log("🌐 서버에서 데이터를 불러옵니다...");
      try {
        setIsLoading(true);

        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const today = new Date(now.getTime() - offset);

        const todayStr = today.toISOString().split("T")[0];
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        const startDateStr = threeDaysAgo.toISOString().split("T")[0];

        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/emotions?start_date=${startDateStr}&end_date=${todayStr}`
        );

        if (!response.ok) throw new Error("데이터 로드 실패");

        const json = await response.json();
        const serverData = json.data || [];
        const last4Days: EmotionLog[] = [];

        for (let i = 3; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];

          const found = serverData.find((item: any) => item.date === dateStr);

          if (found) {
            last4Days.push({
              id: found.id,
              date: found.date,
              emotion: toEnglishEmotion(found.emotion),
              emotionLevel: found.emotionLevel || found.intensity || 1,
              imageUrl: found.imageData || found.imageUrl,
            });
          } else {
            last4Days.push({
              id: `empty_${dateStr}`,
              date: dateStr,
              emotion: "empty",
              emotionLevel: 0,
            });
          }
        }

        // 3. ⭐️ Context에 데이터 저장 및 플래그 설정
        setLogs(last4Days);

        const todayLog = last4Days.find(
          (log) => log.date === todayStr && log.emotion !== "empty"
        );
        setTodayData(todayLog || null);

        setIsFetched(true); // ⭐️ "데이터 가져왔음" 표시
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmotions();
  }, [token, authFetch, isFetched, setLogs, setTodayData, setIsFetched]);

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
      <section className="mobile-container bg-app-bg-tertiary">
        <DailyResult data={todayData} />
      </section>
      <InstallBanner />
      <section className="mobile-container px-4">
        {/* ⭐️ 감정 기록 (데이터 전달) */}
        <EmotionHistory logs={logs} />
      </section>
    </div>
  );
}

export default withAuth(MainPage);
