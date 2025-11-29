"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { EmotionLog } from "@/types";

interface EmotionContextType {
  selectedLog: EmotionLog | null;
  setSelectedLog: (log: EmotionLog | null) => void;
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export function EmotionProvider({ children }: { children: ReactNode }) {
  // ⭐️ 데이터를 메모리(State)에 저장합니다. (용량 제한 없음)
  const [selectedLog, setSelectedLog] = useState<EmotionLog | null>(null);

  return (
    <EmotionContext.Provider value={{ selectedLog, setSelectedLog }}>
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
