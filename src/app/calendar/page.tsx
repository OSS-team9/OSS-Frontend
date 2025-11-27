// src/app/calendar/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/components/withAuth";
import { useAuth } from "@/components/AuthContext";

import CalendarView from "@/components/CalendarView";
import LoadingSpinner from "@/components/LoadingSpinner"; // ⭐️ 로딩 컴포넌트 추가
import { EmotionLog } from "@/types";
import { toEnglishEmotion } from "@/utils/emotionUtils";

function CalendarPage() {
  const router = useRouter();
  const { token, authFetch } = useAuth();

  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true); // ⭐️ 로딩 상태 추가

  useEffect(() => {
    if (!token) return;

    const fetchMonthData = async () => {
      try {
        const now = new Date();
        // (우선 이번 달 1일 ~ 말일 데이터만 가져옴)
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0];

        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/emotions?start_date=${start}&end_date=${end}`
        );

        if (!response.ok) throw new Error("데이터 로드 실패");
        const json = await response.json();

        const serverData = json.data || [];
        const validLogs = serverData.map((item: any) => ({
          id: item.id,
          date: item.date,
          emotion: toEnglishEmotion(item.emotion),
          emotionLevel: item.emotionLevel || 1,
          imageUrl: item.imageData || item.imageUrl,
        }));

        setLogs(validLogs);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false); // ⭐️ 로딩 종료
      }
    };

    fetchMonthData();
  }, [token, authFetch]);

  return (
    <div className="min-h-screen bg-app-bg pt-6 px-4 pb-24">
      {/* 상단 헤더 */}
      <div className="flex items-center mb-6 relative">
        <button
          onClick={() => router.back()}
          // (흰색 -> 검은색으로 수정하여 가독성 확보)
          className="text-2xl font-bold text-black/60 absolute left-0 hover:text-black transition-colors"
        >
          ✕
        </button>
        <h1 className="w-full text-center text-lg font-bold text-black">
          감정 아카이브
        </h1>
      </div>

      {/* ⭐️ 로딩 상태에 따른 화면 분기 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingSpinner />
        </div>
      ) : (
        <CalendarView logs={logs} />
      )}
    </div>
  );
}

export default withAuth(CalendarPage);
