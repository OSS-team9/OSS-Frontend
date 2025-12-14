"use client";

import { useRouter, usePathname } from "next/navigation"; // useRouter 추가

import {
  HiHome,
  HiOutlineHome,
  HiPlusCircle,
  HiOutlinePlusCircle,
} from "react-icons/hi2";

import { RiSofaLine, RiSofaFill } from "react-icons/ri";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const iconWrapperStyle =
    "flex items-center justify-center w-full h-full text-app-bg";
  const iconStyle = "w-7 h-7";

  const handleNavClick = (path: string) => {
    if (pathname === path) return;
    router.replace(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-app-bg-tertiary z-[100]">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {/* 1. 메인 탭 */}
        <button
          onClick={() => handleNavClick("/main")}
          className={iconWrapperStyle}
          type="button"
        >
          {pathname === "/main" ? (
            <HiHome className={iconStyle} />
          ) : (
            <HiOutlineHome className={iconStyle} />
          )}
        </button>

        {/* 2. 카메라 탭 */}
        <button
          onClick={() => handleNavClick("/camera")}
          className={iconWrapperStyle}
          type="button"
        >
          {pathname === "/camera" ? (
            <HiPlusCircle className={iconStyle} />
          ) : (
            <HiOutlinePlusCircle className={iconStyle} />
          )}
        </button>

        {/* 3. 무드 라운지 탭 */}
        <button
          onClick={() => handleNavClick("/house")}
          className={iconWrapperStyle}
          type="button"
        >
          {pathname === "/house" ? (
            <RiSofaFill className={iconStyle} />
          ) : (
            <RiSofaLine className={iconStyle} />
          )}
        </button>
      </div>
    </nav>
  );
}
