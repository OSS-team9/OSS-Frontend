"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadEmotionModel,
  lmToVector,
  runEmotion,
} from "./model";

// ================================
// FaceMesh 단발 실행 함수 (추가)
// ================================
async function runFaceMeshOnceFromCanvas(
  canvas: HTMLCanvasElement
) {
  const vision = await import("@mediapipe/tasks-vision");
  const { FaceLandmarker, FilesetResolver } = vision;

  const resolver = await FilesetResolver.forVisionTasks("/facemesh/");

  const landmarker = await FaceLandmarker.createFromOptions(resolver, {
    baseOptions: {
      modelAssetPath: "/facemesh/face_landmarker.task",
      delegate: "CPU", // iOS 안정
    },
    runningMode: "IMAGE",
    numFaces: 1,
  });

  try {
    const result = landmarker.detect(canvas);
    return result.faceLandmarks?.[0] ?? null;
  } finally {
    landmarker.close(); // 🔥 반드시 즉시 해제
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export default function FaceMeshEmotion() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [emotion, setEmotion] = useState<string>("...");
  const emotionDoneRef = useRef(false); // 🔒 단 1회 실행 가드
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    async function init() {
      console.log("🔥 Initializing Emotion + FaceMesh");

      // 1) ONNX emotion model (1회 로딩)
      sessionRef.current = await loadEmotionModel();
      console.log("✔ ONNX Emotion Loaded");

      // 2) Camera start
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      video.srcObject = stream;
      await video.play();

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 640;
      canvas.height = 480;
      video.width = 640;
      video.height = 480;

      // ================================
      // Render loop (FaceMesh는 1회만)
      // ================================
      async function loop() {
        if (!video || !canvas || !ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 🔥 딱 한 프레임에서만 FaceMesh 실행
        if (!emotionDoneRef.current) {
          emotionDoneRef.current = true;

          const lm = await runFaceMeshOnceFromCanvas(canvas);

          if (lm && sessionRef.current) {
            const vec = lmToVector(lm);
            const res = await runEmotion(sessionRef.current, vec);

            setEmotion(res.label);

            ctx.fillStyle = "red";
            ctx.font = "24px Arial";
            ctx.fillText(res.label, 10, 30);
          }
        }

        requestAnimationFrame(loop);
      }

      loop();
    }

    init();

    // ================================
    // cleanup
    // ================================
    return () => {
      const video = videoRef.current;
      if (video?.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((t) => t.stop());
        video.srcObject = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center">
      <video ref={videoRef} className="rounded-lg" />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
      />

      <div className="mt-4 text-xl font-bold text-gray-700">
        감정: {emotion}
      </div>
    </div>
  );
}
