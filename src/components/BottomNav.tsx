"use client";

import Link from 'next/link';
// ⭐️ (중요) 현재 경로를 알아내기 위해 'next/navigation'을 씁니다.
import { usePathname } from 'next/navigation';

import { 
  HiHome,                // 🏠 (Solid)
  HiOutlineHome,         // 🏠 (Outline)
  HiPlusCircle,          // ➕ (Solid)
  HiOutlinePlusCircle,   // ➕ (Outline)
  HiUser,                // 👤 (Solid)
  HiOutlineUser          // 👤 (Outline)
} from 'react-icons/hi2';


export default function BottomNav() {
  const pathname = usePathname(); // 훅을 사용해 현재 URL 경로를 가져옵니다. (예: "/")
  const iconWrapperStyle = "flex items-center justify-center w-10 h-10 bg-app-bg rounded-2xl";
  const iconStyle = "w-7 h-7";
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-app-bg-secondary">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        
        {/* 2. ⭐️ 'Link' 태그로 각 페이지를 연결합니다. */}
        {/* 3. ⭐️ 현재 페이지(pathname)와 링크(href)가 일치하면 
             'text-blue-600'(파란색)을, 아니면 'text-gray-500'(회색)을 줍니다.
        */}
        <Link href="/" className={iconWrapperStyle}>
          {pathname === '/' ? (
            <HiHome className={`${iconStyle} text-black`} /> // 활성 (Solid + 검은색)
          ) : (
            <HiOutlineHome className={`${iconStyle} text-black/60`} /> // 비활성 (Outline + 연한 검은색)
          )}
        </Link>
        
        <Link 
          href="/second" className={iconWrapperStyle}>
          {pathname === '/second' ? (
            <HiPlusCircle className={`${iconStyle} text-black`} />
          ) : (
            <HiOutlinePlusCircle className={`${iconStyle} text-black/60`} />
          )}
        </Link>

        <Link 
          href="/third" className={iconWrapperStyle}>
          {pathname === '/third' ? (
            <HiUser className={`${iconStyle} text-black`} />
          ) : (
            <HiOutlineUser className={`${iconStyle} text-black/60`} />
          )}
        </Link>
        
      </div>
    </nav>
  );
}