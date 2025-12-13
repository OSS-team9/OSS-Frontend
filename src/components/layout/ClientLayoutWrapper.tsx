"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/components/auth/AuthContext";
import { EmotionProvider } from "@/components/auth/EmotionContext";
import ClientLayout from "@/components/layout/ClientLayout";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <EmotionProvider>
          <ClientLayout>{children}</ClientLayout>
        </EmotionProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
