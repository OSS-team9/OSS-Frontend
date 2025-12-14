"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IoDownloadOutline,
  IoHomeOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface SaveSuccessModalProps {
  onClose: () => void; // 홈으로 이동하는 함수
}

export default function SaveSuccessModal({ onClose }: SaveSuccessModalProps) {
  const { isInstallable, triggerInstall, isIos } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isIos) {
      alert("브라우저 하단 공유 버튼을 눌러 '홈 화면에 추가'해주세요!");
      return;
    }

    const installed = await triggerInstall();
    if (installed) {
      // 설치 완료하면 잠시 뒤 홈으로
      setTimeout(onClose, 1000);
    }
  };

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
          내일도 잊지 않고 기록해볼까요?
        </p>

        <div className="flex flex-col gap-3">
          {/* 설치 가능한 상태이거나 iOS일 때만 버튼 표시 */}
          {/* 이미 앱(Standalone)이면 안 보여줌 */}
          {!isStandalone && (isInstallable || isIos) && (
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
