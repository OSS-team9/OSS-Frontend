import { EmotionLog } from "@/types";

// ⭐️ 감정별 코멘트 템플릿
const EMOTION_COMMENTS: Record<string, { short: string; long: string }> = {
  joy: {
    short: "이번 달은 행복 에너지가 넘쳤어요! ✨",
    long: "매 순간을 밝게 만들어준 기쁨 덕분에 주변까지 환하게 빛났어요. 이 행복을 다음 달에도 이어가시길 응원합니다!",
  },
  sadness: {
    short: "마음이 잠시 차분해지는 시간이 필요했어요. 🌙",
    long: "슬픔은 감정을 돌아보는 중요한 시간이에요. 잠시 멈추고 쉬어가도 괜찮아요. 다음 달은 더 가벼운 마음으로 시작하길 바랍니다.",
  },
  panic: {
    short: "예상치 못한 순간에도 잘 대처했어요! 🌪️",
    long: "당황스러운 일이 많았지만, 결국 그 상황들을 지나왔어요. 앞으로는 조금 더 유연하게 대처할 수 있을 거예요. 스스로를 믿으세요!",
  },
  anxiety: {
    short: "미래에 대한 고민이 많았던 한 달이었네요. 💭",
    long: "불안함은 앞으로 나아가기 위한 준비 과정일 수 있어요. 너무 걱정하지 마세요. 한 걸음씩 천천히 목표를 향해 나아갈 힘이 있어요.",
  },
  anger: {
    short: "화나는 일에도 감정을 잘 다스렸어요! 🌋",
    long: "분노는 에너지가 넘친다는 증거입니다. 이 에너지를 긍정적인 방향으로 풀어내는 연습을 해보면 좋을 것 같아요. 잘했어요!",
  },
  hurt: {
    short: "상처를 회복하고 있는 소중한 시간이었어요. 🩹",
    long: "마음의 상처는 아물 시간이 필요해요. 이 시간을 통해 자신을 돌보고 치유할 수 있었을 거예요. 당신의 회복을 응원합니다.",
  },
  neutral: {
    short: "평온하고 차분하게 균형을 잡은 한 달이었어요. 🧘",
    long: "특별한 감정 기복 없이 안정적인 상태를 유지했어요. 이 중립의 평온함이 앞으로의 모든 일에 긍정적인 영향을 줄 거예요.",
  },
};

// ⭐️ 모든 감정이 비슷한 횟수로 나타났을 때의 코멘트
const MIXED_EMOTION_COMMENT = {
  short: "다양한 감정으로 가득 찬 다이나믹한 한 달이었어요! 🎢",
  long: "기쁨, 슬픔, 불안 등 여러 감정의 파도를 모두 경험했어요. 이는 당신의 삶이 얼마나 다채롭고 풍부한지 보여줍니다. 이 모든 경험들이 성장의 밑거름이 될 거예요.",
};

interface AnalysisResult {
  representativeEmotion: string | null; // 영어 감정명 (예: 'joy')
  count: number; // 대표 감정 횟수
  comment: string; // 최종 한 줄 코멘트
  isDominant: boolean; // 3회 이상 나타났는지 여부
}

/**
 * 이번 달 감정 로그를 분석하여 대표 감정 및 코멘트를 생성합니다.
 * @param logs - 해당 월의 감정 로그 배열
 * @returns 분석 결과 객체
 */
export function analyzeMonthlyEmotions(logs: EmotionLog[]): AnalysisResult {
  if (logs.length === 0) {
    return {
      representativeEmotion: null,
      count: 0,
      comment: "이번 달은 기록된 감정이 없어요. 기록을 시작해 보세요! 📝",
      isDominant: false,
    };
  }

  // 1. 감정 횟수 계산
  const emotionCounts = logs.reduce((acc, log) => {
    acc[log.emotion] = (acc[log.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. 가장 많은 횟수를 가진 감정 찾기
  let maxCount = 0;
  let representativeEmotion: string | null = null;
  let tie: string[] = []; // 동률 감정 리스트

  for (const emotion in emotionCounts) {
    if (emotionCounts[emotion] > maxCount) {
      maxCount = emotionCounts[emotion];
      representativeEmotion = emotion;
      tie = [emotion]; // 새로운 최대값이므로 리스트 초기화
    } else if (emotionCounts[emotion] === maxCount) {
      tie.push(emotion); // 동률 감정 추가
    }
  }

  // 3. 코멘트 결정
  const isDominant = maxCount >= 3;
  let comment: string;

  if (tie.length > 1) {
    // 동률일 경우: '다양한 감정' 코멘트
    comment = MIXED_EMOTION_COMMENT.short;
    // 대표 감정은 빈 값으로 처리하거나, 필요에 따라 'neutral' 등으로 처리 가능. 여기서는 null 유지.
    representativeEmotion = null;
  } else if (representativeEmotion) {
    // 단일 대표 감정일 경우
    const commentData =
      EMOTION_COMMENTS[representativeEmotion] || EMOTION_COMMENTS.neutral;

    if (isDominant) {
      // 3회 이상 (장문 코멘트)
      comment = commentData.long;
    } else {
      // 2회 이하 (단문 코멘트)
      comment = commentData.short;
    }
  } else {
    comment = "이번 달 기록을 돌아보며 스스로에게 코멘트를 남겨보세요! ✨";
  }

  return {
    representativeEmotion: representativeEmotion,
    count: maxCount,
    comment: comment,
    isDominant: isDominant,
  };
}
