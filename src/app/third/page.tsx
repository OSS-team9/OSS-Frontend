"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/components/auth/AuthContext";

export default function LoginPage() {
  // 전역 저장소(AuthContext)에서 'token'과 'login/logout' 함수를 가져옴
  const { token, login, logout } = useAuth();

  // 3. API 테스트 결과를 보여줄 state
  const [userInfo, setUserInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // Google 팝업 로그인을 성공했을 때
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError(null);
    setUserInfo(null);

    // 구글이 준 1회용 토큰(google_token)
    const googleToken = credentialResponse.credential;

    if (!googleToken) {
      setError("구글 토큰을 받지 못했습니다.");
      setIsLoading(false);
      return;
    }

    try {
      // 우리 백엔드 서버에 google_token 전송
      // (환경 변수에서 API 주소를 불러옴)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/login/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ google_token: googleToken }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "서버 로그인 실패");

      // 우리 서버가 준 'access_token'을 전역 저장소에 저장!
      login(data.access_token);
      console.log("서버 로그인 성공, 토큰 저장 완료.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 8. 'GET /protected' API 호출
  const fetchProtectedData = async () => {
    setIsLoading(true);
    setError(null);
    setUserInfo(null);

    if (!token) {
      setError("로그인 토큰이 없습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/protected`,
        {
          method: "GET",
          headers: {
            // 헤더에 우리 서버가 준 토큰(JWT) 싣기
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "인증 실패");

      // API 명세서대로 `logged_in_as` 필드를 표시
      setUserInfo(`인증 성공: ${data.logged_in_as}`);
    } catch (err: any) {
      setError(err.message);
      // 토큰 만료 시 자동 로그아웃 (API 명세서의 에러 메시지 활용)
      if (
        err.message.includes("Token has expired") ||
        err.message.includes("Invalid")
      ) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">마이페이지</h1>

      <div className="mt-6 p-4 bg-white rounded-lg shadow">
        {isLoading && <p>로딩 중...</p>}

        {/* 토큰이 '있는' 경우 (로그인 됨) */}
        {token ? (
          <div>
            <p className="font-semibold text-green-600">로그인 상태입니다.</p>
            <button
              onClick={fetchProtectedData}
              className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              disabled={isLoading}
            >
              보호된 API 테스트 (GET /protected)
            </button>
            <button
              onClick={logout}
              className="mt-4 w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              로그아웃
            </button>
          </div>
        ) : (
          //  토큰이 '없는' 경우 (로그인 필요)
          <div className="text-center">
            <p className="mb-4">로그인이 필요합니다.</p>
            {/* 이 버튼이 구글 팝업을 띄웁니다 */}
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("구글 로그인 실패")}
            />
          </div>
        )}

        {/* 에러 또는 성공 메시지 표시 */}
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {userInfo && <p className="mt-4 text-green-500">{userInfo}</p>}
      </div>
    </div>
  );
}
