export function getFormattedDate(dateString?: string) {
  // 1. 들어온 날짜가 있으면 그걸 쓰고, 없으면 오늘(new Date)을 씀
  const targetDate = dateString ? new Date(dateString) : new Date();

  // 2. 이제 targetDate를 기준으로 계산
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekDay = weekDays[targetDate.getDay()];

  return `${month}. ${day} (${weekDay})`;
}

export function parseDate(dateString: string) {
  const date = new Date(dateString);

  // 월.일 (예: "09.26")
  const mmdd = `${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;

  // 요일 (예: "금")
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = weekDays[date.getDay()];

  return { mmdd, dayOfWeek };
}
