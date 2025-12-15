"use client";

import { useState, useEffect } from "react";
import { usePWA } from "@/context/PWAContext"; // ⭐️ Context 훅 사용
import { IoPhonePortraitOutline, IoChevronForward } from "react-icons/io5";

export default function InstallBanner() {
  // ⭐️ Context에서 전역으로 관리되는 이벤트 가져오기
  const { deferredPrompt, setDeferredPrompt } = usePWA();

  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // 1. 현재 앱으로 실행 중인지 확인
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;

    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    // 2. iOS 환경 확인
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    setIsVisible(true);

    // 4. 설치 완료 이벤트 감지 (추가 안전장치)
    const handleAppInstalled = () => {
      console.log("앱 설치 완료!");
      setDeferredPrompt(null);
      setIsVisible(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [deferredPrompt]); // deferredPrompt가 업데이트되면 실행됨

  const handleInstallClick = async () => {
    // iOS 가이드
    if (isIos) {
      alert(
        "브라우저 하단 [공유] 버튼을 누르고 \n'홈 화면에 추가'를 선택해주세요!"
      );
      return;
    }

    // 안드로이드/PC 설치 프롬프트
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    } else {
      // ⭐️ 티켓이 없으면(쿨다운 or 이미 설치됨) -> 안내 메시지 띄움
      alert(
        "브라우저 우측 상단 메뉴(⋮)에서 \n[앱 설치] 또는 [홈 화면에 추가]를 눌러주세요!"
      );
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full max-w-md mx-auto my-4 px-4 animate-fade-in-up">
      <div
        onClick={handleInstallClick}
        className="relative bg-[#56412C] text-[#F5EFE6] rounded-2xl p-5 shadow-lg flex items-center justify-between overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
      >
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        {/* 좌측 정보 */}
        <div className="flex items-center gap-4 z-10">
          <div className="w-10 h-10 bg-[#F5EFE6]/10 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
            <IoPhonePortraitOutline size={20} className="text-[#F5EFE6]" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">
              앱으로 더 편하게 기록해요
            </h3>
            <p className="text-[11px] text-[#F5EFE6]/70 mt-0.5">
              {isIos ? "홈 화면에 추가하기" : "터치해서 바로 설치"}
            </p>
          </div>
        </div>

        {/* 우측 화살표 */}
        <div className="z-10 text-[#F5EFE6]/60">
          <IoChevronForward size={20} />
        </div>
      </div>
    </div>
  );
}
