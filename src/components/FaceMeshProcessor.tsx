// components/FaceMeshProcessor.tsx
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

export default function FaceMeshProcessor({
  imageSrc,
  onRetake,
}: FaceMeshProcessorProps) {
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(
    null
  );

  // ⭐️ 1. '얼굴 감지 실패' 상태를 저장할 state 추가
  const [detectionFailed, setDetectionFailed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 'AI 모델 로드' (이전과 동일)
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

  // '얼굴 감지' (수정됨)
  useEffect(() => {
    if (!faceLandmarker || !imageSrc || !canvasRef.current) {
      return;
    }

    // ⭐️ 5. 새로운 이미지가 들어오면, '감지 실패' 상태를 초기화
    setDetectionFailed(false);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const results = faceLandmarker.detect(image);

      // ⭐️ 7. (수정) 캔버스에는 원본 이미지를 '항상' 먼저 그립니다.
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // ⭐️ 8. (수정) 감지된 얼굴이 있는지(length > 0) 확인합니다.
      if (results.faceLandmarks.length === 0) {
        // 8-1. 감지 실패 시
        console.warn("얼굴 감지 실패: landmarks 배열이 비어있습니다.");
        setDetectionFailed(true); // '감지 실패' 상태로 설정
      } else {
        // 8-2. 감지 성공 시 (이전과 동일)
        const drawingUtils = new DrawingUtils(ctx);
        for (const landmarks of results.faceLandmarks) {
          drawingUtils.drawConnectors(
            landmarks,
            FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            {
              color: "#C0C0C070",
              lineWidth: 0.5,
            }
          );
        }
        console.log("FaceMesh 그리기 완료!");
      }
    };
  }, [faceLandmarker, imageSrc]);

  /* TODO
    이미지 비율 이상해지는거 해결
  */
  return (
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

        {/* ⭐️ 9. '감지 실패' 상태일 때만 에러 메시지를 보여줍니다. */}
        {detectionFailed && (
          <div className="text-center p-4 my-2 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-bold">얼굴을 감지할 수 없습니다.</p>
            <p className="text-sm">다른 사진으로 다시 시도해주세요.</p>
          </div>
        )}
      </div>
      {/* '다시 찍기' 버튼 (모델 로드가 완료된 후에만 표시) */}
      <div className="bg-app-bg-secondary">
        {faceLandmarker && (
          <button
            onClick={onRetake}
            className="w-full px-6 py-3 mt-4 bg-white text-black 
                     rounded-full hover:bg-gray-100 "
          >
            다시 촬영 / 선택
          </button>
        )}
      </div>
    </div>
  );
}
