// app/page.tsx

// 1. 방금 만든 'WebCamera' 부품을 가져옵니다.
//    '@/'는 'today-haru' 프로젝트의 최상단 폴더를 의미하는 약속입니다.
import WebCamera from '@/components/WebCamera';

export default function HomePage() {
  return (
    // 2. 메인 페이지의 전체 레이아웃 (모바일 화면처럼 보이게)
    <main className="flex min-h-screen flex-col items-center bg-gray-100 p-4">
      
      {/* 3. 상단 헤더 */}
      <header className="w-full max-w-md mb-4">
        <h1 className="text-3xl font-bold text-center text-blue-600">
          Today-Haru 카메라
        </h1>
      </header>

      {/* 4. 여기에 방금 만든 카메라 부품(<WebCamera />)을 끼워넣습니다! */}
      <WebCamera />

      {/* 5. 하단 설명 (옵션) */}
      <p className="mt-4 text-sm text-gray-600 text-center">
        카메라 기능을 테스트합니다.
      </p>
    </main>
  );
}