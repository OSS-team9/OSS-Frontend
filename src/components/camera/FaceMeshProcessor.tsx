"use client";

import { useState, useEffect, useRef } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import * as ort from "onnxruntime-web"; // ONNX Runtime 추가
import Card from "@/components/common/BorderCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useShareAndDownload } from "@/hooks/useShareAndDownload";
import { getTodayDateString } from "@/utils/dateUtils";

// ⭐️ [메모리 최적화] 전역 설정
ort.env.wasm.numThreads = 1;
ort.env.wasm.simd = false;
ort.env.wasm.proxy = false;

// ==================================================
// 감정 라벨
// ==================================================
const EMOTIONS = [
  "sadness",
  "joy",
  "anger",
  "anxiety",
  "panic",
  "hurt",
  "neutral",
];

// ==================================================
// 아이콘 배치 설정 (User Original)
// ==================================================
const ICON_PLACEMENTS = [
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

// ==================================================
// softmax
// ==================================================
function softmax(arr: number[]) {
  const m = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - m));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

// ==================================================
// 얼굴 Bounding Box 계산 (전체 이미지 기준)
// ==================================================
function computeBBox(lm: any[]) {
  let minX = 1,
    minY = 1,
    maxX = 0,
    maxY = 0;
  for (const p of lm) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const w = maxX - minX;
  const h = maxY - minY;
  const pad = 0.1;
  return {
    x: Math.max(0, minX - w * pad),
    y: Math.max(0, minY - h * pad),
    w: Math.min(1, w * (1 + pad * 2)),
    h: Math.min(1, h * (1 + pad * 2)),
  };
}

// ==================================================
// crop 기준 landmark → 1434 벡터
// ==================================================
function landmarksToVec1434_CropNorm(
  lm: any[],
  bbox: { x: number; y: number; w: number; h: number }
): Float32Array {
  const out = new Float32Array(1434);
  for (let i = 0; i < 478; i++) {
    const nx = (lm[i].x - bbox.x) / bbox.w;
    const ny = (lm[i].y - bbox.y) / bbox.h;
    const nz = lm[i].z / bbox.w;
    out[i * 3 + 0] = nx;
    out[i * 3 + 1] = ny;
    out[i * 3 + 2] = nz;
  }
  return out;
}

// ==================================================
// normalize
// ==================================================
function normalize(vec: Float32Array, mean: number[], scale: number[]) {
  const out = new Float32Array(1434);
  for (let i = 0; i < 1434; i++) {
    out[i] = (vec[i] - mean[i]) / scale[i];
  }
  return out;
}

// ==================================================
// ONNX 감정 추론 (최종 안정 버전)
// ==================================================
async function runEmotion(
  session: ort.InferenceSession,
  vec1434: Float32Array,
  scaler: { mean: number[]; scale: number[] }
) {
  // normalize
  const norm = normalize(vec1434, scaler.mean, scaler.scale);

  // tensor
  const inputTensor = new ort.Tensor("float32", norm, [1, 1434]);

  // 정확한 input/output 이름
  const inputName = session.inputNames[0]; // "input"
  const outputName = session.outputNames[0]; // "keras_tensor_44"

  const output = await session.run({ [inputName]: inputTensor });
  const raw = Array.from(output[outputName].data as Float32Array);

  const probs = softmax(raw);
  const idx = probs.indexOf(Math.max(...probs));

  return {
    emotion: EMOTIONS[idx],
    level: Math.floor(probs[idx] * 3) + 1,
  };
}

// ==================================================
// MAIN COMPONENT
// ==================================================
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
  isSaving?: boolean;
}

