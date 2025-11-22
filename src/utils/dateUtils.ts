export function getFormattedDate() {
  const now = new Date();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekDay = weekDays[now.getDay()];

  return `${month}. ${day} (${weekDay})`;
}
