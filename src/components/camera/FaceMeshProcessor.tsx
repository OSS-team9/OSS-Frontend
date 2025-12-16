"use client";

import { useState, useEffect, useRef } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import * as ort from "onnxruntime-web";
import Card from "@/components/common/BorderCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useShareAndDownload } from "@/hooks/useShareAndDownload";
import { getTodayDateString } from "@/utils/dateUtils";

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
// 아이콘 배치 설정 (원본 그대로)
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
// 얼굴 Bounding Box 계산
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
    out[i * 3 + 0] = (lm[i].x - bbox.x) / bbox.w;
    out[i * 3 + 1] = (lm[i].y - bbox.y) / bbox.h;
    out[i * 3 + 2] = lm[i].z / bbox.w;
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
// ONNX 감정 추론 (level 1~3 안정 분포)
// ==================================================
async function runEmotion(
  session: ort.InferenceSession,
  vec1434: Float32Array,
  scaler: { mean: number[]; scale: number[] }
) {
  const norm = normalize(vec1434, scaler.mean, scaler.scale);
  const inputTensor = new ort.Tensor("float32", norm, [1, 1434]);

  const output = await session.run({
    [session.inputNames[0]]: inputTensor,
  });

  const raw = Array.from(
    output[session.outputNames[0]].data as Float32Array
  );

  const probs = softmax(raw);
  const idx = probs.indexOf(Math.max(...probs));

  // 🔥 level 판단은 logit 기반
  const logit = raw[idx];

  let level = 1;
  if (logit > 1.2) level = 3;
  else if (logit > 0.6) level = 2;

  return {
    emotion: EMOTIONS[idx],
    level,
    raw,
    probs,
    idx
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
  const [faceLandmarker, setFaceLandmarker] =
    useState<FaceLandmarker | null>(null);
  const [emotionSession, setEmotionSession] =
    useState<ort.InferenceSession | null>(null);
  const [scaler, setScaler] = useState<{
    mean: number[];
    scale: number[];
  } | null>(null);

  const [detectionFailed, setDetectionFailed] = useState(false);
  const [isDrawingComplete, setIsDrawingComplete] = useState(false);

  const isRunningRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { downloadImage } = useShareAndDownload();

  // ==================================================
  // 모델 로딩
  // ==================================================
  useEffect(() => {
    async function loadAll() {
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      const scalerRes = await fetch("/models/mlp_v2_scaler.json");
      const scalerRaw = await scalerRes.json();
      setScaler({
        mean: scalerRaw.mean_ || scalerRaw.mean,
        scale: scalerRaw.scale_ || scalerRaw.scale,
      });

      const resolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const lm = await FaceLandmarker.createFromOptions(resolver, {
        baseOptions: {
          modelAssetPath: "/models/face_landmarker.task",
          delegate: isIOS ? "CPU" : "GPU",
        },
        runningMode: "IMAGE",
      });
      setFaceLandmarker(lm);

      const session = await ort.InferenceSession.create(
        "/models/mlp_v2_fp16.onnx",
        {
          executionProviders: isIOS
            ? ["wasm"]
            : ["webgpu", "webgl", "wasm"],
        }
      );
      setEmotionSession(session);
    }

    loadAll();
  }, []);

  // ==================================================
  // 이미지 처리
  // ==================================================
  useEffect(() => {
    if (
      !faceLandmarker ||
      !emotionSession ||
      !scaler ||
      !imageSrc ||
      !canvasRef.current
    )
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    setDetectionFailed(false);
    setIsDrawingComplete(false);

    const userImage = new Image();
    userImage.src = imageSrc;
    userImage.crossOrigin = "anonymous";

    userImage.onload = async () => {
      const FIXED_WIDTH = 1440;
      const FIXED_HEIGHT = 1920;
      canvas.width = FIXED_WIDTH;
      canvas.height = FIXED_HEIGHT;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(userImage, 0, 0, canvas.width, canvas.height);

      const smallCanvas = document.createElement("canvas");
      smallCanvas.width = 512;
      smallCanvas.height =
        (userImage.naturalHeight / userImage.naturalWidth) * 512;
      smallCanvas
        .getContext("2d")!
        .drawImage(userImage, 0, 0, smallCanvas.width, smallCanvas.height);

      const result = faceLandmarker.detect(smallCanvas);

      if (!result.faceLandmarks.length) {
        setDetectionFailed(true);
        setIsDrawingComplete(true);
        return;
      }

      if (isRunningRef.current) return;
      isRunningRef.current = true;

      try {
        const lm = result.faceLandmarks[0];
        const vec = landmarksToVec1434_CropNorm(lm, computeBBox(lm));
        const ai = await runEmotion(emotionSession, vec, scaler);
        console.log("Emotion:", ai.emotion);
        console.log("Level:", ai.level);
        console.log("Raw logits:", ai.raw);
        console.log("Softmax probs:", ai.probs);
        console.log("Top prob:", ai.probs[ai.idx]);


        const icon = new Image();
        icon.src = `/images/emotions/${ai.emotion}_${ai.level}.png`;
        await new Promise((r) => (icon.onload = r));

        ICON_PLACEMENTS.forEach((p) => {
          const pt = lm[p.landmarkIndex];
          ctx.drawImage(
            icon,
            pt.x * canvas.width + p.offsetX,
            pt.y * canvas.height + p.offsetY,
            p.width,
            p.height
          );
        });

        setIsDrawingComplete(true);
        onAnalysisComplete?.(
          ai.emotion,
          ai.level,
          canvas.toDataURL("image/png")
        );
      } finally {
        isRunningRef.current = false;
      }
    };
  }, [faceLandmarker, emotionSession, scaler, imageSrc]);

  // ==================================================
  // UI (원본 그대로)
  // ==================================================
  const handleShare = async () => {
    if (!canvasRef.current || !isDrawingComplete) return;
    const dateStr = getTodayDateString();
    const canvas = canvasRef.current;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) return;

    const file = new File([blob], `today-haru_${dateStr}.png`, {
      type: "image/png",
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "오늘:하루 감정 분석",
        text: "내 감정 분석 결과를 확인해보세요!",
      });
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dateStr = getTodayDateString();
    downloadImage(
      canvasRef.current.toDataURL("image/png"),
      `today-haru_${dateStr}.png`
    );
  };

  return (
    <div className="w-full h-full">
      <div className="w-full p-4 bg-app-bg-secondary">
        <Card className="mobile-container bg-gray-200 relative">
          {(!faceLandmarker || !emotionSession || !scaler) && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
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
    </div>
  );
}
