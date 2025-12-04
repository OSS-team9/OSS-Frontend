"use client";

import Image from "next/image";

// ⭐️ 도감 더미 데이터
// (나중에는 서버에서 "내가 획득한 캐릭터 목록"을 받아와야 합니다)
const COLLECTION_DATA = [
  {
    emotion: "joy",
    label: "기쁨",
    color: "bg-joy-bg",
    items: [
      { level: 1, name: "만족", acquired: true },
      { level: 2, name: "즐거음", acquired: true },
      { level: 3, name: "행복", acquired: false }, // 미획득 예시
    ],
  },
  {
    emotion: "anger",
    label: "분노",
    color: "bg-anger-bg",
    items: [
      { level: 1, name: "불안", acquired: false },
      { level: 2, name: "화남", acquired: true },
      { level: 3, name: "격노", acquired: false },
    ],
  },
  {
    emotion: "sadness",
    label: "슬픔",
    color: "bg-sadness-bg",
    items: [
      { level: 1, name: "우울", acquired: true },
      { level: 2, name: "비통", acquired: false },
      { level: 3, name: "절망", acquired: false },
    ],
  },
  {
    emotion: "panic",
    label: "당황",
    color: "bg-panic-bg",
    items: [
      { level: 1, name: "난감", acquired: false },
      { level: 2, name: "당혹", acquired: false },
      { level: 3, name: "놀람", acquired: false },
    ],
  },
  {
    emotion: "hurt",
    label: "상처",
    color: "bg-hurt-bg",
    items: [
      { level: 1, name: "서운함", acquired: false },
      { level: 2, name: "외로움", acquired: false },
      { level: 3, name: "배신감", acquired: false },
    ],
  },
  {
    emotion: "anxiety",
    label: "불안",
    color: "bg-anxiety-bg",
    items: [
      { level: 1, name: "걱정", acquired: true },
      { level: 2, name: "두려움", acquired: false },
      { level: 3, name: "공포", acquired: false },
    ],
  },
  {
    emotion: "neutral",
    label: "중립",
    color: "bg-neutral-bg",
    items: [
      { level: 1, name: "무기력", acquired: true },
      { level: 2, name: "무표정", acquired: false },
      { level: 3, name: "평온", acquired: false },
    ],
  },
];

export default function EmotionCollection() {
  return (
    <div className="flex flex-col gap-4">
      {COLLECTION_DATA.map((category) => (
        <div
          key={category.emotion}
          className="flex items-center bg-white rounded-[1.5rem] p-4 shadow-sm"
        >
          {/* 1. 왼쪽: 대표 감정 아이콘 (말풍선 효과) */}
          <div className="relative mr-4 shrink-0">
            <div
              className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center`}
            >
              <Image
                // 대표 아이콘은 1레벨 이미지를 쓰거나 별도 아이콘 사용
                src={`/images/emotions/${category.emotion}.png`}
                alt={category.label}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            {/* 말풍선 꼬리 (장식) */}
          </div>

          {/* 2. 오른쪽: 수집 목록 (가로 배치) */}
          <div className="flex-1 flex justify-around items-start">
            {category.items.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                {/* 캐릭터 원형 배경 */}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center relative overflow-hidden
                                ${
                                  item.acquired ? category.color : "bg-gray-200"
                                }`}
                >
                  {item.acquired ? (
                    // ✅ 획득함: 캐릭터 이미지
                    <Image
                      src={`/images/emotions/${category.emotion}_${item.level}.png`}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="object-contain drop-shadow-sm"
                    />
                  ) : (
                    // 🔒 미획득: 물음표 (이미지 또는 텍스트)
                    <span className="text-4xl font-bold text-gray-400 opacity-50">
                      ?
                    </span>
                  )}
                </div>

                {/* 이름 라벨 (획득했을 때만 표시) */}
                <span
                  className={`text-xs font-bold ${
                    item.acquired ? "text-black/70" : "text-transparent"
                  }`}
                >
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
