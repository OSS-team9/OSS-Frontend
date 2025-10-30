// components/WebCamera.tsx
"use client";

import { useState, useRef, useEffect } from 'react';

// 1. ⭐️ 부모로부터 받을 'props'의 타입을 정의합니다.
//    (onCapture는 '문자열'을 받고 '아무것도 리턴하지 않는' 함수)
interface WebCameraProps {
  onCapture: (imageSrc: string) => void;
}

// 2. ⭐️ props를 받습니다.
export default function WebCamera({ onCapture }: WebCameraProps) {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // '카메라 시작' 함수 (이전과 동일)
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraOn(true);
    } catch (err) {
      console.error("카메라 접근 오류:", err);
      alert("카메라에 접근할 수 없습니다. 권한을 확인해주세요.");
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

  // 3. ⭐️ '사진 찍기' 함수 (수정됨)
  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/png");

      // 4. ⭐️ (중요) 찍은 사진을 '부모에게 전달'합니다.
      onCapture(imageDataUrl);

      // 사진을 찍었으니 카메라는 중지합니다.
      stopCamera();
    }
  };

  // '컴포넌트 정리' 함수 (이전과 동일)
  useEffect(() => {
    return () => {
      if (isCameraOn) {
        stopCamera();
      }
    };
  }, [isCameraOn]);

  // 5. ⭐️ JSX (수정됨: '찍은 사진'을 보여주는 부분이 사라짐)
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
            <>
              <button
                onClick={takeSnapshot}
                className="px-4 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                사진 찍기
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2 font-bold text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                중지
              </button>
            </>
          ) : (
            <button
              onClick={startCamera}
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