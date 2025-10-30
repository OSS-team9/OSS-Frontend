// components/WebCamera.tsx
"use client";

import { useState, useRef, useEffect } from 'react';

interface WebCameraProps {
  onCapture: (imageSrc: string) => void;
}

export default function WebCamera({ onCapture }: WebCameraProps) {
  // 1. ⭐️ 현재 카메라의 방향 (기본값: "user" = 전면 카메라)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 2. ⭐️ 카메라를 시작/전환하는 핵심 함수
  const startCamera = async (newFacingMode?: "user" | "environment") => {
    // 이미 카메라가 켜져있다면, 먼저 끄고 시작합니다.
    if (isCameraOn) {
      stopCamera();
    }

    // 새 카메라 방향이 지정되면 업데이트, 아니면 현재 facingMode 사용
    const currentFacingMode = newFacingMode || facingMode;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacingMode }, // ⭐️ 여기에서 facingMode를 사용!
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraOn(true);
      setFacingMode(currentFacingMode); // ⭐️ 실제 적용된 facingMode를 state에 저장
    } catch (err) {
      console.error("카메라 접근 오류:", err);
      alert("카메라에 접근할 수 없습니다. 권한을 확인해주세요.");
      setIsCameraOn(false);
    }
  };

  // '카메라 중지' 함수 (이전과 동일)
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current!.srcObject = null;
    }
    setIsCameraOn(false);
  };

  // '사진 찍기' 함수 (이전과 동일)
  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/png");
      onCapture(imageDataUrl);
      stopCamera();
    }
  };

  // 3. ⭐️ 카메라 전환 함수
  const toggleFacingMode = () => {
    // 현재 facingMode가 "user"면 "environment"로, 아니면 "user"로 변경
    const newMode = facingMode === "user" ? "environment" : "user";
    startCamera(newMode); // ⭐️ 새 모드로 카메라 시작
  };

  // '컴포넌트 정리' 함수 (이전과 동일)
  useEffect(() => {
    return () => {
      if (isCameraOn) {
        stopCamera();
      }
    };
  }, [isCameraOn]);

  // JSX
  return (
    <div className="w-full max-w-md p-4 mx-auto mt-5 border rounded-lg shadow-md bg-white">
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative">
        <video
          ref={videoRef}
          className={`w-full rounded-lg ${!isCameraOn ? "hidden" : ""}`}
          autoPlay
          playsInline
          muted
        />
        {!isCameraOn && (
          <div className="flex items-center justify-center w-full h-64 bg-gray-200 rounded-lg">
            <span className="text-gray-500">카메라가 꺼져있습니다.</span>
          </div>
        )}

        <div className="flex justify-center mt-4 space-x-4">
          {isCameraOn ? (
            // 4. ⭐️ 카메라가 켜져있을 때 '사진 찍기'와 '전환' 버튼 표시
            <>
              <button
                onClick={takeSnapshot}
                className="px-4 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 flex-1"
              >
                사진 찍기
              </button>
              <button
                onClick={toggleFacingMode} // ⭐️ 전환 버튼
                className="px-4 py-2 font-bold text-white bg-gray-500 rounded-lg hover:bg-gray-600"
              >
                {facingMode === "user" ? "후면 전환 🔄" : "전면 전환 🔄"}
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2 font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 flex-1"
              >
                중지
              </button>
            </>
          ) : (
            // 5. ⭐️ 카메라가 꺼져있을 때 '카메라 켜기' 버튼만 표시
            <button
              onClick={() => startCamera()} // 기본 facingMode("user")로 시작
              className="w-full px-4 py-2 font-bold text-white bg-green-500 rounded-lg hover:bg-green-600"
            >
              카메라 켜기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}