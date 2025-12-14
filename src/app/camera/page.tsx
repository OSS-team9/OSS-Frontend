// src/app/camera/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/components/auth/AuthContext";
import { IoClose } from "react-icons/io5";
import { toKoreanEmotion } from "@/utils/emotionUtils";
import { dataURLtoFile } from "@/utils/fileUtils";

import WebCamera from "@/components/camera/WebCamera";
import PhotoUploader from "@/components/camera/PhotoUploader";
// import FaceMeshProcessor from "@/components/camera/FaceMeshProcessor";
import { useEmotion } from "@/components/auth/EmotionContext";
import SaveSuccessModal from "@/components/camera/SaveSuccessModal";
import LoginRequestModal from "@/components/auth/LoginRequestModal";
import Toast from "@/components/common/Toast";

import dynamic from "next/dynamic";

const FaceMeshProcessor = dynamic(
  () => import("@/components/camera/FaceMeshProcessor"),
  { ssr: false }
);

export default function CameraPage() {
  const router = useRouter();
  const { token, login, authFetch } = useAuth();
  const { invalidateCache } = useEmotion();

  // 1. 상태 관리 (단순화: tempImage 유무로 화면 전환)
  const [tempImage, setTempImage] = useState<string | null>(null);

  // 2. 데이터 저장을 위한 임시 상태
  const [analyzedResult, setAnalyzedResult] = useState<{
    emotion: string;
    level: number;
  } | null>(null);
  const [finalProcessedImage, setFinalProcessedImage] = useState<string | null>(
    null
  );

  // 모달 상태 관리
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Toast 상태 추가
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  // 3. 촬영/업로드 완료 핸들러
  const handleCapture = (imageSrc: string) => {
    setTempImage(imageSrc);
    setIsLoginModalOpen(false);
  };

  // 4. 분석 완료 핸들러 (기능 유지)
  const handleAnalysisComplete = (
    emotion: string,
    level: number,
    processedImage: string
  ) => {
    setAnalyzedResult({ emotion, level });
    setFinalProcessedImage(processedImage);
    if (!token) {
      setTimeout(() => setIsLoginModalOpen(true), 1500);
    }
  };

  // 5. 저장 및 이동 함수
  const saveAndRedirect = async (
    userToken: string,
    emotionEn: string,
    level: number,
    imageToUpload?: string,
    manualToken?: string,
    showModal: boolean = true
  ) => {
    setIsSaving(true);
    try {
      const emotionKo = toKoreanEmotion(emotionEn); // joy -> 기쁨
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const today = new Date(now.getTime() - offset)
        .toISOString()
        .split("T")[0];

      // 1. ⭐️ FormData 생성
      const formData = new FormData();
      formData.append("date", today);
      formData.append("emotion", emotionKo);
      formData.append("intensity", level.toString());

      // ⭐️ 저장할 이미지 처리 (인자로 받은 것 우선, 없으면 state, 없으면 원본)
      const targetImage = imageToUpload || finalProcessedImage || tempImage;

      if (targetImage) {
        let imageFile: File;

        if (targetImage.startsWith("data:")) {
          // Base64 (FaceMesh 결과 등)
          imageFile = dataURLtoFile(targetImage, `emotion_${today}.png`);
        } else {
          // Blob URL (갤러리 원본 등)
          const response = await fetch(targetImage);
          const blob = await response.blob();
          const mimeType = blob.type || "image/png";
          const extension = mimeType.split("/")[1] || "png";
          imageFile = new File([blob], `emotion_${today}.${extension}`, {
            type: mimeType,
          });
        }

        formData.append("image", imageFile);
      }

      // 3. API 요청 (Content-Type 헤더 제거 필수!)
      let response;

      if (manualToken) {
        // [Case A] 방금 로그인 함 -> 수동 fetch (새 토큰 사용)
        response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/emotions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${manualToken}`,
          },
          body: formData,
        });
      } else {
        response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/emotions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "저장 실패");
      }

      console.log("서버 저장 완료");
      invalidateCache();

      setIsSaving(false);

      if (showModal) {
        // [Case A] 일반 저장 -> 성공 모달 띄움
        setIsSaveSuccess(true);
      } else {
        // [Case B] 로그인 후 저장 -> 토스트 띄우고 메인으로 이동
        setToastMessage("저장이 완료되었습니다!");
        setIsToastVisible(true);

        // 1.5초 뒤 메인으로 이동 (토스트 보여줄 시간 확보)
        setTimeout(() => {
          router.push("/main");
        }, 1500);
      }
    } catch (e) {
      console.error(e);
      alert("저장 중 오류가 발생했습니다.");
      setIsSaving(false);
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

      // 1. 앱 로그인 상태 업데이트
      login(data.access_token);

      // 2. ⭐️ 로그인 모달을 '먼저' 확실하게 닫음
      setIsLoginModalOpen(false);

      // 3. 분석 결과가 있으면 저장 진행
      if (analyzedResult) {
        // 약간의 텀을 주어 모달이 닫힌 후 저장이 시작되는 느낌을 줌 (선택사항이나 UX상 좋음)
        await saveAndRedirect(
          data.access_token,
          analyzedResult.emotion,
          analyzedResult.level,
          finalProcessedImage || undefined,
          data.access_token,
          false
        );
      }
    } catch (err) {
      console.error(err);
      alert("로그인 실패");
    }
  };

  // 7. 사용자가 '저장하기' 버튼을 눌렀을 때 실행되는 함수
  const handleSaveAction = () => {
    if (!token) {
      setIsLoginModalOpen(true);
      return;
    } else {
      // 로그인 했으면 저장하고 이동
      if (analyzedResult) {
        saveAndRedirect(token, analyzedResult.emotion, analyzedResult.level);
      }
    }
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
        <div className="w-full max-w-md">
          <FaceMeshProcessor
            imageSrc={tempImage}
            onRetake={() => {
              setTempImage(null);
              setIsLoginModalOpen(false);
            }}
            onAnalysisComplete={handleAnalysisComplete}
            isLoggedIn={!!token}
            onSaveRequest={handleSaveAction}
            isSaving={isSaving}
          />
        </div>
      )}
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />

      {/* 👇 1. 로그인 유도 모달 (GoogleLogin 핸들러 연결) */}
      {isLoginModalOpen && (
        <LoginRequestModal
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          onLoginError={() => alert("로그인 실패")}
        />
      )}

      {/* 👇 2. 저장 완료 모달 */}
      {isSaveSuccess && (
        <SaveSuccessModal onClose={() => router.push("/main")} />
      )}
    </main>
  );
}
