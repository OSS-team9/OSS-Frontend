import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// 구글 로그인
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/components/auth/AuthContext";
import { EmotionProvider } from "@/components/auth/EmotionContext";

import ClientLayout from "@/components/layout/ClientLayout";

const lotteFont = localFont({
  src: "../../public/fonts/SEOLLEIMcool.woff2",
  variable: "--font-lotte",
  display: "swap",
});

const pretendard = localFont({
  src: [
    {
      path: "../../public/fonts/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Pretendard-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
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
    <html lang="ko" className={`${pretendard.variable} ${lotteFont.variable}`}>
      <body className={pretendard.className}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <EmotionProvider>
              <ClientLayout>{children}</ClientLayout>
            </EmotionProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
