"use client";
import * as ort from "onnxruntime-web";

export const EMOTION_LABELS = [
  "sad",
  "happy",
  "angry",
  "fear",
  "surprised",
  "hurt",
  "neutral",
];

// ONNX 모델 로드
export async function loadEmotionModel() {
  const session = await ort.InferenceSession.create("/model/emotion.onnx", {
    executionProviders: ["wasm"],
  });
  return session;
}

// landmark(478개 * xy) → 1434 벡터 변환기
export function lmToVector(lm: any[]) {
  const vec = new Float32Array(1434);
  let idx = 0;

  for (let i = 0; i < lm.length; i++) {
    vec[idx++] = lm[i].x;
    vec[idx++] = lm[i].y;
    vec[idx++] = lm[i].z;
  }
  return vec;
}

// softmax
export function softmax(arr: number[]) {
  const max = Math.max(...arr);
  const exps = arr.map((x) => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b);
  return exps.map((v) => v / sum);
}

// 실제 emotion inference
export async function runEmotion(session: any, vec: Float32Array) {
  const input = new ort.Tensor("float32", vec, [1, 1434]);
  const output = await session.run({ input });
  const raw = output.output.data as Float32Array;

  const probs = softmax(Array.from(raw));
  const idx = probs.indexOf(Math.max(...probs));

  return {
    label: EMOTION_LABELS[idx],
    probs,
  };
}
