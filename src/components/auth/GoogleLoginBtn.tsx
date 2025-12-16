"use client";

import { GoogleLogin } from "@react-oauth/google";

interface GoogleLoginBtnProps {
  onSuccess: (credentialResponse: any) => void; // 타입 변경 (tokenResponse -> credentialResponse)
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
  return (
    // 1. 버튼 전체를 감싸는 상대 위치 컨테이너
    <div className={`relative w-full max-w-[320px] ${className}`}>
      {/* 2. 🎨 예쁜 커스텀 디자인 (보여주기용 - 클릭 안 됨) */}
      <div className="flex items-center justify-center w-full py-3.5 bg-[#1a1a1a] text-white font-bold rounded-full gap-3 pointer-events-none">
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

      {/* 3. 👻 실제 기능: 투명한 공식 버튼 (위로 덮어씌움) */}
      <div className="absolute inset-0 opacity-0 z-10 overflow-hidden rounded-full">
        <div className="w-full h-full">
          <GoogleLogin
            onSuccess={onSuccess}
            onError={() => {
              console.error("Login Failed");
              if (onError) onError();
            }}
            size="large"
            useOneTap={false}
            ux_mode="popup"
          />
        </div>
      </div>
    </div>
  );
}
