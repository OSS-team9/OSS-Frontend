// app/page.tsx
// 1. ⭐️ "use client"가 필수입니다.
//    (state를 가져야 하는 부모 컴포넌트가 되었기 때문)
"use client";

import { useState } from 'react';
// 2. ⭐️ 두 개의 부품을 모두 가져옵니다.
import WebCamera from "@/components/WebCamera";
import FaceMeshProcessor from "@/components/FaceMeshProcessor";

export default function HomePage() {
  // 3. ⭐️ '찍힌 사진' state를 부모(page.tsx)가 직접 관리합니다.
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  return (
    // 'pb-16' (하단 탭 메뉴가 있을 경우)
    <main className="flex min-h-screen flex-col items-center bg-gray-100 p-4 pb-16">
      
      <header className="w-full max-w-md mb-4">
        <h1 className="text-3xl font-bold text-center text-blue-600">
          FaceMesh 카메라
        </h1>
      </header>

      {/* 4. ⭐️ '찍힌 사진'이 없는 경우: */}
      {!capturedImage && (
        // WebCamera 부품을 렌더링하고,
        // onCapture라는 '명령(함수)'을 props로 내려줍니다.
        <WebCamera onCapture={setCapturedImage} />
      )}

      {/* 5. ⭐️ '찍힌 사진'이 있는 경우: */}
      {capturedImage && (
        // FaceMeshProcessor 부품을 렌더링하고,
        // imageSrc라는 '데이터'와
        // onRetake라는 '명령(함수)'을 props로 내려줍니다.
        <FaceMeshProcessor 
          imageSrc={capturedImage} 
          onRetake={() => setCapturedImage(null)} // '다시 찍기'를 누르면 state를 null로
        />
      )}
    </main>
  );
}