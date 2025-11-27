"use client";

import { IoClose } from "react-icons/io5";
import { useAuth } from "./AuthContext";
import { GoogleLogin } from "@react-oauth/google";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { token, logout, login } = useAuth();

  // 로그인 핸들러 (비로그인 상태일 때 사용)
  const handleLoginSuccess = async (credentialResponse: any) => {
    // ... (기존 로그인 로직 복사 또는 공통 함수로 분리 추천) ...
    // 편의상 여기선 생략하고 로그만 찍습니다.
    console.log("로그인 성공");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 1. 배경 (클릭 시 닫기) */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 2. 바텀 시트 본문 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full bg-white rounded-t-[2rem] p-6 animate-slide-up shadow-2xl max-w-md mx-auto">
        {/* 닫기 핸들바 (선택사항) */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">내 정보</h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            <IoClose size={24} className="text-gray-600" />
          </button>
        </div>

        {/* 내용 */}
        <div className="flex flex-col gap-4 pb-8">
          {token ? (
            // [로그인 상태]
            <>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <p className="font-bold text-gray-800">로그인된 사용자</p>
                  <p className="text-xs text-gray-500">환영합니다!</p>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition"
              >
                로그아웃
              </button>
            </>
          ) : (
            // [비로그인 상태]
            <>
              <p className="text-center text-gray-500 mb-2">
                로그인이 필요합니다.
              </p>
              <div className="flex justify-center">
                <GoogleLogin onSuccess={handleLoginSuccess} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
