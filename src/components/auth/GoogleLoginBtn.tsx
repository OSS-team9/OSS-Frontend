// src/components/auth/GoogleLoginBtn.tsx
"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";

interface GoogleLoginBtnProps {
  onSuccess: (credentialResponse: any) => void;
  onError?: () => void;
  text?: string;
  className?: string;
}

export default function GoogleLoginBtn({
  onSuccess,
  onError,
  text = "Google 계정으로 계속하기",
  className = "",
}: GoogleLoginBtnProps) {
  // ⭐️ [추가] OS 판별 상태 (Android일 경우 true)
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // 클라이언트 측에서만 실행
    // User Agent 문자열에 'Android'가 포함되어 있는지 확인
    const isAndroidDevice = /Android/i.test(navigator.userAgent);
    setIsAndroid(isAndroidDevice);
  }, []);

  // ----------------------------------------------------
  // ⭐️ 1. Android일 경우: 공식 버튼 렌더링 (안정성 확보)
  // ----------------------------------------------------
  if (isAndroid) {
    return (
      <div className={`w-full flex justify-center max-w-[320px] ${className}`}>
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          theme="filled_black" // 깔끔한 검정 테마
          shape="pill"
          text="signin_with"
          width="320" // 너비를 꽉 채워서 보여줍니다.
          // Android에서 공식 버튼이 안정적으로 작동하도록 설정
          useOneTap={false}
          ux_mode="popup"
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // ⭐️ 2. iOS/PC일 경우: 커스텀 버튼 (디자인 유지 및 투명 오버레이)
  // ----------------------------------------------------
  return (
    // relative 컨테이너 (iOS/PC에서 사용)
    <div className={`relative w-full max-w-[320px] ${className}`}>
      {/* 2. 🎨 커스텀 디자인 (보여주기용 - pointer-events-none으로 클릭 무시) */}
      <div className="flex items-center justify-center w-full py-3.5 bg-[#1a1a1a] text-white font-bold rounded-full gap-3 shadow-md pointer-events-none">
        {/* 구글 로고 SVG */}
        <svg
          className="w-5 h-5 bg-white rounded-full p-0.5"
          viewBox="0 0 24 24"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>{text}</span>
      </div>

      {/* 3. 👻 투명 공식 버튼 (iOS/PC에서 클릭 이벤트를 받는 레이어) */}
      <div className="absolute inset-0 opacity-0 z-10 overflow-hidden rounded-full">
        <div className="w-full h-full flex items-center justify-center">
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            size="large"
            theme="filled_black"
            shape="pill"
            // width, text 속성 제거 (터치 영역 확보 위함)
            useOneTap={false}
            ux_mode="popup"
          />
        </div>
      </div>
    </div>
  );
}
