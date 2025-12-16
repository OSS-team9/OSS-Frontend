// src/components/dashboard/MonthlyEmotionComment.tsx

import React, { useMemo } from "react";
import { EmotionLog } from "@/types"; // EmotionLog 타입 import
import { analyzeMonthlyEmotions } from "@/utils/emotionAnalysis"; // 분석 함수 import
import { toKoreanEmotion } from "@/utils/emotionUtils";
import Card from "@/components/common/Card";

interface MonthlyEmotionCommentProps {
  logs: EmotionLog[];
}

export default function MonthlyEmotionComment({
  logs,
}: MonthlyEmotionCommentProps) {
  // ⭐️ useMemo를 사용하여 로그가 변경될 때만 분석을 다시 실행
  const analysisResult = useMemo(() => {
    return analyzeMonthlyEmotions(logs);
  }, [logs]);

  const { representativeEmotion, count, comment, isDominant } = analysisResult;

  console.log("MonthlyEmotionComment - analysisResult:", analysisResult);
  // 대표 감정의 한글명 (UI 표시용)
  const emotionKo = representativeEmotion
    ? toKoreanEmotion(representativeEmotion)
    : null;

  return (
    <Card className="">
      <h2 className="text-sm font-semibold text-gray-500 mb-2">
        감정 요약 코멘트
      </h2>

      {representativeEmotion && count > 0 && (
        <div className="text-xs text-gray-500 mb-2">
          {/* 대표 감정의 이름과 횟수 표시 */}
          대표 감정: <span className="font-bold text-black">{emotionKo}</span> (
          {count}회)
          {/* 3회 이상일 때 추가 텍스트 표시 */}
          {isDominant && (
            <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-[10px] font-bold">
              이달의 주 감정
            </span>
          )}
        </div>
      )}

      {/* 최종 코멘트 (강조) */}
      <p className="text-base font-bold text-black leading-relaxed">
        {comment}
      </p>
    </Card>
  );
}
