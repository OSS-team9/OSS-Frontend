"use client";

import { IoClose, IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";

interface PhotoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PhotoGuideModal({
  isOpen,
  onClose,
}: PhotoGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      {/* 모달 박스 */}
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative shadow-2xl border-2 border-white">
        {/* 닫기 버튼 (우측 상단) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <IoClose size={24} />
        </button>

        {/* 제목 */}
        <h3 className="text-xl font-bold text-[#56412C] mb-1 font-lotte text-center">
          📸 사진 선택 가이드
        </h3>
        <p className="text-xs text-gray-500 mb-6 text-center">
          예쁜 감정 기록을 위해 꼭 확인해주세요!
        </p>

        {/* O / X 예시 영역 */}
        <div className="flex gap-3 mb-6">
          {/* BAD Case */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full aspect-square bg-red-50 rounded-xl border-2 border-red-200 flex items-center justify-center relative overflow-hidden group">
              {/* ❌ 나중에 실제 '얼빡샷' 이미지가 있다면 <img src="..." />로 교체하세요 */}
              <span className="text-5xl group-hover:scale-110 transition">
                😫
              </span>

              {/* X 마크 오버레이 */}
              <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                <IoCloseCircle size={40} className="text-red-500/80" />
              </div>
            </div>
            <p className="text-xs font-bold text-red-500">얼굴이 너무 커요</p>
          </div>

          {/* GOOD Case */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full aspect-square bg-green-50 rounded-xl border-2 border-green-200 flex items-center justify-center relative overflow-hidden group">
              {/* ⭕️ 나중에 실제 '여백있는' 이미지가 있다면 <img src="..." />로 교체하세요 */}
              <span className="text-5xl group-hover:scale-110 transition">
                🙂
              </span>

              {/* O 마크 오버레이 */}
              <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                <IoCheckmarkCircle size={40} className="text-green-500/80" />
              </div>
            </div>
            <p className="text-xs font-bold text-green-600">여백이 적당해요</p>
          </div>
        </div>

        {/* 설명 리스트 */}
        <div className="bg-[#F5EFE6]/50 p-4 rounded-xl text-left mb-6">
          <ul className="text-xs text-gray-700 space-y-2 list-disc list-inside">
            <li>
              얼굴 주변에{" "}
              <span className="font-bold text-[#56412C]">여백이 있는 사진</span>
              을 골라주세요.
            </li>
            <li>
              얼굴이 너무 꽉 차면{" "}
              <span className="text-red-500">
                감정 스티커가 가려질 수 있어요.
              </span>
            </li>
            <li>밝은 곳에서 찍은 선명한 사진이 좋아요! ✨</li>
          </ul>
        </div>

        {/* 확인 버튼 */}
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-[#56412C] text-[#F5EFE6] rounded-xl font-bold hover:bg-[#433222] transition active:scale-95 shadow-md"
        >
          네, 확인했어요!
        </button>
      </div>
    </div>
  );
}
