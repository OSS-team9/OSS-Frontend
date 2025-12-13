"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
import Card from "@/components/common/BorderCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useShareAndDownload } from "@/hooks/useShareAndDownload";
import * as ort from "onnxruntime-web";

// ==================================================
// 로그 정리: Mediapipe / TFLite 메시지 숨김
// ==================================================
if (typeof console !== "undefined") {
  const origInfo = console.info;
  console.info = function (...args) {
    const msg = String(args[0] ?? "");
    if (msg.includes("TensorFlow Lite")) return;
    if (msg.includes("XNNPACK delegate")) return;
    return origInfo.apply(console, args);
  };
}

// ==================================================
// 감정 라벨
// ==================================================
// const EMOTIONS = [
//   "sadness",
//   "joy",
//   "anger",
//   "anxiety",
//   "panic",
//   "hurt",
//   "neutral",
// ];
const EMOTIONS = [
  "우울우울",
  "햅삐햅삐",
  "빡침폭발",
  "안절부절",
  "개무서움",
  "마상입음",
  "무념무상",
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
// 랜드마크 1434 flatten (x,y,z * 478)
// ==================================================
function landmarksToVec1434(lm: any[]): Float32Array {
  const out = new Float32Array(1434);
  for (let i = 0; i < 478; i++) {
    out[i * 3 + 0] = lm[i].x;
    out[i * 3 + 1] = lm[i].y;
    out[i * 3 + 2] = lm[i].z;
  }
  return out;
}

// ==================================================
// 얼굴 Bounding Box 계산 (전체 이미지 기준)
// ==================================================
function computeBBox(lm: any[]) {
  let minX = 1, minY = 1, maxX = 0, maxY = 0;

  for (const p of lm) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  const w = maxX - minX;
  const h = maxY - minY;

  const pad = 0.1; // 여유
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
  const inputName = session.inputNames[0];            // "input"
  const outputName = session.outputNames[0];          // "keras_tensor_44"

  const output = await session.run({ [inputName]: inputTensor });
  const raw = Array.from(output[outputName].data as Float32Array);

  const probs = softmax(raw);
  const idx = probs.indexOf(Math.max(...probs));

  return {
    emotion: EMOTIONS[idx],
    level: Math.floor(probs[idx] * 3) + 1,
  };
}

function drawEmotionLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number
) {
  ctx.save();

  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const paddingX = 16;
  const paddingY = 10;

  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = 32;

  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(
    x - textWidth / 2 - paddingX,
    y - textHeight / 2 - paddingY,
    textWidth + paddingX * 2,
    textHeight + paddingY * 2
  );

  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, x, y);

  ctx.restore();
}

function drawEmotionLabelAboveBBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  bbox: { x: number; y: number; w: number; h: number },
  canvasW: number,
  canvasH: number
) {
  ctx.save();

  // bbox → pixel 좌표
  const bx = bbox.x * canvasW;
  const by = bbox.y * canvasH;
  const bw = bbox.w * canvasW;

  // bbox 크기에 연동된 폰트 크기
  // const fontSize = Math.max(16, Math.floor(bw * 0.08));
  const fontSize = Math.max(16, Math.floor(bw * 0.15));
  const paddingX = fontSize * 0.6;
  const paddingY = fontSize * 0.4;
  const margin = fontSize * 0.5;

  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const metrics = ctx.measureText(text);
  const textW = metrics.width;
  const textH = fontSize;

  // 텍스트 위치 (bbox 바로 위)
  const x = bx + bw / 2;
  let y = (by - margin - textH / 2) - 30;

  // 화면 밖으로 나가지 않도록 클램프
  if (y < textH / 2 + 4) {
    y = by + textH / 2 + margin; // 위가 부족하면 bbox 아래로
  }

  // 배경
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(
    x - textW / 2 - paddingX,
    y - textH / 2 - paddingY,
    textW + paddingX * 2,
    textH + paddingY * 2
  );

  // 텍스트
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, x, y);

  ctx.restore();
}


// ==================================================
// MAIN COMPONENT
// ==================================================
interface FaceMeshProcessorProps { 
  imageSrc: string; 
  onRetake: () => void; 
  onAnalysisComplete?: (emotion: string, level: number, 
    processedImage: string) => void; 
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
  const isRunningRef = useRef(false);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [emotionSession, setEmotionSession] = useState<ort.InferenceSession | null>(null);
  const [scaler, setScaler] = useState<{ mean: number[]; scale: number[] } | null>(null);

  const [detectionFailed, setDetectionFailed] = useState(false);
  const [isDrawingComplete, setIsDrawingComplete] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { downloadImage } = useShareAndDownload();

