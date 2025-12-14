"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IoDownloadOutline,
  IoHomeOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";

interface SaveSuccessModalProps {
  onClose: () => void; // 홈으로 이동하는 함수
}

export default function SaveSuccessModal({ onClose }: SaveSuccessModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. 이미 앱 모드인지 확인
    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    if (isInStandaloneMode) {
      setIsStandalone(true);
    }

    // 2. iOS 확인
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 3. 설치 이벤트 감지
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    // iOS는 설치 버튼 동작 안 함 -> 공유 버튼 안내 띄우거나 바로 홈으로
    if (isIos) {
      alert("브라우저 하단 공유 버튼을 눌러 '홈 화면에 추가'해주세요!");
      return;
    }

    if (!deferredPrompt) {
      // 이미 설치했거나 지원 안 하는 경우 -> 그냥 홈으로
      onClose();
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      // 설치 수락 후 홈으로 이동
      setTimeout(onClose, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl relative overflow-hidden">
        {/* 성공 아이콘 */}
        <div className="flex justify-center mb-4">
          <IoCheckmarkCircle className="text-green-500 text-6xl shadow-sm rounded-full bg-white" />
        </div>

        <h2 className="text-2xl font-bold text-[#56412C] mb-2 font-lotte">
          저장 완료!
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          오늘의 감정이 기록되었습니다.
          <br />
          내일도 잊지 않고 기록해볼까요?
        </p>

        <div className="flex flex-col gap-3">
          {/* ⭐️ 1. 설치 유도 버튼 (앱이 아닐 때만 표시) */}
          {!isStandalone && (
            <button
              onClick={handleInstallClick}
              className="w-full py-4 bg-[#56412C] text-white font-bold rounded-2xl shadow-lg hover:bg-[#3E2E1E] transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <IoDownloadOutline size={20} />
              {isIos ? "앱으로 추가하기" : "앱 설치하고 계속하기"}
            </button>
          )}

          {/* 2. 홈으로 가기 버튼 */}
          <button
            onClick={onClose}
            className={`w-full py-4 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2
              ${
                !isStandalone
                  ? "bg-[#F5EFE6] text-[#8D7B68] hover:bg-[#EADCC7]" // 설치 버튼 있을 땐 보조 버튼 스타일
                  : "bg-[#56412C] text-white hover:bg-[#3E2E1E] shadow-lg" // 설치 버튼 없으면 메인 버튼 스타일
              }`}
          >
            <IoHomeOutline size={18} />
            홈으로 가기
          </button>
        </div>
      </div>
    </div>
  );
}
