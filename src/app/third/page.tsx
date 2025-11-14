// components/ImageOverlayDemo.tsx
"use client";

import Image from "next/image";

export default function ImageOverlayDemo() {
  const ASPECT_RATIO = "aspect-[1/2]";

  return (
    // 1. 부모 컨테이너: relative와 종횡비(1:2) 설정
    <div
      className={`relative w-full max-w-sm mx-auto ${ASPECT_RATIO} overflow-hidden shadow-2xl mt-8`}
    >
      {/* 2. ⭐️ 배경 이미지 (Group 2.png) - 회색 별 */}
      <Image
        src="/images/Group 2.png"
        alt="Background image with gray star"
        fill
        priority
        className="object-cover absolute top-0 left-0"
      />

      {/* 3. ⭐️ 오버레이 이미지 (Group 3.png) - 노란색 별 */}
      {/* ⭐️ 가장 중요한 수정: fill 속성을 사용해 배경 이미지와 완전히 겹치도록 합니다. */}
      <Image
        src="/images/Group 3.png"
        alt="Yellow star overlay"
        fill // ⭐️ 이 속성이 배경과 동일한 크기와 위치를 갖게 합니다.
        // ⭐️ object-cover를 사용해 컨테이너를 꽉 채웁니다.
        className="object-cover absolute top-0 left-0"
      />

      {/* 참고: mix-blend-multiply를 추가하면 겹쳐진 두 이미지를 시각적으로 확인할 수 있어 
               디버그에 유용합니다. (예: className="... mix-blend-multiply") */}
    </div>
  );
}
