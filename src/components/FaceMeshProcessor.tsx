"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";
import Card from "@/components/BorderCard";

interface FaceMeshProcessorProps {
  imageSrc: string;
  onRetake: () => void;
  onAnalysisComplete?: (
    emotion: string,
    level: number,
    processedImage: string
  ) => void;
  onSaveRequest?: () => void;
  isLoggedIn: boolean;
}

const EMOTIONS = [
  "joy",
  "panic",
  "anger",
  "anxiety",
  "hurt",
  "sadness",
  "neutral",
];
const ICON_PLACEMENTS = [
  // ⭐️ id: 고유 식별자, landmarkIndex: 기준점(얼굴), width/height: 아이콘 크기(px), offsetX/Y: 기준점에서의 보정(px)
  {
    id: "top",
    landmarkIndex: 10,
    width: 432,
    height: 432,
    offsetX: -216,
    offsetY: -540,
  },
  {
    id: "left",
    landmarkIndex: 127,
    width: 360,
    height: 360,
    offsetX: -432,
    offsetY: -180,
  },
  {
    id: "right",
    landmarkIndex: 356,
    width: 324,
    height: 324,
    offsetX: 108,
    offsetY: -162,
  },
];

// ⭐️⭐️⭐️ AI 백엔드 통신 함수 (Best Practice) ⭐️⭐️⭐️
// -----------------------------------------------------------------
// TODO: 나중에 AI 백엔드가 완성되면, 이 함수 내부만 실제 API 호출(fetch)로 교체합니다.
// -----------------------------------------------------------------
async function getEmotionFromAI(
  blendshapes: any[] // 👈 (Input) FaceMesh가 감지한 표정 데이터
): Promise<{ emotion: string; level: number }> {
  // (1) ⭐️ 실제 AI 백엔드 호출 코드

  // (2) ⭐️ 현재 데모용 Mock 로직
  // (0.5초 딜레이를 시뮬레이션하고, 랜덤 감정과 랜덤 레벨을 반환)
  await new Promise((resolve) => setTimeout(resolve, 500));

  const randomEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
  const randomLevel = Math.floor(Math.random() * 3) + 1; // 1, 2, 3 중 랜덤

  console.log(
    `[Mock AI Result] Emotion: ${randomEmotion}, Level: ${randomLevel}`
  );
  return { emotion: randomEmotion, level: randomLevel };
}

