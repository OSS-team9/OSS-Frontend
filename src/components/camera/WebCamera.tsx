// WebCamera.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Card from "@/components/common/BorderCard";
import {
  IoCameraReverseOutline,
  IoRadioButtonOn,
  IoStopCircleOutline,
  IoCameraOutline,
} from "react-icons/io5"; // ⭐️ 아이콘 추가

interface WebCameraProps {
  onCapture: (imageSrc: string) => void;
}

export default function WebCamera({ onCapture }: WebCameraProps) {
  // 현재 카메라의 방향 (기본값: "user" = 전면 카메라)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 카메라를 시작/전환하는 핵심 함수
  const startCamera = async (newFacingMode?: "user" | "environment") => {
    // 이미 카메라가 켜져있다면, 먼저 끄고 시작합니다.
    if (isCameraOn) {
      stopCamera();
    }

    // 새 카메라 방향이 지정되면 업데이트, 아니면 현재 facingMode 사용
    const currentFacingMode = newFacingMode || facingMode;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacingMode }, // 여기에서 facingMode를 사용
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraOn(true);
      setFacingMode(currentFacingMode); // 실제 적용된 facingMode를 state에 저장
    } catch (err) {
      console.error("카메라 접근 오류:", err);
      alert("카메라에 접근할 수 없습니다. 권한을 확인해주세요.");
      setIsCameraOn(false);
    }
  };

  // '카메라 중지' 함수
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current!.srcObject = null;
    }
    setIsCameraOn(false);
  };

  // '사진 찍기' 함수
  // const takeSnapshot = () => {
  //   if (videoRef.current && canvasRef.current) {
  //     const video = videoRef.current;
  //     const canvas = canvasRef.current;
  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;
  //     const context = canvas.getContext("2d");

  //     if (context) {
  //       // ⭐️ 1. 전면 카메라("user")일 때만 캔버스를 뒤집습니다.
  //       if (facingMode === "user") {
  //         context.save(); // 현재 캔버스 상태 저장
  //         context.scale(-1, 1); // ⭐️ 캔버스를 가로로 뒤집기

  //         // ⭐️ 캔버스가 뒤집혔으므로, 이미지를 그리는 x축 시작점도 반대로(-canvas.width) 변경
  //         context.drawImage(
  //           video,
  //           -canvas.width,
  //           0,
  //           canvas.width,
  //           canvas.height
  //         );

  //         context.restore(); // 캔버스 상태 원상 복구
  //       } else {
  //         // ⭐️ 2. 후면 카메라일 때는 정상적으로 그림
  //         context.drawImage(video, 0, 0, canvas.width, canvas.height);
  //       }
  //     }

  //     const imageDataUrl = canvas.toDataURL("image/png");
  //     onCapture(imageDataUrl);
  //     stopCamera();
  //   }
  // };

  const takeSnapshot = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const vw = video.videoWidth;
      const vh = video.videoHeight;

      // 🔑 미리보기와 동일한 비율 (aspect-3/4)
      const targetAspect = 3 / 4;
      const videoAspect = vw / vh;

      let sx = 0, sy = 0, sw = vw, sh = vh;

      // object-cover와 동일한 crop 계산
      if (videoAspect > targetAspect) {
        // 비디오가 더 넓음 → 좌우 crop
        sw = vh * targetAspect;
        sx = (vw - sw) / 2;
      } else {
        // 비디오가 더 세로로 김 → 상하 crop
        sh = vw / targetAspect;
        sy = (vh - sh) / 2;
      }

      canvas.width = sw;
      canvas.height = sh;

      // 전면 카메라 좌우 반전 처리
      if (facingMode === "user") {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
          video,
          sx, sy, sw, sh,
          -sw, 0, sw, sh
        );
        ctx.restore();
      } else {
        ctx.drawImage(
          video,
          sx, sy, sw, sh,
          0, 0, sw, sh
        );
      }

      const imageDataUrl = canvas.toDataURL("image/png");
      onCapture(imageDataUrl);
      stopCamera();
    };

  // 카메라 전환 함수
  const toggleFacingMode = () => {
    // 현재 facingMode가 "user"면 "environment"로, 아니면 "user"로 변경
    const newMode = facingMode === "user" ? "environment" : "user";
    startCamera(newMode); // 새 모드로 카메라 시작
  };

  // '컴포넌트 정리' 함수
  useEffect(() => {
    return () => {
      if (isCameraOn) {
        stopCamera();
      }
    };
  }, [isCameraOn]);

  return (
    <div className="w-full p-4 bg-app-bg-secondary">
      <Card className="mobile-container">
        <canvas ref={canvasRef} className="hidden" />

        <div className="relative w-full aspect-3/4">
          <video
            ref={videoRef}
            className={`w-full h-full absolute top-0 left-0 object-cover${
              !isCameraOn ? "hidden" : ""
            }
                        ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            autoPlay
            playsInline
            muted
          />
          {!isCameraOn && (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-200">
              <IoCameraOutline size={48} className="mb-2 opacity-50" />
              <span className="text-sm font-medium">카메라가 꺼져있습니다</span>
            </div>
          )}
        </div>
      </Card>
      <div className="flex justify-center mt-6 w-full max-w-md mx-auto">
        {isCameraOn ? (
          <div className="flex items-center justify-between w-full gap-3">
            {/* 1. 전환 버튼 (Secondary Style) */}
            <button
              onClick={toggleFacingMode}
              className="flex-1 py-4 
                         bg-[#F5EFE6] text-[#56412C] 
                         font-semibold rounded-2xl shadow-sm
                         hover:bg-[#EADCC7] transition-all flex items-center justify-center gap-2"
            >
              <IoCameraReverseOutline size={20} />
              전환
            </button>

            {/* 2. 촬영 버튼 (Primary Style - 가장 강조) */}
            <button
              onClick={takeSnapshot}
              className="flex-[1.5] py-4
                         bg-app-bg-tertiary text-white 
                         font-bold rounded-2xl shadow-lg 
                         hover:bg-[#3E2E1E] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <IoRadioButtonOn size={20} />
              촬영
            </button>

            {/* 3. 중지 버튼 (Secondary Style) */}
            <button
              onClick={stopCamera}
              className="flex-1 py-4 
                         bg-[#F5EFE6] text-[#56412C] 
                         font-semibold rounded-2xl shadow-sm
                         hover:bg-[#EADCC7] transition-all flex items-center justify-center gap-2"
            >
              <IoStopCircleOutline size={22} />
              중지
            </button>
          </div>
        ) : (
          // 4. 카메라 켜기 (Primary Style)
          <button
            onClick={() => startCamera()}
            className="w-full max-w-xs py-4 
                       bg-app-bg-tertiary text-white 
                       font-bold rounded-2xl shadow-lg 
                       hover:bg-[#3E2E1E] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            카메라 켜기
          </button>
        )}
      </div>
    </div>
  );
}
