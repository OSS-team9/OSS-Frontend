"use client";

import { useState } from "react";

import WebCamera from "../components/WebCamera";
import PhotoUploader from "../components/PhotoUploader";
import FaceMeshProcessor from "../components/FaceMeshProcessor";

export default function HomePage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center bg-app-bg pb-16">
      {/* '사진이 없을 때' -> '선택 화면'을 보여줌 */}
      {!capturedImage && (
        <div className="w-full">
          {/* 옵션 1: 카메라 */}
          <WebCamera onCapture={setCapturedImage} />

          <div className="text-center my-4">또는</div>

          {/* 옵션 2: 갤러리 */}
          <PhotoUploader onCapture={setCapturedImage} />
        </div>
      )}
      {/* '사진이 있을 때' -> '분석 화면'을 보여줌 */}
      {capturedImage && (
        <FaceMeshProcessor
          imageSrc={capturedImage}
          onRetake={() => setCapturedImage(null)} // '다시 찍기'를 누르면 state를 null로
        />
      )}
    </main>
  );
}
