// src/app/calendar/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import withAuth from "@/components/auth/withAuth";
import { useAuth } from "@/components/auth/AuthContext";
import CalendarView from "@/components/calendar/CalendarView";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { EmotionLog } from "@/types";
import { toEnglishEmotion } from "@/utils/emotionUtils";
import MonthlyEmotionChart from "@/components/dashboard/MonthlyEmotionChart";

function CalendarPage() {
  const router = useRouter();
  const { token, authFetch } = useAuth();

  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ⭐️ 1. 날짜 상태를 여기서 관리 (기본값: 오늘)
  const [currentDate, setCurrentDate] = useState(new Date());

  // ⭐️ 2. currentDate가 바뀔 때마다 API 호출
  useEffect(() => {
    if (!token) return;

    const fetchMonthData = async () => {
      setIsLoading(true); // 로딩 시작
      try {
        // ⭐️ currentDate를 기준으로 해당 월의 1일 ~ 말일 계산
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // (로컬 시간 기준 문자열 생성 - UTC 문제 방지)
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0);

        // "YYYY-MM-DD" 포맷팅 함수 (로컬 시간 기준)
        const formatDate = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        };

        const startStr = formatDate(start);
        const endStr = formatDate(end);

        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/emotions?start_date=${startStr}&end_date=${endStr}`
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
        setIsLoading(false);
      }
    };

    fetchMonthData();
  }, [token, authFetch, currentDate]);

  return (
    <div className="min-h-screen bg-app-bg pt-6 px-4 pb-24">
      <div className="flex items-center mb-6 relative">
        <button
          onClick={() => router.back()}
          className="text-2xl font-bold text-black/60 absolute left-0 hover:text-black transition-colors"
        >
          ✕
        </button>
        <h1 className="w-full text-center text-lg font-bold text-black">
          감정 아카이브
        </h1>
      </div>

      {/* ⭐️ 로딩 중에도 캘린더 틀은 보여주되, 흐리게 처리하거나 스피너를 띄움 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {" "}
          {/* ⭐️ 간격(gap) 추가 */}
          {/* 1. 캘린더 */}
          <CalendarView
            logs={logs}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
          {/* 2. ⭐️ 이번 달 감정 차트 (여기에 추가!) */}
          <MonthlyEmotionChart logs={logs} />
        </div>
      )}
    </div>
  );
}

export default withAuth(CalendarPage);
