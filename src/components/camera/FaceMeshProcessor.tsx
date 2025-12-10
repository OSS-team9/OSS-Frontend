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

// -----------------------------------------
// 감정 라벨
// -----------------------------------------
const EMOTIONS = ["sadness", "joy", "anger", "anxiety", "panic", "hurt", "neutral"];

// --- Hide Mediapipe / TF Lite INFO logs ---
if (typeof console !== "undefined") {
  const origInfo = console.info;
  console.info = function (...args) {
    // 필터링: 특정 문자열을 무시
    if (String(args[0]).includes("XNNPACK delegate")) return;
    if (String(args[0]).includes("TensorFlow Lite")) return;
    origInfo.apply(console, args);
  };
}

// -----------------------------------------
// Softmax
// -----------------------------------------
function softmax(arr: number[]) {
  const m = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - m));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

function flattenLandmarks(
  lm: Array<{ x: number; y: number; z: number }>,
  mode: number = 0,
  W: number = 1,
  H: number = 1){
  const out = new Float32Array(1434);

  for (let i = 0; i < 478; i++) {
    let x = lm[i].x;
    let y = lm[i].y;
    let z = lm[i].z;

    if (mode === 1) {
      // x,y 절대값 기반
      x = x * W;
      y = y * H;
    }

    if (mode === 2) {
      // x,y 중앙 정규화
      x = x - 0.5;
      y = y - 0.5;
    }

    if (mode === 3) {
      // train reshape와 반대되는 순서 테스트
      out[i * 3 + 0] = z;
      out[i * 3 + 1] = y;
      out[i * 3 + 2] = x;
      continue;
    }

    out[i * 3 + 0] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }

  return out;
}


// -----------------------------------------
// (패치1) landmarks → Float32Array(1434)
// -----------------------------------------
function landmarksTo1434Vector(lm: any[]): Float32Array {
  const v = new Float32Array(478 * 3);
  for (let i = 0; i < 478; i++) {
    v[i * 3 + 0] = lm[i].x;
    v[i * 3 + 1] = lm[i].y;
    v[i * 3 + 2] = lm[i].z;
  }
  return v;
}

// -----------------------------------------
// (패치2) Float32 기반 normalize
// -----------------------------------------
function normalizeVec(
  vec: Float32Array,
  mean: number[],
  scale: number[]
): Float32Array {
  const out = new Float32Array(1434);
  for (let i = 0; i < 1434; i++) {
    out[i] = (vec[i] - mean[i]) / scale[i];
  }
  return out;
}

// -----------------------------------------
// (패치3) ONNX 감정 추론 - input 이름은 반드시 ""
// -----------------------------------------
async function runEmotionPatched(
  session: ort.InferenceSession,
  vec1434: Float32Array,
  scaler: { mean: number[]; scale: number[] }
) {
  // 1) 정규화
  const norm = normalizeVec(vec1434, scaler.mean, scaler.scale);

  // 2) Float32Tensor 생성
  const inputTensor = new ort.Tensor("float32", norm, [1, 1434]);

  // 3) 핵심: ONNX input name 은 실제로 ""
  const outputMap = await session.run({ "": inputTensor });

  const outputName = Object.keys(outputMap)[0];
  const raw = Array.from(outputMap[outputName].data as Float32Array);

  // 4) softmax
  const probs = softmax(raw);
  const idx = probs.indexOf(Math.max(...probs));

  return {
    emotion: EMOTIONS[idx],
    level: Math.floor(probs[idx] * 3) + 1,
  };
}

// ===================================================================
// MAIN COMPONENT
// ===================================================================
interface FaceMeshProcessorProps {
  imageSrc: string;
  onRetake: () => void;
  onAnalysisComplete?: (emotion: string, level: number, processedImage: string) => void;
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
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [emotionSession, setEmotionSession] = useState<ort.InferenceSession | null>(null);
  const [scaler, setScaler] = useState<{ mean: number[]; scale: number[] } | null>(null);

  const [detectionFailed, setDetectionFailed] = useState(false);
  const [isDrawingComplete, setIsDrawingComplete] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { downloadImage } = useShareAndDownload();

  // ==================================================
  // 모델 로딩
  // ==================================================
  useEffect(() => {
    async function loadModels() {
      // scaler.json
      try {
        // const res = await fetch("/models/(최고)mlp_v2_scaler.json");
        const res = await fetch("/models/scaler.json");

        const raw = await res.json();

        // 🔥 mean_, scale_ → mean, scale 로 교체
        const fixed = {
          mean: raw.mean_ || raw.mean,
          scale: raw.scale_ || raw.scale,
        };

        setScaler(fixed);
      } catch (e) {
        console.error("❌ Failed to load scaler.json:", e);
      }

      // FaceLandmarker
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const lm = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "/models/face_landmarker.task",
          delegate: "GPU",
        },
        outputFaceBlendshapes: true,
        runningMode: "IMAGE",
      });

      setFaceLandmarker(lm);

      // ONNX 모델 로딩
      const session = await ort.InferenceSession.create("/models/(최고)mlp_v2.onnx", {
        executionProviders: ["wasm"],
      });

      setEmotionSession(session);
    }

    loadModels();
  }, []);

  // ==================================================
  // 얼굴 감지 + 감정 분석
  // ==================================================
  useEffect(() => {
    if (!faceLandmarker || !emotionSession || !imageSrc || !scaler) return;

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

      // FaceMesh detection
      const result = faceLandmarker.detect(img);

      if (!result.faceLandmarks.length) {
        setDetectionFailed(true);
        setIsDrawingComplete(true);
        return;
      }

      const lm = result.faceLandmarks[0];

      // 1) landmarks → Float32Array(1434)
      // const vec = landmarksTo1434Vector(lm);

      const vec = flattenLandmarks(lm, 0, W, H);  // 기본 버전
      // const vec = flattenLandmarks(lm, 1, W, H);  // 절대좌표 버전
      // const vec = flattenLandmarks(lm, 2, W, H);  // 중앙 기반
      // const vec = flattenLandmarks(lm, 3, W, H);  // zyx 버전

      // 2) 감정 추론 (patched)
      const emo = await runEmotionPatched(emotionSession, vec, scaler);

      console.log("🎯 Emotion:", emo);

      // 3) 결과 전달
      const finalImg = canvas.toDataURL("image/png");
      if (onAnalysisComplete) {
        onAnalysisComplete(emo.emotion, emo.level, finalImg);
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

  return (
    <div className="w-full h-full">
      <Card className="mobile-container bg-gray-200 relative">
        {!faceLandmarker || !emotionSession || !scaler ? (
          <LoadingSpinner />
        ) : null}

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

      {/* 버튼 UI 유지 */}
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
