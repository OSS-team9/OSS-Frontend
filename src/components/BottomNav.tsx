"use client";

import Link from 'next/link';
// ⭐️ (중요) 현재 경로를 알아내기 위해 'next/navigation'을 씁니다.
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname(); // 훅을 사용해 현재 URL 경로를 가져옵니다. (예: "/")

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        
        {/* 2. ⭐️ 'Link' 태그로 각 페이지를 연결합니다. */}
        {/* 3. ⭐️ 현재 페이지(pathname)와 링크(href)가 일치하면 
             'text-blue-600'(파란색)을, 아니면 'text-gray-500'(회색)을 줍니다.
        */}
        <Link 
          href="/" 
          className={`flex flex-col items-center ${pathname === '/' ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <span>🏠</span>
          <span className="text-xs">홈</span>
        </Link>
        
        <Link 
          href="/second"
          className={`flex flex-col items-center ${pathname === '/second' ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <span>👤</span>
          <span className="text-xs">마이</span>
        </Link>

        <Link 
          href="/third"
          className={`flex flex-col items-center ${pathname === '/third' ? 'text-blue-600' : 'text-gray-500'}`}
        >
          <span>⚙️</span>
          <span className="text-xs">설정</span>
        </Link>
        
      </div>
    </nav>
  );
}