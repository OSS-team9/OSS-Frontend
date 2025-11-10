import localFont from 'next/font/local';

const lotteFont = localFont({
  src: '../../public/fonts/SEOLLEIMcool.woff2',
  weight: '600',
  display: 'swap',
});

interface AppBarProps {
  onMenuToggle: () => void;
}

export default function AppBar({ onMenuToggle }: AppBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 h-16 bg-app-bg">
      
      <div className="flex items-center justify-start h-full max-w-md px-4 mx-auto">  
        {/*  햄버거 버튼 (왼쪽) */}
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-full hover:bg-black/10 focus:outline-none"
          aria-label="메뉴 열기"
        >
          <svg
            className="w-6 h-6 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.svg.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <h1 className={`text-base text-black ${lotteFont.className} ml-4`}>
            오늘:하루
        </h1>
        
        <div className="w-6" />
      </div>
    </header>
  );
}