  // ==================================================
  // 모델 로딩 (FaceMesh + ONNX + scaler)
  // ==================================================
  useEffect(() => {
    async function loadAll() {
      try {
        // 1) scaler
        const res = await fetch("/models/mlp_v2_scaler.json");
        const raw = await res.json();
        setScaler({
          mean: raw.mean_ || raw.mean,
          scale: raw.scale_ || raw.scale,
        });
      } catch (e) {
        console.error("Failed to load scaler", e);
      }

      // 2) FaceLandmarker
      const resolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const lm = await FaceLandmarker.createFromOptions(resolver, {
        baseOptions: {
          modelAssetPath: "/models/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "IMAGE",
      });
      setFaceLandmarker(lm);

      // 3) ONNX session
      const session = await ort.InferenceSession.create("/models/mlp_v2.onnx", {
        executionProviders: ["webgpu", "wasm"],
      });
      setEmotionSession(session);
    }

    loadAll();
  }, []);

  // ==================================================
  // 얼굴 인식 + 감정 추론
  // ==================================================
  useEffect(() => {
    if (!faceLandmarker || !emotionSession || !scaler || !imageSrc) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setDetectionFailed(false);
    setIsDrawingComplete(false);

    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = "anonymous";

    img.onload = async () => {
      const W = img.width;
      const H = img.height;

      canvas.width = W;
      canvas.height = H;

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);

      // FaceMesh detect
      const result = faceLandmarker.detect(img);
      if (!result.faceLandmarks.length) {
        setDetectionFailed(true);
        setIsDrawingComplete(true);
        return;
      }

      const lm = result.faceLandmarks[0];

      // → vector 1434
      // const vec = landmarksToVec1434(lm);

      // 1) 얼굴 bbox 계산
      const bbox = computeBBox(lm);

      // 2) crop 기준 좌표로 변환
      const vec = landmarksToVec1434_CropNorm(lm, bbox);

      // → emotion inference
      // const emo = await runEmotion(emotionSession, vec, scaler);

      if (isRunningRef.current) {
        console.warn("Emotion inference skipped: session busy");
        return;
      }

      isRunningRef.current = true;

      try {
        const emo = await runEmotion(emotionSession, vec, scaler);

        // ==================================================
        //   감정 텍스트 삽입 블록
        //   ─ 주석 해제  → 이미지에 글자 삽입
        //   ─ 전체 주석 → raw 이미지 출력
        // ================================================== 
        
        // const ctx2 = canvas.getContext("2d");
        // if (ctx2) {
        //   const label = `${emo.emotion.toUpperCase()}`;
        //   drawEmotionLabel(
        //     ctx2,
        //     label,
        //     canvas.width * (1 / 2),
        //     canvas.height * (3 / 4)
        //   );
        // }

        const ctx2 = canvas.getContext("2d");
        if (ctx2) {
          const label = `${emo.emotion.toUpperCase()}`;
          drawEmotionLabelAboveBBox(
            ctx2,
            label,
            bbox,              // computeBBox 결과
            canvas.width,
            canvas.height
          );
        }
        // ==================================================

        const finalImg = canvas.toDataURL("image/png");
        if (onAnalysisComplete) {
          onAnalysisComplete(emo.emotion, emo.level, finalImg);
        }      
        console.log(emotionSession.inputNames)
        console.log(emotionSession.outputNames)
        console.log("Emotion:", emo);
      } finally {
        isRunningRef.current = false;
      }
      


      setIsDrawingComplete(true);
    };
  }, [faceLandmarker, emotionSession, scaler, imageSrc]);

  // ==================================================
  // 다운로드 버튼
  // ==================================================
  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    downloadImage(url, "today-haru.png");
  };

  // ==================================================
  // RENDER
  // ==================================================
  return (
    <div className="w-full h-full">
      <Card className="mobile-container bg-gray-200 relative">
        {!faceLandmarker || !emotionSession || !scaler ? <LoadingSpinner /> : null}

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

      {/* 버튼 UI */}
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
            {isSaving ? "저장 중..." : isLoggedIn ? "저장하기" : "로그인/저장"}
          </button>
        )}
      </div>

      {!detectionFailed && (
        <div className="w-full px-4 py-6 mt-4 bg-app-bg-secondary">
          <div className="flex flex-col items-center space-y-4 w-full">
            <button
              onClick={handleDownload}
              className="w-full max-w-sm py-3.5 bg-[#F5EFE6] text-[#56412C] rounded-2xl shadow-sm hover:bg-[#EADCC7]"
            >
              이미지로 다운로드
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
