"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  HiHome, // 🏠 (Solid)
  HiOutlineHome, // 🏠 (Outline)
  HiPlusCircle, // ➕ (Solid)
  HiOutlinePlusCircle, // ➕ (Outline)
} from "react-icons/hi2";

import { RiSofaLine, RiSofaFill } from "react-icons/ri";

export default function BottomNav() {
  const pathname = usePathname(); // 훅을 사용해 현재 URL 경로를 가져옵니다.
  const iconWrapperStyle =
    "flex items-center justify-center w-10 h-10 text-app-bg";
  const iconStyle = "w-7 h-7";
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-app-bg-tertiary">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {/* 'Link' 태그로 각 페이지를 연결합니다. */}
        <Link href="/main" className={iconWrapperStyle}>
          {pathname === "/main" ? (
            <HiHome className={`${iconStyle} `} /> // 활성 (Solid + 검은색)
          ) : (
            <HiOutlineHome className={`${iconStyle} `} /> // 비활성 (Outline + 연한 검은색)
          )}
        </Link>

        <Link href="/camera" className={iconWrapperStyle}>
          {pathname === "/camera" ? (
            <HiPlusCircle className={`${iconStyle}`} />
          ) : (
            <HiOutlinePlusCircle className={`${iconStyle} `} />
          )}
        </Link>

        <Link href="/house" className={iconWrapperStyle}>
          {pathname === "/house" ? (
            <RiSofaFill className={`${iconStyle} `} />
          ) : (
            <RiSofaLine className={`${iconStyle} `} />
          )}
        </Link>
      </div>
    </nav>
  );
}
