// components/FaceMeshProcessor.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils
} from "@mediapipe/tasks-vision";

// 1. ⭐️ 부모로부터 받을 'props'의 타입을 정의합니다.
interface FaceMeshProcessorProps {
  imageSrc: string; // 처리할 이미지 데이터
  onRetake: () => void; // '다시 찍기'를 위한 함수
}

// 2. ⭐️ props (imageSrc, onRetake)를 받습니다.
export default function FaceMeshProcessor({ imageSrc, onRetake }: FaceMeshProcessorProps) {
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 3. ⭐️ 'AI 모델 로드' (이전과 동일)
  useEffect(() => {
    async function createLandmarker() {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: `/face_landmarker.task`,
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: "IMAGE"
      });
      setFaceLandmarker(landmarker);
      console.log("Face Landmarker 모델 로드 성공!");
    }
    createLandmarker();
  }, []); // 맨 처음에 한 번만 실행

  // 4. ⭐️ '얼굴 감지' (수정됨: file input 대신 props의 imageSrc에 의존)
  useEffect(() => {
    // 5. ⭐️ 모델이 로드되었고, 부모로부터 imageSrc를 받았을 때만 실행
    if (!faceLandmarker || !imageSrc || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    image.src = imageSrc; // ⭐️ 부모가 준 imageSrc를 사용

    image.onload = () => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      // AI 감지 실행
      const results = faceLandmarker.detect(image);

      // 캔버스에 그리기
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const drawingUtils = new DrawingUtils(ctx);
      for (const landmarks of results.faceLandmarks) {
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
          color: "#C0C0C070",
          lineWidth: 0.5
        });
      }
      console.log("FaceMesh 그리기 완료!");
    };
    
  }, [faceLandmarker, imageSrc]); // ⭐️ 모델이나 imageSrc가 바뀔 때마다 다시 그림

  // 6. ⭐️ JSX (수정됨: file input이 사라지고, '다시 찍기' 버튼 추가)
  return (
    <div className="w-full max-w-md p-4 mx-auto mt-5 border rounded-lg shadow-md bg-white">
      {/* 모델 로딩 중 메시지 */}
      {!faceLandmarker && (
        <div className="text-center p-4">
          <p>AI 모델을 로드 중입니다...</p>
        </div>
      )}

      {/* FaceMesh가 그려질 캔버스 (항상 보임) */}
      <div className="mt-4 border-t pt-4">
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
        />
      </div>

      {/* '다시 찍기' 버튼 */}
      {faceLandmarker && ( // 모델 로드가 완료된 후에만 버튼 표시
        <button
          onClick={onRetake} // ⭐️ 부모가 전달해준 'onRetake' 함수를 실행
          className="w-full px-4 py-2 mt-4 font-bold text-white bg-green-500 rounded-lg hover:bg-green-600"
        >
          다시 찍기
        </button>
      )}
    </div>
  );
}