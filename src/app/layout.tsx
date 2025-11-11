import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// 구글 로그인
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/components/AuthContext";

import ClientLayout from "@/components/ClientLayout";

const pretendard = localFont({
  src: [
    {
      path: "../../public/fonts/Pretendard-Regular.woff2", // 👈 기본 굵기 (400)
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard-SemiBold.woff2", // 👈 강조 굵기 (600)
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-pretendard", // 3. ⭐️ CSS 변수로 '--font-pretendard'를 지정
  display: "swap",
});

export const metadata: Metadata = {
  title: "오늘:하루",
  description: "Daily의 Emotion을 Face으로 record하다",
  openGraph: {
    title: "오늘:하루",
    description: "Daily의 Emotion을 Face으로 record하다",
    images: [
      {
        url: "https://oss-frontend-red.vercel.app/logo.png",
        width: 800,
        height: 800,
        alt: "오늘하루 프로젝트 로고",
      },
    ],
    url: "https://oss-frontend-red.vercel.app",
    type: "website",
  },
};

// Google Client ID 환경 변수
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className={pretendard.className}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
