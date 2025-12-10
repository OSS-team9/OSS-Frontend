"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadEmotionModel,
  lmToVector,
  runEmotion,
} from "./model";

export default function FaceMeshEmotion() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [emotion, setEmotion] = useState<string>("...");
  let session: any = null;

  useEffect(() => {
    async function init() {
      console.log("🔥 Initializing Emotion + FaceMesh");

      // 1) ONNX emotion model
      session = await loadEmotionModel();
      console.log("✔ ONNX Emotion Loaded");

      // 2) Load Google FaceMesh
      const vision = await import("@mediapipe/tasks-vision");
      const { FaceLandmarker, FilesetResolver } = vision;

      const resolver = await FilesetResolver.forVisionTasks(
        "/facemesh/" // public/facemesh 디렉토리에 파일 넣기
      );

      const landmarker = await FaceLandmarker.createFromOptions(resolver, {
        baseOptions: {
          modelAssetPath: "/facemesh/face_landmarker.task",
        },
        outputFaceBlendshapes: false,
        runningMode: "VIDEO",
      });

      // 3) Start camera
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      video.width = 640;
      video.height = 480;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      video.srcObject = stream;
      await video.play();

      const ctx = canvas.getContext("2d")!;
      canvas.width = 640;
      canvas.height = 480;

      async function loop() {
        const ts = performance.now();

        if (!video) return; // ← null 안전 처리
        if (!canvas) return;

        const result = landmarker.detectForVideo(video, ts);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (result.faceLandmarks?.length) {
          const lm = result.faceLandmarks[0];
          const vec = lmToVector(lm);
          const res = await runEmotion(session, vec);
          setEmotion(res.label);

          ctx.fillStyle = "red";
          ctx.font = "24px Arial";
          ctx.fillText(res.label, 10, 30);
        }

        requestAnimationFrame(loop);
      }

      loop();
    }

    init();
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center">
      <video ref={videoRef} className="rounded-lg" />
      <canvas ref={canvasRef} className="absolute top-0 left-0" />

      <div className="mt-4 text-xl font-bold text-gray-700">
        감정: {emotion}
      </div>
    </div>
  );
}