export default function FaceMeshProcessor({
  imageSrc,
  onRetake,
  onAnalysisComplete,
  onSaveRequest,
  isLoggedIn,
}: FaceMeshProcessorProps) {
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(
    null
  );

  // '얼굴 감지 실패' 상태를 저장할 state 추가
  const [detectionFailed, setDetectionFailed] = useState(false);
  // '얼굴 이미지 추가' 상태
  const [isDrawingComplete, setIsDrawingComplete] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 'AI 모델 로드'
  useEffect(() => {
    async function createLandmarker() {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const landmarker = await FaceLandmarker.createFromOptions(
        filesetResolver,
        {
          baseOptions: {
            modelAssetPath: `/face_landmarker.task`,
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: "IMAGE",
        }
      );
      setFaceLandmarker(landmarker);
      console.log("Face Landmarker 모델 로드 성공!");
    }
    createLandmarker();
  }, []);

  // 얼굴 감지 및 그리기
  useEffect(() => {
    if (!faceLandmarker || !imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawingComplete(false);
    setDetectionFailed(false);

    const userImage = new Image();
    userImage.src = imageSrc;
    userImage.crossOrigin = "anonymous";

    // 원본 이미지 + FaceMesh  그리기
    userImage.onload = async () => {
      // [5단계] ⭐️ 모든 준비 완료. 이제 '한 번에' 그리기 시작
      const FIXED_WIDTH = 1440;
      const FIXED_HEIGHT = 1920;

      canvas.width = FIXED_WIDTH;
      canvas.height = FIXED_HEIGHT;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // (1) 원본 이미지 그리기
      const canvasAspectRatio = canvas.width / canvas.height;
      const imageAspectRatio = userImage.naturalWidth / userImage.naturalHeight;
      let sx = 0,
        sy = 0,
        sWidth = userImage.naturalWidth,
        sHeight = userImage.naturalHeight;

      if (imageAspectRatio > canvasAspectRatio) {
        sWidth = userImage.naturalHeight * canvasAspectRatio;
        sx = (userImage.naturalWidth - sWidth) / 2;
      } else {
        sHeight = userImage.naturalWidth / canvasAspectRatio;
        sy = (userImage.naturalHeight - sHeight) / 2;
      }
      ctx.drawImage(
        userImage,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // [1단계] ⭐️ FaceMesh 감지 (데이터 준비)
      const results = faceLandmarker.detect(userImage);
      if (results.faceLandmarks.length === 0) {
        setDetectionFailed(true);
        setIsDrawingComplete(true);
        return;
      }

      const landmarks = results.faceLandmarks[0];
      const blendshapes = results.faceBlendshapes[0]?.categories || [];

      // [2단계] ⭐️ AI 백엔드 통신 (Mock)
      const aiResult = await getEmotionFromAI(blendshapes);

      // [3단계] ⭐️ AI 결과에 맞는 '하나의' 아이콘 로드
      const iconToDraw = new Image();
      iconToDraw.src = `/emotions/${aiResult.emotion}_${aiResult.level}.png`;

      // [4단계] ⭐️ 아이콘 로드 완료 대기
      await new Promise((resolve) => (iconToDraw.onload = resolve));

      const scaledLandmarks = landmarks.map((landmark) => {
        // 1. 원본 이미지의 픽셀 좌표
        const originalX = landmark.x * userImage.naturalWidth;
        const originalY = landmark.y * userImage.naturalHeight;

        // 2. 캔버스 픽셀 좌표로 변환 (잘라낸 영역(sx, sy)과 비율(sWidth) 고려)
        const canvasX = ((originalX - sx) / sWidth) * canvas.width;
        const canvasY = ((originalY - sy) / sHeight) * canvas.height;

        // 3. DrawingUtils가 사용할 '캔버스 기준' 정규화 좌표로 다시 변환
        return {
          x: canvasX / canvas.width,
          y: canvasY / canvas.height,
          z: landmark.z,
        };
      });

      // (2) FaceMesh 그리기
      // const drawingUtils = new DrawingUtils(ctx);
      // drawingUtils.drawConnectors(
      //   scaledLandmarks,
      //   FaceLandmarker.FACE_LANDMARKS_TESSELATION,
      //   {
      //     color: "#FF00FF",
      //     lineWidth: 0.5,
      //   }
      // );

      // (3) 아이콘 그리기
      ICON_PLACEMENTS.forEach((placement) => {
        const landmark = scaledLandmarks[placement.landmarkIndex];
        const x = landmark.x * canvas.width + placement.offsetX;
        const y = landmark.y * canvas.height + placement.offsetY;
        ctx.drawImage(iconToDraw, x, y, placement.width, placement.height);
      });

      // [7단계] ⭐️ 모든 그리기가 완료됨
      setIsDrawingComplete(true);

      const finalImage = canvas.toDataURL("image/png");

      // ⭐️ 분석 완료 시 부모에게 알림
      if (onAnalysisComplete) {
        onAnalysisComplete(aiResult.emotion, aiResult.level, finalImage);
      }
    };
  }, [faceLandmarker, imageSrc]);

  // [다운로드 기능] 버튼 클릭 시 실행될 함수
  const handleDownload = () => {
    if (!canvasRef.current || !isDrawingComplete) return;

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png"); // 캔버스 내용을 PNG 데이터로 변환

    const today = new Date().toISOString().split("T")[0];
    const filename = `오늘_하루_${today}.png`;

    // 가상 링크(<a>)를 만들어서 다운로드 실행
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename; // 다운로드될 파일 이름
    link.click();
  };

  // [공유 기능] Web Share API 사용
  const handleShare = async () => {
    if (!canvasRef.current || !isDrawingComplete) return;

    try {
      const canvas = canvasRef.current;

      // 1. 캔버스를 Blob(파일 객체)으로 변환
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) {
        alert("이미지를 생성하지 못했습니다.");
        return;
      }

      // 2. 공유할 파일 객체 생성
      const file = new File([blob], "today-haru_result.png", {
        type: "image/png",
      });

      // 3. 브라우저가 파일 공유를 지원하는지 확인
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "오늘:하루 감정 분석",
          text: "내 감정 분석 결과를 확인해보세요!",
        });
      } else {
        // 지원하지 않는 경우 (PC 등) -> 다운로드로 대체하거나 알림
        alert(
          "이 브라우저는 이미지 공유를 지원하지 않습니다. 다운로드 기능을 이용해주세요."
        );
      }
    } catch (error) {
      console.error("공유 실패:", error);
      // 사용자가 공유를 취소했을 때도 에러로 잡히므로, 조용히 넘어가는 게 좋습니다.
    }
  };

  return (
    <div className="w-full h-full">
      <div className="w-full p-4 bg-app-bg-secondary">
        <Card className="mobile-container bg-gray-200">
          {/* 모델 로딩 중 메시지 */}
          {!faceLandmarker && (
            <div className="text-center p-4">
              <p>AI 모델을 로드 중입니다...</p>
            </div>
          )}

          {/* FaceMesh가 그려질 캔버스 */}
          <div className="aspect-3/4">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          {/* '감지 실패' 상태일 때만 에러 메시지 */}
          {detectionFailed && (
            <div className="text-center p-4 my-2 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-bold">얼굴을 감지할 수 없습니다.</p>
              <p className="text-sm">다른 사진으로 다시 시도해주세요.</p>
            </div>
          )}
        </Card>

        {/* '다시 찍기' 버튼 (모델 로드가 완료된 후에만 표시) */}
        <div className="flex justify-center mt-4 space-x-4 pb-1">
          {onSaveRequest && (
            <button
              onClick={onSaveRequest}
              disabled={!isDrawingComplete}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-md
                       hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition"
            >
              {/* ⭐️ 로그인 상태에 따라 텍스트 변경 */}
              {isDrawingComplete
                ? isLoggedIn
                  ? "결과 저장하기"
                  : "결과 저장하기 (로그인)"
                : "분석 중..."}
            </button>
          )}
          {faceLandmarker && !detectionFailed && (
            <button
              onClick={onRetake}
              className="w-80 px-6 py-3 bg-white text-black 
                     rounded-full hover:bg-gray-100 "
            >
              다시 촬영 / 선택
            </button>
          )}
        </div>
      </div>
      <div className="w-full p-4 mt-4 bg-app-bg-secondary">
        <div className="flex flex-col items-center space-y-4 w-full">
          <button
            onClick={handleShare}
            disabled={!isDrawingComplete}
            className="w-80 px-6 py-3 font-bold text-white bg-pink-500 rounded-full 
                        hover:bg-pink-600 disabled:bg-gray-400"
          >
            공유하기
          </button>
          <button
            onClick={handleDownload}
            disabled={!isDrawingComplete}
            className="w-80 px-6 py-3 bg-blue-500 text-white
                     font-semibold rounded-full shadow-md 
                     hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isDrawingComplete ? "결과 다운로드" : "분석 결과 그리는 중..."}
          </button>
        </div>
      </div>
    </div>
  );
}
