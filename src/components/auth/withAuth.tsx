"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner"; // 로딩 스피너 import

// ⭐️ 어떤 컴포넌트(Component)를 받아서, 기능이 추가된 새 컴포넌트를 반환합니다.
export default function withAuth(Component: React.ComponentType<any>) {
  return function ProtectedComponent(props: any) {
    const { token, isInitialized } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // ⭐️ 토큰이 없으면 로그인 화면('/')으로 강제 이동
      if (isInitialized && !token) {
        router.replace("/");
      }
    }, [token, router, isInitialized]);
    if (!isInitialized) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[--color-app-bg]">
          <LoadingSpinner />
        </div>
      );
    }
    // ⭐️ 토큰이 없으면(검사 중이거나 비로그인), 화면을 아예 그리지 않음 (깜빡임 방지)
    if (!token) {
      return null;
    }

    // ⭐️ 토큰이 있으면, 원래 보여주려던 컴포넌트를 그대로 보여줌
    return <Component {...props} />;
  };
}
