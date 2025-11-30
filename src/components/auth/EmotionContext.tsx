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

  // 스티커 보드 데이터
  collectedEmotions: string[] | null;
  setCollectedEmotions: (emotions: string[]) => void;
  invalidateEmotionsCache: () => void;

  // 무드 라운지(House) 데이터 캐싱
  houseEmotion: string | null; // 배치된 감정 아이콘 (예: "joy")
  setHouseEmotion: (emotion: string | null) => void;
  isHouseFetched: boolean; // 서버에서 불러왔는지 여부
  setIsHouseFetched: (fetched: boolean) => void;
  invalidateHouseCache: () => void; // 저장 후 갱신용
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export function EmotionProvider({ children }: { children: ReactNode }) {
  const [selectedLog, setSelectedLog] = useState<EmotionLog | null>(null);

  // ⭐️ 캐싱용 상태들
  const [logs, setLogs] = useState<EmotionLog[]>([]);
  const [todayData, setTodayData] = useState<EmotionLog | null>(null);
  const [isFetched, setIsFetched] = useState(false);
  const [collectedEmotions, setCollectedEmotions] = useState<string[] | null>(
    null
  );

  const [houseEmotion, setHouseEmotion] = useState<string | null>(null);
  const [isHouseFetched, setIsHouseFetched] = useState(false);

  const invalidateCache = () => {
    setIsFetched(false);
    setLogs([]);
    setTodayData(null);
  };
  const invalidateEmotionsCache = () => {
    setCollectedEmotions(null);
  };
  const invalidateHouseCache = () => {
    setIsHouseFetched(false);
    setHouseEmotion(null);
  };

  return (
    <EmotionContext.Provider
      value={{
        // main
        selectedLog,
        setSelectedLog,
        logs,
        setLogs,
        todayData,
        setTodayData,
        isFetched,
        setIsFetched,
        invalidateCache,
        // house
        collectedEmotions,
        setCollectedEmotions,
        invalidateEmotionsCache,
        houseEmotion,
        setHouseEmotion,
        isHouseFetched,
        setIsHouseFetched,
        invalidateHouseCache,
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
