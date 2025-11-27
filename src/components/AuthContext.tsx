"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

// 인증 상태(토큰)와 함수(login/logout)의 타입을 정의
interface AuthContextType {
  token: string | null; // 우리 서버가 준 access_token
  login: (newToken: string) => void;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 앱을 감싸줄 'Provider' 컴포넌트 생성
export function AuthProvider({ children }: { children: ReactNode }) {
  // 'token' state로 서버 전용 토큰을 관리
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  //   컴포넌트가 '브라우저'에서 처음 실행될 때
  //   localStorage(브라우저 저장소)에서 토큰을 불러와 state에 설정
  useEffect(() => {
    const storedToken = localStorage.getItem("server_token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []); // [] : 맨 처음 1회만 실행

  // 로그인 함수: state와 localStorage에 토큰 저장
  const login = (newToken: string) => {
    localStorage.setItem("server_token", newToken);
    setToken(newToken);
  };

  // 로그아웃 함수: state와 localStorage에서 토큰 제거
  const logout = () => {
    localStorage.removeItem("server_token");
    setToken(null);
    router.push("/");
  };

  const authFetch = async (url: string, options: RequestInit = {}) => {
    // 1. 헤더에 토큰 자동 추가
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    } as HeadersInit;

    // 2. 요청 실행
    const response = await fetch(url, { ...options, headers });

    // 3. ⭐️ 401(만료) 체크: 여기서 전역적으로 가로챕니다!
    if (response.status === 401) {
      console.warn("토큰 만료됨: 자동 로그아웃");
      alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
      logout(); // 👈 여기서 로그아웃 실행!

      // 에러를 던져서 페이지의 try-catch로 넘기되,
      // 이미 로그아웃 되었으므로 페이지는 곧 리디렉션 됩니다.
      throw new Error("Session expired");
    }

    return response;
  };
  // '창고'의 실제 값(토큰, 로그인/로그아웃 함수)을 자식들에게 제공
  return (
    <AuthContext.Provider value={{ token, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // 안전장치
    return {
      token: null,
      login: () => {},
      logout: () => {},
      authFetch: async () => new Response(), // 더미 함수
    };
  }
  return context;
}
