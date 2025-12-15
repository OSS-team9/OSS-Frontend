"use client";

import { useState } from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import PhotoGuideModal from "@/components/common/PhotoGuideModal";

// WebCamera와 '똑같은' props 규격을 사용합니다.
interface PhotoUploaderProps {
  onCapture: (imageSrc: string) => void;
}

export default function PhotoUploader({ onCapture }: PhotoUploaderProps) {
  // 모달 상태 관리 (여기서 직접 관리)
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // 파일이 선택되었을 때 실행될 함수
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    //    선택된 'File' 객체를 'Data URL'(문자열)로 변환합니다.
    //    FaceMeshProcessor가 <Image> 태그로 로드할 수 있도록 하기 위함입니다.
    // const reader = new FileReader();
    // reader.onloadend = () => {
    //   // 변환이 끝나면, 부모(app/page.tsx)에게 이미지 데이터를 전달합니다.
    //   onCapture(reader.result as string);
    // };
    // reader.readAsDataURL(file);
    const blobUrl = URL.createObjectURL(file);
    onCapture(blobUrl);
  };

  return (
    // 1. WebCamera와 동일한 배경색/패딩 제거 (부모 레이아웃 위임)
    <div className="w-full max-w-md mx-auto bg-app-bg-secondary py-6">
      <label
        htmlFor="photo-upload"
        className="cursor-pointer w-full max-w-xs py-4 mx-auto
                   bg-white text-black font-bold 
                   rounded-2xl shadow-lg 
                   hover:bg-[#3E2E1E] hover:text-white hover:-translate-y-0.5 transition-all 
                   flex items-center justify-center gap-2"
      >
        갤러리에서 사진 선택
      </label>

      <input
        id="photo-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => setIsGuideOpen(true)}
        className="mt-4 mx-auto flex items-center gap-1.5 text-white/70 text-xs font-medium hover:text-white hover:underline underline-offset-4 decoration-white/50 transition-all"
      >
        <IoInformationCircleOutline size={16} />{" "}
        {/* 아이콘은 기본이 제일 깔끔 */}
        <span>어떤 사진이 인식이 잘 될까요?</span>
      </button>
      {/* 4. 모달 컴포넌트 렌더링 */}
      <PhotoGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
