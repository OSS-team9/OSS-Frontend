"use client";

import { useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
import withAuth from "@/components/auth/withAuth";
import EmotionCollection from "@/components/house/EmotionCollection";

function CollectionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-app-bg pt-6 px-4 pb-16">
      {/* 1. 헤더 (닫기 버튼 + 타이틀) */}
      <div className="flex items-center mb-8 relative">
        <button
          onClick={() => router.back()}
          className="text-3xl text-black hover:opacity-70 transition-opacity absolute left-0"
        >
          <IoClose />
        </button>
        <h1 className="w-full text-center text-lg font-bold text-black">
          감정 도감
        </h1>
      </div>

      {/* 2. 도감 리스트 컴포넌트 */}
      <EmotionCollection />
    </div>
  );
}

export default withAuth(CollectionPage);
