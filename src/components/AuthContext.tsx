"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

// 인증 상태(토큰)와 함수(login/logout)의 타입을 정의
interface AuthContextType {
  token: string | null; // 우리 서버가 준 access_token
  login: (newToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 앱을 감싸줄 'Provider' 컴포넌트 생성
export function AuthProvider({ children }: { children: ReactNode }) {
  // 'token' state로 서버 전용 토큰을 관리
  const [token, setToken] = useState<string | null>(null);

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
  };

  // '창고'의 실제 값(토큰, 로그인/로그아웃 함수)을 자식들에게 제공
  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 이 '창고'를 쉽게 사용할 수 있게 해주는 'Hook'
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다.");
  }
  return context;
}
