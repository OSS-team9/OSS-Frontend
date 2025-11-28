// 1. 영어 -> 한글 매핑
const EMOTION_MAP_KO: Record<string, string> = {
  joy: "기쁨",
  sadness: "슬픔",
  panic: "당황",
  anxiety: "불안",
  anger: "분노",
  hurt: "상처",
  neutral: "중립",
};

// 2. 한글 -> 영어 매핑 (필요할 때 사용)
const EMOTION_MAP_EN: Record<string, string> = {
  기쁨: "joy",
  슬픔: "sadness",
  당황: "panic",
  불안: "anxiety",
  분노: "anger",
  상처: "hurt",
  중립: "neutral",
};

const EMOTION_COLORS: Record<string, string> = {
  joy: "bg-joy-bg",
  panic: "bg-panic-bg",
  anger: "bg-anger-bg",
  anxiety: "bg-anxiety-bg",
  hurt: "bg-hurt-bg",
  sadness: "bg-sadness-bg",
  neutral: "bg-neutral-bg",
};

/**
 * 영어 감정(joy)을 한글(기쁨)로 변환합니다.
 * 매칭되는 값이 없으면 기본값 '중립'을 반환합니다.
 */
export function toKoreanEmotion(emotionEn: string): string {
  return EMOTION_MAP_KO[emotionEn] || "중립";
}

/**
 * 한글 감정(기쁨)을 영어(joy)로 변환합니다.
 * 매칭되는 값이 없으면 기본값 'neutral'을 반환합니다.
 */
export function toEnglishEmotion(emotionKo: string): string {
  return EMOTION_MAP_EN[emotionKo] || "neutral";
}

export function getEmotionBgColor(emotion: string): string {
  return EMOTION_COLORS[emotion] || "bg-gray-100";
}
