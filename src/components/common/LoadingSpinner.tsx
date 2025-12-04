"use client";

import Lottie from "lottie-react";
import loadingAnimation from "@/lottie/loading.json";

export default function LoadingSpinner() {
  return (
    // 1. ⭐️ h-64 제거 -> h-full로 변경 (부모 크기에 맞춤)
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[150px]">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          autoplay={true}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <p className="text-gray-500 text-sm animate-pulse font-medium mt-4">
        잠시만 기다려주세요...
      </p>
    </div>
  );
}
