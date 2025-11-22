export function getFormattedDate() {
  const now = new Date();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekDay = weekDays[now.getDay()];

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
