// components/PhotoUploader.tsx
"use client";

import { useState } from "react";

// 1. ⭐️ WebCamera와 '똑같은' props 규격을 사용합니다.
interface PhotoUploaderProps {
  onCapture: (imageSrc: string) => void;
}

export default function PhotoUploader({ onCapture }: PhotoUploaderProps) {
  // 2. ⭐️ 파일이 선택되었을 때 실행될 함수
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 3. ⭐️ (중요) 선택된 'File' 객체를 'Data URL'(문자열)로 변환합니다.
    //    FaceMeshProcessor가 <Image> 태그로 로드할 수 있도록 하기 위함입니다.
    const reader = new FileReader();
    reader.onloadend = () => {
      // 4. ⭐️ 변환이 끝나면, 부모(app/page.tsx)에게 이미지 데이터를 전달합니다.
      onCapture(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full py-6 mx-auto bg-app-bg-secondary">
      <div className="text-center mx-4">
        {/* 5. ⭐️ <label>을 사용해 못생긴 <input> 버튼을 꾸밉니다. */}
        <label
          htmlFor="photo-upload"
          className="cursor-pointer w-80 max-w-xs px-6 py-3 mx-auto 
                     bg-white text-black 
                     rounded-full hover:bg-gray-100 block"
        >
          갤러리에서 사진 선택
        </label>

        {/* 6. ⭐️ 핵심: 'file' 타입의 <input> 태그 */}
        {/* (multiple, capture 속성이 없습니다!) */}
        <input
          id="photo-upload"
          type="file"
          accept="image/*" // 이미지 파일만 받음
          onChange={handleFileChange}
          className="hidden" // 숨김
        />
      </div>
    </div>
  );
}
