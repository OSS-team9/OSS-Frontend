"use client";

// WebCamera와 '똑같은' props 규격을 사용합니다.
interface PhotoUploaderProps {
  onCapture: (imageSrc: string) => void;
}

export default function PhotoUploader({ onCapture }: PhotoUploaderProps) {
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
    </div>
  );
}
