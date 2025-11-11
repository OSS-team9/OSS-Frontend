"use client";

import { useState } from "react";
import AppBar from "./AppBar";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // 사이드바 열림/닫힘 '상태'를 여기서 관리
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      {/* AppBar에 '메뉴 열기' 함수를 전달 */}
      <AppBar onMenuToggle={() => setIsMenuOpen(true)} />

      {/* Sidebar에 '열림 상태'와 '메뉴 닫기' 함수를 전달 */}
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* 실제 페이지 내용 */}
      {/* AppBar(h-16)와 BottomNav(h-16)에 가려지지 않게 여백(pt, pb)을 줌 */}
      <main className="pt-16 pb-16">{children}</main>

      {/* 하단 탭 메뉴 */}
      <BottomNav />
    </div>
  );
}
