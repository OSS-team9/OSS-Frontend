"use client";

import { IoPersonCircleOutline, IoClose } from "react-icons/io5";
import GoogleLoginBtn from "@/components/auth/GoogleLoginBtn";
import { useState, useEffect } from "react";

interface LoginRequestModalProps {
  onClose: () => void;
  onLoginSuccess: (credentialResponse: any) => void;
  onLoginError: () => void;
  onGoHome?: () => void;
}

export default function LoginRequestModal({
  onClose,
  onLoginSuccess,
  onLoginError,
  onGoHome,
}: LoginRequestModalProps) {
  const [resetKey, setResetKey] = useState(0);
  useEffect(() => {
    // 모달이 마운트될 때 (isOpen일 때) 이 코드가 실행됩니다.
    setResetKey((prev) => prev + 1);
  }, []); // 의존성 배열을 비워두거나 isOpen 상태를 넣습니다. (여기서는 모달이 마운트될 때만 실행되도록)
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xs rounded-[2rem] p-6 text-center shadow-2xl relative overflow-hidden border-2 border-white">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1"
        >
          <IoClose size={24} />
        </button>

        {/* 아이콘 */}
        <div className="flex justify-center mb-4 mt-2">
          <div className="w-20 h-20 bg-[#FFF8E7] rounded-full flex items-center justify-center text-[#56412C] shadow-inner">
            <IoPersonCircleOutline size={50} />
          </div>
        </div>

        {/* 텍스트 */}
        <h2 className="text-xl font-bold text-[#56412C] mb-2 font-lotte">
          로그인이 필요해요
        </h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          감정을 저장하고 기록을 모으려면
          <br />
          먼저 로그인을 해주세요!
        </p>

        {/* ⭐️ 버튼 그룹: 원래 동작(구글 로그인) 복구 */}
        <div key={resetKey} className="flex flex-col items-center gap-3 w-full">
          <div className="w-full flex justify-center shrink-0">
            <GoogleLoginBtn
              onSuccess={onLoginSuccess}
              onError={onLoginError}
              text="Google 계정으로 로그인"
            />
          </div>

          {/* 취소 버튼 */}
          <button
            onClick={onGoHome || onClose}
            className="text-gray-400 text-xs underline hover:text-gray-600 mt-2"
          >
            저장하지 않고 홈으로 가기
          </button>
        </div>
      </div>
    </div>
  );
}
