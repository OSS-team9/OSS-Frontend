"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { IoChevronBack, IoShareSocialOutline } from "react-icons/io5";

import withAuth from "@/components/auth/withAuth";
import { useAuth } from "@/components/auth/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { EmotionLog } from "@/types";
import { toEnglishEmotion, toKoreanEmotion } from "@/utils/emotionUtils";
import Card from "@/components/common/BorderCard";
import { getEmotionBgColor } from "@/utils/emotionUtils";
import { useShareAndDownload } from "@/hooks/useShareAndDownload";
import { useEmotion } from "@/components/auth/EmotionContext";

// 날짜 포맷 (예: 11월 04일)
function formatDateForDetail(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return `${month}월 ${day}일`;
}

function CalendarDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dateStr = params.date as string;

  const { token, authFetch } = useAuth();
  const { selectedLog } = useEmotion();

  const [log, setLog] = useState<EmotionLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { shareImage } = useShareAndDownload();

  useEffect(() => {
    if (!token || !dateStr) return;

    const loadData = async () => {
      setIsLoading(true);

      // 1. ⭐️ 메모리(Context)에 데이터가 있고 날짜가 맞으면 바로 사용
      if (selectedLog && selectedLog.date === dateStr) {
        console.log("🚀 메모리 데이터 사용 (서버 요청 X)");
        setLog(selectedLog);
        setIsLoading(false);
        return;
      }

      // 2. 없으면(새로고침 등) 서버 요청
      console.log("🌐 서버에서 데이터를 불러옵니다...");
      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/emotions?start_date=${dateStr}&end_date=${dateStr}`
        );

        if (!response.ok) throw new Error("데이터 로드 실패");
        const json = await response.json();
        const serverData = json.data || [];

        if (serverData.length > 0) {
          const item = serverData[0];
          setLog({
            id: item.id,
            date: item.date,
            emotion: toEnglishEmotion(item.emotion),
            emotionLevel: item.emotionLevel || 1,
            imageUrl: item.imageData || item.imageUrl,
          });
        } else {
          setLog(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token, dateStr, authFetch, selectedLog]);

  const headerDate = dateStr ? formatDateForDetail(dateStr) : "";
  const handleShareClick = async () => {
    if (log?.imageUrl) {
      try {
        // 이미지 URL을 Blob으로 변환
        const response = await fetch(log.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "emotion_result.png", {
          type: "image/png",
        });

        // 공유 함수 호출
        shareImage(file);
      } catch (error) {
        console.error("이미지 변환 실패:", error);
        alert("이미지를 공유할 수 없습니다.");
      }
    }
  };
  return (
    // 1. ⭐️ 배경색 통일 (app-bg)
    <div className="min-h-screen bg-app-bg pt-6 px-4 pb-24">
      {/* 2. ⭐️ 헤더: 뒤로가기 + 날짜 (확실하게 보이도록 수정) */}
      <div className="relative flex items-center justify-center mb-4">
        {/* 뒤로가기 버튼 (왼쪽 절대 위치) */}
        <button
          onClick={() => router.back()}
          className="absolute left-0 p-2 text-black hover:bg-black/5 rounded-full transition-colors"
        >
          <IoChevronBack size={28} />
        </button>

        {/* 날짜 텍스트 (중앙, 폰트 적용) */}
        <span className="text-2xl font-bold text-black font-lotte mt-1">
          {headerDate}
        </span>
      </div>

      {/* 3. 본문 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <LoadingSpinner />
        </div>
      ) : log ? (
        <Card className="p-0 w-full max-w-md mx-auto">
          <div className="flex h-80 bg-white">
            {" "}
            {/* 높이 320px */}
            {/* [왼쪽] 사진 영역 (55%) */}
            <div className="w-[60%] relative bg-gray-200 border-r-4 border-white">
              {log.imageUrl ? (
                <Image
                  src={log.imageUrl}
                  alt="기록된 사진"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <span className="text-4xl mb-2">📷</span>
                  <span className="text-xs">사진 없음</span>
                </div>
              )}
            </div>
            {/* [오른쪽] 정보 영역 (45%) */}
            <div className="w-[40%] flex flex-col justify-between p-3">
              <div className="flex justify-end gap-2"></div>

              {/* 중앙 캐릭터 */}
              <div className="flex flex-col items-center">
                {/* 분홍색 원형 배경 */}
                <div
                  className={`w-20 h-20 rounded-full ${getEmotionBgColor(
                    log.emotion
                  )} flex items-center justify-center mb-2 relative overflow-hidden`}
                >
                  <Image
                    src={`/emotions/${log.emotion}_${log.emotionLevel}.png`}
                    alt={log.emotion}
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-md text-sm">
                  {toKoreanEmotion(log.emotion)}
                </span>
              </div>

              {/* 하단 공유 버튼 */}
              <div className="flex justify-center">
                <button
                  className="p-2 bg-white rounded-full shadow-md text-black active:scale-95 transition"
                  onClick={handleShareClick}
                >
                  <IoShareSocialOutline size={20} />
                </button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="text-center mt-20">
          <p className="text-gray-500 mb-4">이 날의 기록이 없습니다.</p>
          <button
            onClick={() => router.push("/camera")}
            className="text-blue-600 underline font-medium"
          >
            오늘 기록하러 가기
          </button>
        </div>
      )}
    </div>
  );
}

export default withAuth(CalendarDetailPage);
