// src/components/ClientLayout.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext"; // ⭐️ 로그인 상태 확인
import AppBar from "./AppBar";
import BottomNav from "./BottomNav";
import ProfileModal from "./ProfileModal";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { token } = useAuth(); // ⭐️ 토큰 가져오기

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 1. ⭐️ 무조건 숨길 경로 (랜딩 페이지)
  const alwaysHiddenRoutes = ["/"];

  // 2. ⭐️ 조건부 숨김 (카메라 페이지는 비로그인(체험) 상태일 때만 숨김)
  const isCameraHidden = pathname === "/camera" && !token;

  // 3. 최종 숨김 여부 결정
  const isHidden = alwaysHiddenRoutes.includes(pathname) || isCameraHidden;

  return (
    <div className="relative min-h-screen bg-[--color-app-bg]">
      {/* ⭐️ isHidden이 false일 때만 AppBar 표시 */}
      {/* AppBar */}
      {!isHidden && <AppBar onProfileClick={() => setIsProfileOpen(true)} />}

      {/* 메인 콘텐츠 */}
      <main className={isHidden ? "" : "pt-16 pb-16"}>{children}</main>

      {/* BottomNav */}
      {!isHidden && <BottomNav />}

      {/* ⭐️ 프로필 모달 */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
