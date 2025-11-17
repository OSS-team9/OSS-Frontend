"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

interface FaceMeshProcessorProps {
  imageSrc: string;
  onRetake: () => void;
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
    width: 120,
    height: 120,
    offsetX: -60,
    offsetY: -150,
  },
  {
    id: "left",
    landmarkIndex: 127,
    width: 100,
    height: 100,
    offsetX: -120,
    offsetY: -50,
  },
  {
    id: "right",
    landmarkIndex: 356,
    width: 90,
    height: 90,
    offsetX: 30,
    offsetY: -45,
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

      // [5단계] ⭐️ 모든 준비 완료. 이제 '한 번에' 그리기 시작
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // (1) 원본 이미지 그리기
      const canvasRatio = canvas.width / canvas.height;
      const imageRatio = userImage.naturalWidth / userImage.naturalHeight;
      let drawWidth, drawHeight, offsetX, offsetY;
      if (imageRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = drawHeight * imageRatio;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = drawWidth / imageRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }
      ctx.drawImage(userImage, offsetX, offsetY, drawWidth, drawHeight);

      // (2) FaceMesh 그리기
      // const drawingUtils = new DrawingUtils(ctx);
      // drawingUtils.drawConnectors(
      //   landmarks,
      //   FaceLandmarker.FACE_LANDMARKS_TESSELATION,
      //   {
      //     color: "#C0C0C070",
      //     lineWidth: 0.5,
      //   }
      // );

      // (3) 아이콘 그리기
      ICON_PLACEMENTS.forEach((placement) => {
        const landmark = landmarks[placement.landmarkIndex];
        const x = landmark.x * canvas.width + placement.offsetX;
        const y = landmark.y * canvas.height + placement.offsetY;
        ctx.drawImage(iconToDraw, x, y, placement.width, placement.height);
      });

      // [7단계] ⭐️ 모든 그리기가 완료됨
      setIsDrawingComplete(true);
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

  /* TODO
    이미지 비율 이상해지는거 해결
  */
  return (
    <div className="w-full h-full">
      <div className="w-full p-4 bg-app-bg-secondary">
        <div className="w-full max-w-md p-2 mx-auto rounded-2xl bg-white">
          {/* 모델 로딩 중 메시지 */}
          {!faceLandmarker && (
            <div className="text-center p-4">
              <p>AI 모델을 로드 중입니다...</p>
            </div>
          )}

          {/* FaceMesh가 그려질 캔버스 */}
          <div className="aspect-[3/4]">
            <canvas ref={canvasRef} className="w-full h-full rounded-2xl" />
          </div>

          {/* '감지 실패' 상태일 때만 에러 메시지 */}
          {detectionFailed && (
            <div className="text-center p-4 my-2 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-bold">얼굴을 감지할 수 없습니다.</p>
              <p className="text-sm">다른 사진으로 다시 시도해주세요.</p>
            </div>
          )}
        </div>

        {/* '다시 찍기' 버튼 (모델 로드가 완료된 후에만 표시) */}
        <div className="flex justify-center mt-4 space-x-4 pb-1">
          {faceLandmarker && (
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
        <div className="flex justify-center space-x-4">
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
