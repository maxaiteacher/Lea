const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 다음 물 주기 날짜 = 마지막으로 물 준 날 + 간격(일) */
export function getNextWatering(
  lastWateredDate: Date | string,
  intervalDays: number
): Date {
  const last = new Date(lastWateredDate);
  return new Date(last.getTime() + intervalDays * MS_PER_DAY);
}

/** 오늘 기준 물 줄 때가 지났는지(=오늘 포함 그 이전이면 true) */
export function isDue(
  lastWateredDate: Date | string,
  intervalDays: number,
  now: Date = new Date()
): boolean {
  const next = getNextWatering(lastWateredDate, intervalDays);
  // 날짜 단위로 비교 (시각 무시)
  const nextDay = new Date(next.getFullYear(), next.getMonth(), next.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return nextDay.getTime() <= today.getTime();
}

/** 다음 물 주기까지 남은 일수 (음수면 지남) */
export function daysUntilWatering(
  lastWateredDate: Date | string,
  intervalDays: number,
  now: Date = new Date()
): number {
  const next = getNextWatering(lastWateredDate, intervalDays);
  const nextDay = new Date(next.getFullYear(), next.getMonth(), next.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((nextDay.getTime() - today.getTime()) / MS_PER_DAY);
}

/** YYYY.MM.DD 포맷 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}
