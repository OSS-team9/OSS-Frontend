"use client";

import { usePathname } from "next/navigation";
import {
  IoPersonOutline,
  IoShareSocialOutline,
  IoBookOutline,
} from "react-icons/io5";

interface AppBarProps {
  onProfileClick: () => void; // ⭐️ 클릭 핸들러 추가
}

export default function AppBar({ onProfileClick }: AppBarProps) {
  const pathname = usePathname();

  // 1. 현재 페이지 상태 확인
  const isHousePage = pathname === "/house";
  const isMainPage = pathname === "/main";

  return (
    <header className="fixed top-0 left-0 right-0 z-10 h-16 bg-app-bg-tertiary">
      <div className="flex items-center justify-between h-full max-w-md px-6 mx-auto">
        {/* 1. 앱 이름 (왼쪽) */}
        <h1 className="text-base font-bold text-app-bg font-lotte">
          오늘:하루
        </h1>

        <div className="flex items-center gap-1">
          {isHousePage && (
            <>
              <button
                className="p-2 -mr-2 rounded-full transition"
                onClick={() => console.log("아카이브 클릭")}
              >
                <IoBookOutline size={24} className="text-app-bg" />
              </button>
            </>
          )}

          {/* 2. 프로필 아이콘 (오른쪽) */}
          {isMainPage && onProfileClick && (
            <button
              onClick={onProfileClick}
              className="p-2 -mr-2 rounded-full transition"
            >
              <IoPersonOutline size={24} className="text-app-bg" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
