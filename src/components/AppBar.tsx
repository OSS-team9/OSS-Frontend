import localFont from "next/font/local";

interface AppBarProps {
  onMenuToggle: () => void;
}

export default function AppBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 h-16 bg-app-bg-tertiary">
      <div className="flex items-center justify-start h-full max-w-md px-6 mx-auto">
        <h1 className={`text-base text-app-bg font-lotte`}>오늘:하루</h1>

        <div className="w-6" />
      </div>
    </header>
  );
}
