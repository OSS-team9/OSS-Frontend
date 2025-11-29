"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { EmotionLog } from "@/types";

interface EmotionContextType {
  // 기존: 선택된 로그 (상세보기용)
  selectedLog: EmotionLog | null;
  setSelectedLog: (log: EmotionLog | null) => void;

  // ⭐️ [추가] 메인 페이지 데이터 캐싱
  logs: EmotionLog[];
  setLogs: (logs: EmotionLog[]) => void;

  todayData: EmotionLog | null;
  setTodayData: (log: EmotionLog | null) => void;

  isFetched: boolean; // 데이터가 이미 로드되었는지 여부
  setIsFetched: (fetched: boolean) => void;

  // 캐시 초기화 함수 (새 글 작성 후 호출)
  invalidateCache: () => void;
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export function EmotionProvider({ children }: { children: ReactNode }) {
  const [selectedLog, setSelectedLog] = useState<EmotionLog | null>(null);

  // ⭐️ 캐싱용 상태들
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [todayData, setTodayData] = useState<EmotionLog | null>(null);
  const [isFetched, setIsFetched] = useState(false);

  const invalidateCache = () => {
    setIsFetched(false);
    setLogs([]);
    setTodayData(null);
  };

  return (
    <EmotionContext.Provider
      value={{
        selectedLog,
        setSelectedLog,
        logs,
        setLogs,
        todayData,
        setTodayData,
        isFetched,
        setIsFetched,
        invalidateCache,
      }}
    >
      {children}
    </EmotionContext.Provider>
  );
}

export function useEmotion() {
  const context = useContext(EmotionContext);
  if (!context) {
    throw new Error("useEmotion must be used within an EmotionProvider");
  }
  return context;
}
