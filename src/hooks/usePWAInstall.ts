import { useState, useEffect } from "react";

let deferredPrompt: any = null;

export const usePWAInstall = () => {
  const [isInstallable, setIsInstallable] = useState(false); // 네이티브 팝업 가능 여부
  const [isInstalled, setIsInstalled] = useState(false); // 앱 설치 여부
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 1. 스탠드얼론(앱) 모드인지 확인
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    setIsInstalled(isStandalone);

    // 2. 이미 잡힌 이벤트 확인
    if (deferredPrompt) {
      setIsInstallable(true);
    }

    // 3. 이벤트 리스너
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      deferredPrompt = e;
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      deferredPrompt = null;
      setIsInstallable(false);
      setIsInstalled(true);
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
    // 이벤트가 없으면 false 리턴 (수동 가이드 필요)
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      deferredPrompt = null;
      setIsInstallable(false);
      return true;
    }
    return false;
  };

  return { isInstallable, isInstalled, triggerInstall, isIos };
};
