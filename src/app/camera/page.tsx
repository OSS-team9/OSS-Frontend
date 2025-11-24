// src/app/camera/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/components/AuthContext";
import { IoClose } from "react-icons/io5";

import WebCamera from "@/components/WebCamera";
import PhotoUploader from "@/components/PhotoUploader";
import FaceMeshProcessor from "@/components/FaceMeshProcessor";

export default function CameraPage() {
  const router = useRouter();
  const { token, login } = useAuth();

  // 1. 상태 관리 (단순화: tempImage 유무로 화면 전환)
  const [tempImage, setTempImage] = useState<string | null>(null);

  // 2. 데이터 저장을 위한 임시 상태
  const [analyzedResult, setAnalyzedResult] = useState<{
    emotion: string;
    level: number;
  } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 3. 촬영/업로드 완료 핸들러
  const handleCapture = (imageSrc: string) => {
    setTempImage(imageSrc);
    setShowLoginModal(false);
  };

  // 4. 분석 완료 핸들러 (기능 유지)
  const handleAnalysisComplete = (emotion: string, level: number) => {
    setAnalyzedResult({ emotion, level });

    if (!token) {
      // 비로그인: 1초 뒤 로그인 유도 모달
      setTimeout(() => setShowLoginModal(true), 2000);
    } else {
      // 로그인: 바로 저장 및 이동
      saveAndRedirect(token, emotion, level);
    }
  };

  // 5. 저장 및 이동 함수
  const saveAndRedirect = async (
    userToken: string,
    emotion: string,
    level: number
  ) => {
    try {
      // TODO: 실제 서버 전송
      console.log("서버 저장 완료:", { emotion, level });
      alert("저장되었습니다!");
      router.push("/main");
    } catch (e) {
      alert("저장 중 오류 발생");
    }
  };

  // 6. 로그인 성공 핸들러
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

      login(data.access_token);

      if (analyzedResult) {
        saveAndRedirect(
          data.access_token,
          analyzedResult.emotion,
          analyzedResult.level
        );
      }
    } catch (err) {
      console.error(err);
      alert("로그인 실패");
    }
  };

  const handleModalClose = () => {
    setShowLoginModal(false);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-app-bg pb-16">
      {!tempImage && (
        <div className="w-full max-w-md">
          <WebCamera onCapture={handleCapture} />
          <div className="text-center my-4 text-black/60">또는</div>
          <PhotoUploader onCapture={handleCapture} />
        </div>
      )}

      {tempImage && (
        <>
          <div className="w-full max-w-md">
            <FaceMeshProcessor
              imageSrc={tempImage}
              onRetake={() => {
                setTempImage(null);
                setShowLoginModal(false);
              }}
              onAnalysisComplete={handleAnalysisComplete}
            />
          </div>

          {/* 로그인 유도 모달 */}
          {showLoginModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm w-screen h-screen">
              <div className="bg-white p-6 rounded-2xl shadow-2xl text-center w-full max-w-xs border-2 border-white relative m-4">
                {/* ⭐️ X 버튼: 이제 모달만 닫습니다 */}
                <button
                  onClick={handleModalClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label="닫기"
                >
                  <IoClose size={24} />
                </button>

                <div className="text-4xl mb-3 mt-2">💾</div>
                <h3 className="text-xl font-bold text-black mb-2">
                  결과를 저장할까요?
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  로그인하면 분석된 감정 기록을
                  <br />
                  언제든 다시 볼 수 있어요.
                </p>

                <div className="flex justify-center mb-3">
                  <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={() => alert("로그인 실패")}
                    theme="filled_black"
                    shape="pill"
                    text="signin_with"
                    width="240"
                  />
                </div>

                {/* ⭐️ 하단 버튼: 홈으로 이동 */}
                <button
                  onClick={handleGoHome}
                  className="text-gray-400 text-xs underline hover:text-gray-600"
                >
                  저장하지 않고 홈으로 가기
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
