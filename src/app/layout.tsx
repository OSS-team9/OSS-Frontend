import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

// 구글 로그인
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/components/AuthContext";

import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ['latin'] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "오늘:하루",
  description: "Daily의 Emotion을 Face으로 record하다",
  openGraph: {
    title: '오늘:하루',
    description: 'Daily의 Emotion을 Face으로 record하다',
    images: [
      {
        url: 'https://oss-frontend-red.vercel.app/logo.png', 
        width: 800,
        height: 800,
        alt: '오늘하루 프로젝트 로고',
      },
    ],
    url: 'https://oss-frontend-red.vercel.app',
    type: 'website',
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
    <html lang="ko">
      <body className={inter.className}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <ClientLayout>
              {children} 
            </ClientLayout>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
