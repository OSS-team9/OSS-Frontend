export interface AnalysisResult {
  id: string; // DB에 저장된 고유 ID
  date: string; // 저장된 날짜 (예: "2025-11-22")
  imageUrl: string; // 업로드된 이미지 URL (S3 등)
  emotion: string; // 분석된 감정 (예: 'joy')
  emotionLevel: number; // 감정 강도 (1~3)
}
