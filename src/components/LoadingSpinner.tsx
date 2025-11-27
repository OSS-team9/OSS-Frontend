export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-64 w-full">
      {/* 1. ⭐️ 나중에 여기에 Lottie 컴포넌트를 넣으면 됩니다. */}
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>

      <p className="text-gray-500 text-sm animate-pulse">
        오늘의 감정을 불러오는 중...
      </p>
    </div>
  );
}
