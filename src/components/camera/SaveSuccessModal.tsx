"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IoDownloadOutline,
  IoHomeOutline,
  IoCheckmarkCircle,
  IoEllipsisVertical,
} from "react-icons/io5";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface SaveSuccessModalProps {
  onClose: () => void; // 홈으로 이동하는 함수
}

export default function SaveSuccessModal({ onClose }: SaveSuccessModalProps) {
  const { isInstallable, isInstalled, triggerInstall, isIos } = usePWAInstall();

  // 수동 설치 가이드(툴팁)를 보여줄지 여부
  const [showManualGuide, setShowManualGuide] = useState(false);

  const handleInstallClick = async () => {
    if (isIos) {
      alert("브라우저 하단 공유 버튼을 눌러 '홈 화면에 추가'해주세요!");
      return;
    }
    if (isInstallable) {
      const installed = await triggerInstall();
      if (installed) setTimeout(onClose, 1000);
      return;
    }
    setShowManualGuide(true);
  };
  const showInstallButton = !isInstalled;
  // 앱 모드인지 확인 (이미 앱으로 켰으면 버튼 안 보여주기 위해)
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone);

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
          {!isInstalled && "앱을 설치하면 더 편하게 기록할 수 있어요!"}
        </p>

        {/* ⭐️ 수동 설치 가이드 (툴팁) */}
        {showManualGuide && (
          <div className="absolute top-0 left-0 w-full h-full bg-black/90 z-20 flex flex-col items-center justify-center text-white p-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-4">설치 방법</h3>
            <div className="flex flex-col gap-4 text-sm text-left w-full bg-gray-800 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <span>
                  브라우저 우측 상단 <IoEllipsisVertical className="inline" />{" "}
                  메뉴 클릭
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <span className="flex items-center gap-1">
                  <IoDownloadOutline /> <strong>[앱 설치]</strong> 또는
                  <br />
                  <strong>[홈 화면에 추가]</strong> 선택
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowManualGuide(false)}
              className="mt-6 px-6 py-2 border border-white/30 rounded-full text-sm hover:bg-white/10"
            >
              알겠어요
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* 설치 버튼 (이벤트가 없어도 뜸) */}
          {showInstallButton && (
            <button
              onClick={handleInstallClick}
              className="w-full py-4 bg-[#56412C] text-white font-bold rounded-2xl shadow-lg hover:bg-[#3E2E1E] transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <IoDownloadOutline size={20} />
              {isInstallable ? "앱 설치하고 계속하기" : "앱 설치 방법 보기"}
            </button>
          )}

          <button
            onClick={onClose}
            className={`w-full py-4 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2
              ${
                showInstallButton
                  ? "bg-[#F5EFE6] text-[#8D7B68] hover:bg-[#EADCC7]"
                  : "bg-[#56412C] text-white hover:bg-[#3E2E1E] shadow-lg"
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
