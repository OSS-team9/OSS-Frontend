"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  HiHome, // 🏠 (Solid)
  HiOutlineHome, // 🏠 (Outline)
  HiPlusCircle, // ➕ (Solid)
  HiOutlinePlusCircle, // ➕ (Outline)
  HiUser, // 👤 (Solid)
  HiOutlineUser, // 👤 (Outline)
} from "react-icons/hi2";

export default function BottomNav() {
  const pathname = usePathname(); // 훅을 사용해 현재 URL 경로를 가져옵니다.
  const iconWrapperStyle =
    "flex items-center justify-center w-10 h-10 bg-app-bg rounded-2xl";
  const iconStyle = "w-7 h-7";
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-app-bg-secondary">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {/* 'Link' 태그로 각 페이지를 연결합니다. */}
        <Link href="/main" className={iconWrapperStyle}>
          {pathname === "/main" ? (
            <HiHome className={`${iconStyle} text-black`} /> // 활성 (Solid + 검은색)
          ) : (
            <HiOutlineHome className={`${iconStyle} text-black/60`} /> // 비활성 (Outline + 연한 검은색)
          )}
        </Link>

        <Link href="/camera" className={iconWrapperStyle}>
          {pathname === "/camera" ? (
            <HiPlusCircle className={`${iconStyle} text-black`} />
          ) : (
            <HiOutlinePlusCircle className={`${iconStyle} text-black/60`} />
          )}
        </Link>

        <Link href="/third" className={iconWrapperStyle}>
          {pathname === "/third" ? (
            <HiUser className={`${iconStyle} text-black`} />
          ) : (
            <HiOutlineUser className={`${iconStyle} text-black/60`} />
          )}
        </Link>
      </div>
    </nav>
  );
}
