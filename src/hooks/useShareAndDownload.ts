import { useCallback } from "react";

export function useShareAndDownload() {
  // 1. 공유하기 기능 (Web Share API)
  const shareImage = useCallback(
    async (file: File, title: string = "오늘:하루") => {
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: title,
            text: "내 감정 분석 결과를 확인해보세요!",
          });
        } else {
          alert(
            "이 브라우저는 이미지 공유를 지원하지 않습니다. 다운로드 기능을 이용해주세요."
          );
        }
      } catch (error) {
        console.error("공유 실패:", error);
      }
    },
    []
  );

  // 2. 다운로드 기능
  const downloadImage = useCallback((dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }, []);

  // 3. 캔버스 -> Blob 변환 헬퍼 (공유용)
  const canvasToBlob = useCallback(
    async (canvas: HTMLCanvasElement): Promise<Blob | null> => {
      return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    },
    []
  );

  return { shareImage, downloadImage, canvasToBlob };
}
