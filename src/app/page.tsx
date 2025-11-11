// app/page.tsx
"use client";

import { useState } from "react";

// 1. ⭐️ 3개의 부품을 모두 가져옵니다.
import WebCamera from "../components/WebCamera";
import PhotoUploader from "../components/PhotoUploader"; // 👈 새로 추가
import FaceMeshProcessor from "../components/FaceMeshProcessor";

export default function HomePage() {
  // 2. ⭐️ 부모가 '찍힌/선택된 사진'을 관리 (이전과 동일)
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center bg-app-bg pb-16">
      {/* 3. ⭐️ (수정됨) '사진이 없을 때' -> '선택 화면'을 보여줌 */}
      {!capturedImage && (
        <div className="w-full">
          {/* 4. ⭐️ 옵션 1: 카메라 */}
          <WebCamera onCapture={setCapturedImage} />

          {/* 5. ⭐️ 구분선 */}
          <div className="text-center my-4">또는</div>

          {/* 6. ⭐️ 옵션 2: 갤러리 (새로 추가) */}
          <PhotoUploader onCapture={setCapturedImage} />
        </div>
      )}
      {/* 7. ⭐️ (동일함) '사진이 있을 때' -> '분석 화면'을 보여줌 */}
      {capturedImage && (
        <FaceMeshProcessor
          imageSrc={capturedImage}
          onRetake={() => setCapturedImage(null)} // '다시 찍기'를 누르면 state를 null로
        />
      )}
    </main>
  );
}
