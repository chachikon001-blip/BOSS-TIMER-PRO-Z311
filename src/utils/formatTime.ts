/**
 * Time and Duration Formatting Utilities for BOSS TIMER PRO Z3
 */

/**
 * Format decimal hours into Thai hours and minutes
 * e.g. 7.5 -> "7 ชม. 30 นาที"
 *      3.5 -> "3 ชม. 30 นาที"
 *      4.5 -> "4 ชม. 30 นาที"
 *      2.5 -> "2 ชม. 30 นาที"
 *      8   -> "8 ชม."
 *      0.5 -> "30 นาที"
 */
export function formatHoursAndMinutes(hours: number | null | undefined): string {
  if (hours == null || isNaN(hours)) return '';
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (wholeHours === 0 && minutes > 0) {
    return `${minutes} นาที`;
  }
  if (minutes === 0) {
    return `${wholeHours} ชม.`;
  }
  return `${wholeHours} ชม. ${minutes} นาที`;
}

/**
 * Format countdown remaining time
 */
export function formatRemainingTime(diffMs: number): string {
  if (diffMs <= 0) {
    const passedSec = Math.floor(Math.abs(diffMs) / 1000);
    const passedMin = Math.floor(passedSec / 60);
    const remSec = passedSec % 60;
    return `เกินมา ${passedMin}:${remSec.toString().padStart(2, '0')}`;
  }
  const totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Format ISO date string to Thai display time GMT+7
 */
export function formatThaiTime(isoString?: string | null): string {
  if (!isoString) return '--:-- น.';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '--:-- น.';
  return d.toLocaleTimeString('th-TH', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' น.';
}
