export interface EmotionLog {
  id: string; // DB 고유 ID
  date: string; // 날짜 (YYYY-MM-DD)
  emotion: string; // 감정 이름 (joy, sadness...)
  emotionLevel: number; // 감정 강도 (1~3)

  // 👇 상세 화면이나 오늘의 결과에서만 쓰이는 이미지 URL (선택적)
  imageUrl?: string;
}
