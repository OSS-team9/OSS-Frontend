"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import withAuth from "@/components/auth/withAuth"; // 로그인 보호
import BorderCard from "@/components/common/BorderCard"; // ⭐️ 액자 스타일 재사용
// 1. ⭐️ 스티커 보드 import
import EmotionStickerBoard from "@/components/house/EmotionStickerBoard";

function HousePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-app-bg pt-6 px-4">
      {/* 1. 헤더 */}
      <div className="flex items-center mb-6">
        <h1 className="text-xl font-bold text-black font-lotte pt-1">
          무드 라운지
        </h1>
      </div>

      {/* 2. 메인 이미지 카드 */}
      {/* ⭐️ BorderCard를 사용하여 두꺼운 흰색 테두리와 둥근 모서리 적용 */}
      <BorderCard className="p-0 w-full max-w-md mx-auto shadow-xl">
        {/* 3. 이미지 영역 (세로로 긴 비율: 9:16 적용) */}
        <div className="relative w-full aspect-9/16">
          <Image
            src="/images/mood_room.png" // ⭐️ 파일명 확인!
            alt="Mood Lounge"
            fill
            className="object-cover"
            priority // 중요한 이미지이므로 우선 로딩
          />
        </div>
      </BorderCard>
      <EmotionStickerBoard />
    </div>
  );
}

export default withAuth(HousePage);
