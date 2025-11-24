// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/components/AuthContext";

export default function LandingPage() {
  const { token, login } = useAuth();
  const router = useRouter();

  // 1. ⭐️ [분기 로직] 토큰이 있으면 -> '/main'으로 자동 이동
  useEffect(() => {
    if (token) {
      router.replace("/main"); // push 대신 replace 사용 (뒤로가기 방지)
    }
  }, [token, router]);

  // 2. 로그인 성공 핸들러
  const handleLoginSuccess = async (credentialResponse: any) => {
    const googleToken = credentialResponse.credential;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/login/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ google_token: googleToken }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      login(data.access_token); // 토큰 저장
      router.push("/main"); // ⭐️ 로그인 성공 시 -> '/main'으로 이동
    } catch (err) {
      console.error("로그인 실패:", err);
      alert("로그인에 실패했습니다.");
    }
  };

  // 3. 체험하기 핸들러
  const handleExperience = () => {
    router.push("/camera"); // ⭐️ 로그인 없이 -> '/camera'로 이동
  };

  // 4. 토큰이 있으면 화면을 그리지 않음 (깜빡임 방지용 null 리턴)
  if (token) return null;

  // 5. ⭐️ [비로그인 화면] 랜딩 페이지 UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[--color-app-bg]">
      {/* 로고 영역 */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold font-lotte text-black mb-2 drop-shadow-sm">
          오늘:하루
        </h1>
        <p className="text-gray-600 text-lg font-medium">
          당신의 하루 감정을 AI로 기록하세요
        </p>
      </div>

      {/* 메인 카드 영역 */}
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-xl border-4 border-white">
        <div className="flex flex-col gap-4">
          {/* A. 구글 로그인 버튼 */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => alert("로그인 실패")}
              theme="filled_black"
              shape="pill"
              size="large"
              text="continue_with"
              width="300"
            />
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs">또는</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* B. 체험하기 버튼 */}
          <button
            onClick={handleExperience}
            className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-all active:scale-95"
          >
            로그인 없이 체험하기
          </button>

          <p className="text-xs text-gray-400 mt-2">
            * 체험하기는 기록이 저장되지 않습니다.
          </p>
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="absolute bottom-8 text-gray-400 text-xs">
        © 2025 Today-Haru. All rights reserved.
      </div>
    </div>
  );
}
