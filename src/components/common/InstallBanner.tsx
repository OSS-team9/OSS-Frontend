"use client";

import { useState, useEffect } from "react";
import { IoPhonePortraitOutline, IoChevronForward } from "react-icons/io5";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // 1. 앱으로 실행 중인지 확인 (가장 중요!)
    // window.matchMedia: 안드로이드/PC 표준
    // navigator.standalone: iOS 표준 (legacy)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;

    // 앱으로 실행 중이라면 절대 배너를 띄우지 않고 로직 종료
    if (isStandalone) {
      setIsVisible(false);
      return;
    }

    // 2. iOS 환경 확인
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 3. 설치 이벤트 감지 (안드로이드/PC)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // 브라우저가 "설치 가능해!"라고 신호를 줄 때만 보여줌
      setIsVisible(true);
    };

    // 4. 설치 완료 이벤트 감지 (설치하자마자 배너 사라지게)
    const handleAppInstalled = () => {
      console.log("앱 설치 완료!");
      setDeferredPrompt(null);
      setIsVisible(false); // 즉시 숨김
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // iOS는 beforeinstallprompt가 없으므로 수동으로 표시 (앱 모드가 아닐 때만)
    if (isIosDevice && !isStandalone) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // iOS 가이드
    if (isIos) {
      alert(
        "브라우저 하단 [공유] 버튼을 누르고 \n'홈 화면에 추가'를 선택해주세요!"
      );
      return;
    }

    // 안드로이드 설치 프롬프트
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    // (여기서도 처리하지만, appinstalled 이벤트가 더 확실함)
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  // 렌더링 X 조건
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
