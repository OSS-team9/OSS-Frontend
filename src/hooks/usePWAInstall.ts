import { useState, useEffect } from "react";

// ⭐️ 전역 변수: 페이지를 이동해도 '설치 대기 이벤트'와 '설치 완료 여부'를 기억함
let deferredPrompt: any = null;
let hasInstalledInSession = false; // 이번 접속에서 설치를 했는지 여부

export const usePWAInstall = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(hasInstalledInSession); // ⭐️ 설치 완료 상태

  useEffect(() => {
    // 1. iOS 감지
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 2. 이미 이벤트가 잡혀있다면 (다른 페이지에서 옴)
    if (deferredPrompt) {
      setIsInstallable(true);
    }

    // 3. 설치 대기 이벤트 리스너
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      setIsInstallable(true);
      // 이벤트가 새로 발생했다는 건 아직 설치 안 됐다는 뜻 (재설치 등)
      setIsInstalled(false);
      hasInstalledInSession = false;
    };

    // 4. ⭐️ [추가] 설치 완료 이벤트 리스너
    const handleAppInstalled = () => {
      console.log("앱 설치가 완료되었습니다!");
      deferredPrompt = null; // 더 이상 설치할 게 없음
      setIsInstallable(false); // 설치 불가능 상태로 변경
      hasInstalledInSession = true; // "설치했음" 플래그 세움
      setIsInstalled(true); // 상태 업데이트
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (isIos) return "iOS";

    if (!deferredPrompt) return false;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      deferredPrompt = null;
      setIsInstallable(false);
      // 여기서도 true로 해주지만, 확실한 건 appinstalled 이벤트임
      return true;
    }
    return false;
  };

  return { isInstallable, triggerInstall, isIos, isInstalled };
};
