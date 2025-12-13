"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthContext";
import { toEnglishEmotion } from "@/utils/emotionUtils";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// ⭐️ 1. 감정별/레벨별 이름 매핑 데이터 (User Original Data)
// API는 레벨(숫자)만 주므로, 여기서 이름을 매칭합니다.
const EMOTION_NAMES: Record<string, string[]> = {
  joy: ["만족", "즐거움", "행복"], // Lv.1, Lv.2, Lv.3 순서
  anger: ["불안", "화남", "격노"],
  sadness: ["우울", "비통", "절망"],
  panic: ["난감", "당혹", "놀람"],
  hurt: ["서운함", "외로움", "배신감"],
  anxiety: ["걱정", "두려움", "공포"],
  neutral: ["무기력", "무표정", "평온"],
};

// ⭐️ 2. 도감의 기본 틀 (순서 및 색상 정의)
const ALL_EMOTION_CATEGORIES = [
  { id: "joy", label: "기쁨", color: "bg-joy-bg" },
  { id: "anger", label: "분노", color: "bg-anger-bg" },
  { id: "sadness", label: "슬픔", color: "bg-sadness-bg" },
  { id: "panic", label: "당황", color: "bg-panic-bg" },
  { id: "hurt", label: "상처", color: "bg-hurt-bg" },
  { id: "anxiety", label: "불안", color: "bg-anxiety-bg" },
  { id: "neutral", label: "중립", color: "bg-neutral-bg" },
];

export default function EmotionCollection() {
  const { authFetch, token } = useAuth();

  // "joy-1", "anger-3" 형태로 해금된 아이템을 저장하는 Set
  const [unlockedSet, setUnlockedSet] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchCollection = async () => {
      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/unlocked-emotions`
        );

        if (!response.ok) throw new Error("도감 로드 실패");

        const data = await response.json();

        if (data.state === "success" && Array.isArray(data.unlocked_emotions)) {
          const newSet = new Set<string>();

          data.unlocked_emotions.forEach((item: any) => {
            const engEmotion = toEnglishEmotion(item.emotion);
            const key = `${engEmotion}-${item.level}`;
            newSet.add(key);
          });

          setUnlockedSet(newSet);
        }
      } catch (error) {
        console.error("도감 데이터 에러:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [authFetch, token]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {ALL_EMOTION_CATEGORIES.map((category) => (
        <div
          key={category.id}
          className="flex items-center bg-white rounded-[1.5rem] p-4 shadow-sm"
        >
          {/* 1. 왼쪽: 대표 감정 아이콘 (항상 표시) */}
          <div className="relative mr-4 shrink-0">
            <div
              className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center`}
            >
              <Image
                src={`/images/emotions/${category.id}.png`} // 대표 아이콘
                alt={category.label}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          </div>

          {/* 2. 오른쪽: 레벨별 수집 목록 (1~3레벨) */}
          <div className="flex-1 flex justify-around items-start">
            {[1, 2, 3].map((level) => {
              // 해금 여부 확인
              const isAcquired = unlockedSet.has(`${category.id}-${level}`);

              // ⭐️ 해당 레벨의 이름 가져오기 (배열 인덱스는 level-1)
              const emotionName =
                EMOTION_NAMES[category.id]?.[level - 1] || `Lv.${level}`;

              return (
                <div key={level} className="flex flex-col items-center gap-2">
                  {/* 캐릭터 원형 배경 */}
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-500
                                ${isAcquired ? category.color : "bg-gray-100"}`}
                  >
                    {isAcquired ? (
                      // ✅ 획득함: 캐릭터 이미지
                      <Image
                        src={`/images/emotions/${category.id}_${level}.png`}
                        alt={`${category.label} ${emotionName}`}
                        width={50}
                        height={50}
                        className="object-contain drop-shadow-sm hover:scale-110 transition-transform"
                      />
                    ) : (
                      // 🔒 미획득: 물음표
                      <span className="text-3xl font-bold text-gray-300">
                        ?
                      </span>
                    )}
                  </div>

                  {/* ⭐️ 이름 라벨 (Lv.1 대신 원래 이름 사용) */}
                  <span
                    className={`text-xs font-bold ${
                      isAcquired ? "text-black/70" : "text-transparent" // 미획득 시 텍스트 숨김(투명) 처리
                    }`}
                  >
                    {emotionName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
