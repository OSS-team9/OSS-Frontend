import Link from "next/link";
import { useAuth } from "./AuthContext";

// 부모(ClientLayout)로부터 'isOpen' (열림 상태)과 'onClose' (닫기 함수)를 받음
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { token, logout } = useAuth(); // 인증 상태와 로그아웃 함수

  return (
    // 사이드바 전체 컨테이너 (열려있을 때만 보이도록)
    <div
      className={`fixed inset-0 z-30 transition-all duration-300 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* 어두운 배경 (Backdrop) */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClose} // 배경 클릭 시 닫기
      />

      {/* 실제 메뉴 패널 (왼쪽에서 슬라이드) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl transition-transform duration-300 ${
          isOpen ? "transform translate-x-0" : "transform -translate-x-full"
        }`}
      >
        {/* 메뉴 헤더 */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">메뉴</h2>
        </div>

        {/* 메뉴 링크 */}
        <nav className="p-4">
          <Link
            href="/"
            className="block px-4 py-2 rounded hover:bg-gray-100"
            onClick={onClose} // 링크 클릭 시 닫기
          >
            홈
          </Link>
          <Link
            href="/second"
            className="block px-4 py-2 rounded hover:bg-gray-100"
            onClick={onClose} // 링크 클릭 시 닫기
          >
            마이페이지
          </Link>

          {/* 로그인 상태에 따라 로그아웃 버튼 표시 */}
          {token && (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="block w-full px-4 py-2 mt-4 text-left text-red-600 rounded hover:bg-gray-100"
            >
              로그아웃
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