export default function FaceMeshProcessor({
  imageSrc,
  onRetake,
  onAnalysisComplete,
  onSaveRequest,
  isLoggedIn,
  isSaving = false,
}: FaceMeshProcessorProps) {
  // 상태 관리
  const [scaler, setScaler] = useState<{
    mean: number[];
    scale: number[];
  } | null>(null);

  const [detectionFailed, setDetectionFailed] = useState(false);
  const [isDrawingComplete, setIsDrawingComplete] = useState(false);

  // 🔍 [디버깅용] 로그 상태 추가
  const [debugLog, setDebugLog] = useState<string[]>([]);

  // 🔍 [디버깅용] 로그 추가 함수
  const addLog = (msg: string) => {
    console.log(msg); // 콘솔에도 찍고
    setDebugLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()} : ${msg}`,
    ]); // 화면에도 찍음
  };

  const isRunningRef = useRef(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 공유 훅 사용
  const { downloadImage } = useShareAndDownload();

  // 1. 초기 로딩: 오직 'Scaler' 데이터만 로드 (가벼움)
  useEffect(() => {
    async function loadScaler() {
      try {
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        addLog(`📱 기기: ${isIOS ? "iOS" : "PC/Android"}`);
        addLog("⚡ 전략: 순차 실행 (메모리 절약)");

        const res = await fetch("/models/mlp_v2_scaler.json");
        const raw = await res.json();
        setScaler({
          mean: raw.mean_ || raw.mean,
          scale: raw.scale_ || raw.scale,
        });
        addLog("✅ 설정 데이터 로드 완료");
      } catch (e) {
        addLog(`🚨 설정 로드 실패: ${e}`);
      }
    }
    loadScaler();
  }, []);

  // 2. 이미지 처리 프로세스 (여기에 모든 로직 집중)
  useEffect(() => {
    if (!scaler || !imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    setIsDrawingComplete(false);
    setDetectionFailed(false);

    const userImage = new Image();
    userImage.src = imageSrc;
    userImage.crossOrigin = "anonymous";

    userImage.onload = async () => {
      // 캔버스 초기화 및 그리기
      canvas.width = 1440;
      canvas.height = 1920;
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

      if (isRunningRef.current) return;
      isRunningRef.current = true;

      // 🛑 핵심 로직: 단계별 로딩 -> 실행 -> 삭제
      setTimeout(async () => {
        let landmarker: FaceLandmarker | null = null;
        let session: ort.InferenceSession | null = null;

        try {
          const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

          // -------------------------------------------------------
          // [STEP 1] FaceMesh 로드 & 실행 & 삭제
          // -------------------------------------------------------
          addLog("1️⃣ FaceMesh 모델 로딩 중...");
          const resolver = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
          );
          landmarker = await FaceLandmarker.createFromOptions(resolver, {
            baseOptions: {
              modelAssetPath: "/models/face_landmarker.task",
              delegate: "CPU", // iOS 안정성
            },
            runningMode: "IMAGE",
          });

          // 이미지 축소 (256px)
          const ANALYSIS_WIDTH = 256;
          const analysisScale = ANALYSIS_WIDTH / userImage.naturalWidth;
          const analysisHeight = userImage.naturalHeight * analysisScale;
          const smallCanvas = document.createElement("canvas");
          smallCanvas.width = ANALYSIS_WIDTH;
          smallCanvas.height = analysisHeight;
          const smallCtx = smallCanvas.getContext("2d", {
            willReadFrequently: true,
          });
          smallCtx?.drawImage(userImage, 0, 0, ANALYSIS_WIDTH, analysisHeight);

          addLog("📸 얼굴 감지 실행...");
          const result = landmarker.detect(smallCanvas);

          // 🗑️ [중요] FaceMesh 메모리 즉시 해제!
          landmarker.close();
          landmarker = null;
          addLog("🗑️ FaceMesh 메모리 해제 완료");

          if (!result.faceLandmarks.length) {
            addLog("❌ 얼굴 없음");
            setDetectionFailed(true);
            setIsDrawingComplete(true);
            return;
          }
          const lm = result.faceLandmarks[0];

          // -------------------------------------------------------
          // [STEP 2] 잠시 대기 (GC 시간 벌기)
          // -------------------------------------------------------
          // addLog("☕️ 메모리 정리 대기 (1초)...");
          // await new Promise(r => setTimeout(r, 1000));

          // -------------------------------------------------------
          // [STEP 3] ONNX 로드 & 실행 & 삭제
          // -------------------------------------------------------
          addLog("2️⃣ 감정 모델(ONNX) 로딩 중...");

          // 모델 경로 (경량화 모델 사용)
          // const modelPath = isIOS ? "/models/mlp_v2_small.onnx" : "/models/mlp_v2.onnx";

          session = await ort.InferenceSession.create("/models/mlp_v2.onnx", {
            executionProviders: isIOS ? ["wasm"] : ["webgpu", "webgl", "wasm"],
          });

          addLog("🧠 감정 분석 실행...");
          const bbox = computeBBox(lm);
          const vec = landmarksToVec1434_CropNorm(lm, bbox);
          const aiResult = await runEmotion(session, vec, scaler);

          // 🗑️ [중요] ONNX 메모리 해제 (변수 초기화)
          session = null;
          addLog("🗑️ ONNX 메모리 해제 완료");

          addLog(`🎉 결과: ${aiResult.emotion}`);

          // -------------------------------------------------------
          // [STEP 4] 결과 그리기
          // -------------------------------------------------------
          const iconToDraw = new Image();
          iconToDraw.src = `/images/emotions/${aiResult.emotion}_${aiResult.level}.png`;
          await new Promise((resolve) => (iconToDraw.onload = resolve));

          const scaledLandmarks = lm.map((landmark) => {
            const originalX = landmark.x * userImage.naturalWidth;
            const originalY = landmark.y * userImage.naturalHeight;
            const canvasX = ((originalX - sx) / sWidth) * canvas.width;
            const canvasY = ((originalY - sy) / sHeight) * canvas.height;
            return {
              x: canvasX / canvas.width,
              y: canvasY / canvas.height,
              z: landmark.z,
            };
          });

          ICON_PLACEMENTS.forEach((placement) => {
            const landmark = scaledLandmarks[placement.landmarkIndex];
            const x = landmark.x * canvas.width + placement.offsetX;
            const y = landmark.y * canvas.height + placement.offsetY;
            ctx.drawImage(iconToDraw, x, y, placement.width, placement.height);
          });

          setIsDrawingComplete(true);

          // 최종 결과 생성
          const finalImage = canvas.toDataURL("image/jpeg", 0.7);
          if (onAnalysisComplete) {
            onAnalysisComplete(aiResult.emotion, aiResult.level, finalImage);
          }
        } catch (error) {
          console.error(error);
          addLog(`🚨 에러: ${error}`);
        } finally {
          // 안전장치: 혹시 에러나서 안 닫혔을 경우를 대비
          if (landmarker) (landmarker as FaceLandmarker).close();
          session = null;
          isRunningRef.current = false;
        }
      }, 100); // UI 렌더링 후 시작
    };
  }, [scaler, imageSrc]); // 의존성 배열에서 모델 제거됨

  // 공유하기 핸들러
  const handleShare = async () => {
    if (!canvasRef.current || !isDrawingComplete) return;
    const dateStr = getTodayDateString();
    try {
      const canvas = canvasRef.current;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return alert("이미지 생성 실패");

      const filename = `today-haru_${dateStr}.png`;
      const file = new File([blob], filename, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "오늘:하루 감정 분석",
          text: "내 감정 분석 결과를 확인해보세요!",
        });
      } else {
        alert("이 브라우저는 공유를 지원하지 않습니다.");
      }
    } catch (error) {
      console.log("공유 취소됨");
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dateStr = getTodayDateString();
    const url = canvasRef.current.toDataURL("image/png");
    downloadImage(url, `today-haru_${dateStr}.png`);
  };

  return (
    <div className="w-full h-full">
      <div className="w-full p-4 bg-app-bg-secondary">
        <Card className="mobile-container bg-gray-200 relative">
          {!scaler && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
              <LoadingSpinner />
            </div>
          )}

          <div className="aspect-3/4">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          {detectionFailed && (
            <div className="text-center p-4 my-2 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <p className="font-bold">얼굴을 감지할 수 없습니다.</p>
              <p className="text-sm">다른 사진으로 다시 시도해주세요.</p>
            </div>
          )}
        </Card>

        <div className="flex items-center justify-between mt-6 gap-3 w-full max-w-md mx-auto">
          <button
            onClick={onRetake}
            disabled={isSaving}
            className="flex-1 py-4 bg-[#F5EFE6] text-[#56412C] font-semibold rounded-2xl shadow-md hover:bg-[#EADCC7]"
          >
            다시 촬영
          </button>

          {onSaveRequest && !detectionFailed && (
            <button
              onClick={onSaveRequest}
              disabled={!isDrawingComplete || isSaving}
              className="flex-1 py-4 bg-app-bg-tertiary text-white font-bold rounded-2xl shadow-md hover:bg-[#3E2E1E]"
            >
              {isSaving
                ? "저장 중..."
                : isLoggedIn
                ? "저장하기"
                : "로그인/저장"}
            </button>
          )}
        </div>
      </div>

      {!detectionFailed && (
        <div className="w-full px-4 py-6 mt-4 bg-app-bg-secondary">
          <div className="flex flex-col items-center space-y-4 w-full">
            <button
              onClick={handleShare}
              className="w-full max-w-sm py-3.5 bg-white border-2 border-app-bg-secondary text-app-bg-secondary font-bold rounded-2xl shadow-sm hover:bg-[#FAF7F2]"
            >
              공유하기
            </button>

            <button
              onClick={handleDownload}
              className="w-full max-w-sm py-3.5 bg-[#F5EFE6] font-bold text-[#56412C] rounded-2xl shadow-sm hover:bg-[#EADCC7]"
            >
              이미지로 다운로드
            </button>
          </div>
        </div>
      )}
      {/* 🔍 [디버깅용 로그 UI] 
        - 테스트가 끝나면 이 아래 div 부분만 지우시면 됩니다!
      */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 text-green-400 text-xs overflow-y-auto z-[9999] p-3 pointer-events-none font-mono opacity-80">
        <div className="font-bold text-white mb-2 border-b border-gray-600 pb-1">
          🛠️ 실시간 처리 로그
        </div>
        {debugLog.length === 0 && (
          <div className="text-gray-500">대기 중...</div>
        )}
        {debugLog.map((log, i) => (
          <div key={i} className="mb-1 border-b border-gray-800 pb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
