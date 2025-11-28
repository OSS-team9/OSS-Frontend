// src/components/CalendarView.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { EmotionLog } from "@/types";
import Card from "../common/Card";

interface CalendarViewProps {
  logs: EmotionLog[];
  currentDate: Date; // ⭐️ 부모로부터 현재 날짜를 받음
  onDateChange: (newDate: Date) => void; // ⭐️ 날짜 변경 요청 함수
}

export default function CalendarView({
  logs,
  currentDate,
  onDateChange,
}: CalendarViewProps) {
  const now = new Date();

  // 이번 달의 정보 계산
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 ~ 11

  // 이번 달 1일과 마지막 날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const isNextDisabled =
    year > now.getFullYear() ||
    (year === now.getFullYear() && month >= now.getMonth());

  // 달력에 표시할 날짜 배열 생성
  const daysInMonth = [];

  // 1. 빈 칸 채우기 (1일이 시작하기 전 요일만큼)
  for (let i = 0; i < firstDay.getDay(); i++) {
    daysInMonth.push(null);
  }

  // 2. 날짜 채우기 (1일 ~ 말일)
  for (let i = 1; i <= lastDay.getDate(); i++) {
    daysInMonth.push(new Date(year, month, i));
  }

  // 이전달/다음달 이동 함수
  const prevMonth = () => onDateChange(new Date(year, month - 1, 1));
  const nextMonth = () => {
    if (!isNextDisabled) {
      onDateChange(new Date(year, month + 1, 1));
    }
  };

  // 오늘 날짜 확인용 문자열 (YYYY-MM-DD)
  const todayYear = now.getFullYear();
  const todayMonth = String(now.getMonth() + 1).padStart(2, "0");
  const todayDay = String(now.getDate()).padStart(2, "0");
  const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

  return (
    <Card className="bg-[#f5ebd8]">
      {" "}
      {/* 디자인 시안의 베이지색 배경 */}
      {/* 1. 헤더 (년월 및 이동 버튼) */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={prevMonth}
          className="p-1 text-black/60 hover:text-black"
        >
          <IoChevronBack size={20} />
        </button>
        <h2 className="text-2xl font-bold text-black font-lotte tracking-wide">
          {year}. {String(month + 1).padStart(2, "0")}
        </h2>
        <button
          onClick={nextMonth}
          disabled={isNextDisabled} // 버튼 기능 끄기
          className={`p-1 transition-colors ${
            isNextDisabled
              ? "text-black/10 cursor-not-allowed" // 🚫 못 감: 아주 연한 회색 + 금지 커서
              : "text-black/60 hover:text-black" // ✅ 갈 수 있음: 진한 회색
          }`}
        >
          <IoChevronForward size={20} />
        </button>
      </div>
      {/* 2. 요일 헤더 */}
      <div className="grid grid-cols-7 mb-4 text-center">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
          <div key={i} className="text-sm text-gray-500 font-medium">
            {day}
          </div>
        ))}
      </div>
      {/* 3. 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-6 justify-items-center">
        {daysInMonth.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />; // 빈 칸

          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const dateStr = `${year}-${month}-${day}`;

          const dayNum = date.getDate();

          // 해당 날짜의 로그 찾기
          const log = logs.find((l) => l.date === dateStr);
          const isToday = dateStr === todayStr;

          const isClickable = !!log;

          // 이동할 경로
          const detailLink = isClickable ? `/calendar/detail/${dateStr}` : "#";

          return (
            <Link
              key={dateStr}
              href={detailLink}
              className={`flex flex-col items-center gap-1 group 
                          ${
                            isClickable
                              ? "cursor-pointer"
                              : "pointer-events-none"
                          }`}
            >
              {/* 날짜 숫자 */}
              <div
                className={`
                w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold
                ${isToday ? "bg-[#4a3b2b] text-white" : "text-gray-500"}
              `}
              >
                {dayNum}
              </div>

              {/* 감정 아이콘 또는 빈 원 */}
              <div className="relative w-10 h-10 transition-transform group-active:scale-95">
                {log ? (
                  // ⭐️ 기록 있음: 감정 아이콘 표시
                  // (파일명 규칙: joy.png, sadness.png 등 - 레벨 없이 기본형 사용 가정)
                  // (만약 레벨별 아이콘을 쓴다면 _${log.emotionLevel} 추가)
                  <Image
                    src={`/emotions/${log.emotion}.png`}
                    alt={log.emotion}
                    fill
                    className="object-contain drop-shadow-sm"
                  />
                ) : (
                  // ⬜️ 기록 없음/미래: 회색 동그라미
                  <div className="w-10 h-10 rounded-full bg-black/20" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
