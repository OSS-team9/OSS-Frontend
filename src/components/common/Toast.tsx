"use client";

import { useEffect, useState } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      // 2초 뒤에 사라지게 설정
      const timer = setTimeout(() => {
        setShow(false);
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !show) return null;

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 bg-black/80 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <IoCheckmarkCircle className="text-green-400 text-xl" />
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
}
