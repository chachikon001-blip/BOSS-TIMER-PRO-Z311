import { BossRecord } from '../types';

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
  return (
    d.toLocaleTimeString('th-TH', {
      timeZone: 'Asia/Bangkok',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' น.'
  );
}

/**
 * Ordered list of 45 bosses matching the user's exact clan Google Sheet
 */
export const SHEET_BOSS_ORDER: string[] = [
  'felis', // 1. เฟลิส - Felis
  'timitris', // 2. ทิมิทริส - Timitris
  'core', // 3. คอร์ซัสเซปเตอร์ - Core
  'stan', // 4. สตัน
  'savan', // 5. ซาบัน - Savan
  'gahareth', // 6. แกเร็ธ - Gahareth
  'mutated_cruma', // 7. ครูม่าหนองน้ำ - Mutated Cruma
  'behemoth', // 8. เบฮีมอธ - Behemoth
  'katan', // 9. คาทาน - Katan
  'lily', // 10. ลิลลี่ - Lily
  'ant3', // 11. มด 3- Ant3
  'pandraeed', // 12. พัน ดรายด์ - Pan'Dra'eed
  'talakin', // 13. ทาลาคิน - Talakin
  'sarka', // 14. ซาร์ก้า - Sarka
  'cruma4', // 15. ครูม่าปนเปื้อน - Cruma4
  'matura', // 16. มาทูรา - Matura
  'breka', // 17. เบรก้า - Breka
  'tromba', // 18. ทรอมบา - Tromba
  'enkura', // 19. เอนคูรา - Enkura
  'kelsus', // 20. เคลซอส - Kelsus
  'medusa', // 21. เมดูซ่า - Medusa
  'basila', // 22. บาซิลา - Basila
  'pannarod', // 23. พันนาโรด - Pannarod
  'chertuba', // 24. เชอร์ทูบา - Chertuba
  'valefar', // 25. เทมเพสต์ - Valefar
  'db', // 26. ดราก้อนบีสต์ - DB
  'talkin', // 27. ทัลคิน - Talkin
  'selu', // 28. เซลลู - Selu
  'balbo', // 29. บัลโบ - BalBo
  'timiniel', // 30. ทิมิเนล - Timiniel
  'orfen', // 31. ออร์เฟน - Orfen
  'repiro', // 32. เรปิโร - Repiro
  'coroon', // 33. โครูน - Coroon
  'hisilrome', // 34. ฮิซิโลเม - Hisilrome
  'mirror', // 35. กระจก - Mirror
  'landor', // 36. แลนเดอร์ - Landor
  'glaki', // 37. กลากิ - Glaki
  'samuel', // 38. ซามูเอล - Samuel
  'cabrio', // 39. คาบริโอ - Cabrio
  'flynt', // 40. ฟลินท์ - Flynt
  'haff', // 41. ฮาร์ป - Haff
  'andras', // 42. แอนดราส - Andras
  'olkuth', // 43. โอล์คุส - Olkuth
  'tanatos', // 44. ทานาทอส - Tanatos
  'rahha', // 45. ลาฮา - Rahha
];

const RED_33_KEYS = new Set(['core', 'ant3', 'db', 'orfen', 'olkuth', 'rahha']);
const YELLOW_50_KEYS = new Set([
  'gahareth', 'matura', 'breka', 'tromba', 'enkura', 'kelsus',
  'basila', 'pannarod', 'chertuba', 'valefar', 'talkin', 'selu',
  'balbo', 'repiro', 'hisilrome', 'cabrio', 'flynt', 'haff',
  'andras', 'tanatos'
]);

/**
 * Determine spawn rate category and Google Sheet background color:
 * - Green (#d9ead3) = 100% spawn chance
 * - Yellow (#fff2cc) = 50% spawn chance
 * - Red/Pink (#f4cccc) = 33% spawn chance
 */
export function getBossSpawnRateCategory(boss: BossRecord): {
  rate: '100%' | '50%' | '33%';
  bgColor: string;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
} {
  if (boss.spawnChance === '33%') {
    return {
      rate: '33%',
      bgColor: '#f4cccc',
      label: 'โอกาสเกิด 33%',
      badgeBg: 'bg-rose-950/60',
      badgeText: 'text-rose-300',
      badgeBorder: 'border-rose-500/40',
    };
  }
  if (boss.spawnChance === '50%') {
    return {
      rate: '50%',
      bgColor: '#fff2cc',
      label: 'โอกาสเกิด 50%',
      badgeBg: 'bg-amber-950/60',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-500/40',
    };
  }
  if (boss.spawnChance === '100%') {
    return {
      rate: '100%',
      bgColor: '#d9ead3',
      label: 'บอสเกิด 100%',
      badgeBg: 'bg-emerald-950/60',
      badgeText: 'text-emerald-300',
      badgeBorder: 'border-emerald-500/40',
    };
  }

  // Fallback by key / name
  const normKey = (boss.bossKey || '').toLowerCase();
  if (RED_33_KEYS.has(normKey)) {
    return {
      rate: '33%',
      bgColor: '#f4cccc',
      label: 'โอกาสเกิด 33%',
      badgeBg: 'bg-rose-950/60',
      badgeText: 'text-rose-300',
      badgeBorder: 'border-rose-500/40',
    };
  }
  if (YELLOW_50_KEYS.has(normKey)) {
    return {
      rate: '50%',
      bgColor: '#fff2cc',
      label: 'โอกาสเกิด 50%',
      badgeBg: 'bg-amber-950/60',
      badgeText: 'text-amber-300',
      badgeBorder: 'border-amber-500/40',
    };
  }

  const normTh = (boss.nameTh || '').toLowerCase();
  const normEn = (boss.nameEn || '').toLowerCase();
  const combined = `${normKey} ${normTh} ${normEn}`;

  if (
    combined.includes('core') || combined.includes('คอร์') ||
    combined.includes('ant3') || combined.includes('มด 3') || combined.includes('มด3') ||
    combined.includes('db') || combined.includes('ดราก้อน') ||
    combined.includes('orfen') || combined.includes('ออร์เฟน') ||
    combined.includes('olkuth') || combined.includes('โอล์คุส') ||
    combined.includes('rahha') || combined.includes('ลาฮา')
  ) {
    return {
      rate: '33%',
      bgColor: '#f4cccc',
      label: 'โอกาสเกิด 33%',
      badgeBg: 'bg-rose-950/60',
      badgeText: 'text-rose-300',
      badgeBorder: 'border-rose-500/40',
    };
  }

  for (const y of YELLOW_50_KEYS) {
    if (combined.includes(y)) {
      return {
        rate: '50%',
        bgColor: '#fff2cc',
        label: 'โอกาสเกิด 50%',
        badgeBg: 'bg-amber-950/60',
        badgeText: 'text-amber-300',
        badgeBorder: 'border-amber-500/40',
      };
    }
  }

  return {
    rate: '100%',
    bgColor: '#d9ead3',
    label: 'บอสเกิด 100%',
    badgeBg: 'bg-emerald-950/60',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/40',
  };
}

/**
 * Get sorting index for sheet
 */
export function getSheetBossIndex(boss: BossRecord): number {
  const normKey = (boss.bossKey || '').toLowerCase();
  const normTh = (boss.nameTh || '').toLowerCase();
  const normEn = (boss.nameEn || '').toLowerCase();

  for (let i = 0; i < SHEET_BOSS_ORDER.length; i++) {
    const target = SHEET_BOSS_ORDER[i];
    if (normKey.includes(target) || normEn.includes(target)) return i;
    if (target === 'felis' && normTh.includes('เฟลิส')) return i;
    if (target === 'timitris' && normTh.includes('ทิมิทริส')) return i;
    if (target === 'core' && (normTh.includes('คอร์') || normTh.includes('คอร์ซัส'))) return i;
    if (target === 'stan' && normTh.includes('สตัน')) return i;
    if (target === 'savan' && normTh.includes('ซาบัน')) return i;
    if (target === 'gahareth' && normTh.includes('แกเร็ธ')) return i;
    if (target === 'mutated_cruma' && normTh.includes('หนองน้ำ')) return i;
    if (target === 'behemoth' && normTh.includes('เบฮีมอธ')) return i;
    if (target === 'katan' && normTh.includes('คาทาน')) return i;
    if (target === 'lily' && normTh.includes('ลิลลี่')) return i;
    if (target === 'ant3' && (normTh.includes('มด') || normTh.includes('ant'))) return i;
    if (target === 'pandraeed' && normTh.includes('พัน ดรายด์')) return i;
    if (target === 'talakin' && normTh.includes('ทาลาคิน')) return i;
    if (target === 'sarka' && normTh.includes('ซาร์ก้า')) return i;
    if (target === 'cruma4' && normTh.includes('ปนเปื้อน')) return i;
    if (target === 'matura' && normTh.includes('มาทูรา')) return i;
    if (target === 'breka' && normTh.includes('เบรก้า')) return i;
    if (target === 'tromba' && normTh.includes('ทรอมบา')) return i;
    if (target === 'enkura' && normTh.includes('เอนคูรา')) return i;
    if (target === 'kelsus' && normTh.includes('เคลซอส')) return i;
    if (target === 'medusa' && normTh.includes('เมดูซ่า')) return i;
    if (target === 'basila' && normTh.includes('บาซิลา')) return i;
    if (target === 'pannarod' && normTh.includes('พันนาโรด')) return i;
    if (target === 'chertuba' && normTh.includes('เชอร์ทูบา')) return i;
    if (target === 'valefar' && (normTh.includes('เทมเพสต์') || normTh.includes('วาเลฟาร์'))) return i;
    if (target === 'db' && (normTh.includes('ดราก้อน') || normEn.includes('db'))) return i;
    if (target === 'talkin' && normTh.includes('ทัลคิน')) return i;
    if (target === 'selu' && normTh.includes('เซลลู')) return i;
    if (target === 'balbo' && normTh.includes('บัลโบ')) return i;
    if (target === 'timiniel' && normTh.includes('ทิมิเนล')) return i;
    if (target === 'orfen' && normTh.includes('ออร์เฟน')) return i;
    if (target === 'repiro' && normTh.includes('เรปิโร')) return i;
    if (target === 'coroon' && normTh.includes('โครูน')) return i;
    if (target === 'hisilrome' && normTh.includes('ฮิซิโลเม')) return i;
    if (target === 'mirror' && normTh.includes('กระจก')) return i;
    if (target === 'landor' && normTh.includes('แลนเดอร์')) return i;
    if (target === 'glaki' && normTh.includes('กลากิ')) return i;
    if (target === 'samuel' && normTh.includes('ซามูเอล')) return i;
    if (target === 'cabrio' && normTh.includes('คาบริโอ')) return i;
    if (target === 'flynt' && normTh.includes('ฟลินท์')) return i;
    if (target === 'haff' && normTh.includes('ฮาร์ป')) return i;
    if (target === 'andras' && normTh.includes('แอนดราส')) return i;
    if (target === 'olkuth' && normTh.includes('โอล์คุส')) return i;
    if (target === 'tanatos' && normTh.includes('ทานาทอส')) return i;
    if (target === 'rahha' && normTh.includes('ลาฮา')) return i;
  }
  return (boss.bossNumber || 999) + 100;
}

/**
 * Extract sheet row data for a boss
 */
export function getBossSheetRowData(boss: BossRecord) {
  const bossName = boss.nameEn ? `${boss.nameTh} - ${boss.nameEn}` : boss.nameTh;
  const cooldownNum = boss.cooldownHours;
  const cooldownStr = `${cooldownNum}`;
  const isDecimalCd = cooldownNum % 1 !== 0;

  // Determine Death Date & Time
  let deathDate: Date | null = null;
  if (boss.lastKilledAt) {
    const d = new Date(boss.lastKilledAt);
    if (!isNaN(d.getTime())) deathDate = d;
  } else if (boss.nextSpawnAt && boss.cooldownHours > 0) {
    const s = new Date(boss.nextSpawnAt);
    if (!isNaN(s.getTime())) {
      deathDate = new Date(s.getTime() - boss.cooldownHours * 3600 * 1000);
    }
  }

  let dateStr = '';
  let hourStr = '';
  let minStr = '';

  if (deathDate) {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Bangkok',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      }).formatToParts(deathDate);

      const d = parts.find((p) => p.type === 'day')?.value || '';
      const m = parts.find((p) => p.type === 'month')?.value || '';
      const y = parts.find((p) => p.type === 'year')?.value || '';
      const hRaw = parts.find((p) => p.type === 'hour')?.value || '0';
      const minRaw = parts.find((p) => p.type === 'minute')?.value || '0';

      dateStr = `${d}/${m}/${y}`;
      hourStr = `${parseInt(hRaw, 10) % 24}`;
      minStr = `${parseInt(minRaw, 10)}`;
    } catch {
      const pad = (n: number) => n.toString().padStart(2, '0');
      dateStr = `${pad(deathDate.getDate())}/${pad(deathDate.getMonth() + 1)}/${deathDate.getFullYear()}`;
      hourStr = `${deathDate.getHours()}`;
      minStr = `${deathDate.getMinutes()}`;
    }
  } else {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
    hourStr = '';
    minStr = '';
  }

  const { bgColor, rate } = getBossSpawnRateCategory(boss);

  return {
    bossName,
    cooldownStr,
    isDecimalCd,
    dateStr,
    hourStr,
    minStr,
    bgColor,
    rate,
  };
}

/**
 * Format a single boss into Tab-Separated string
 */
export function formatBossForSheets(boss: BossRecord): string {
  const row = getBossSheetRowData(boss);
  return `${row.bossName}\t\t${row.cooldownStr}\t${row.dateStr}\t${row.hourStr}\t${row.minStr}\t☐`;
}

/**
 * Format multiple bosses into plain-text Tab-Separated Values for Google Sheets
 */
export function formatBossesForSheets(bosses: BossRecord[], includeHeader = true): string {
  const sorted = [...bosses].sort((a, b) => getSheetBossIndex(a) - getSheetBossIndex(b));
  const rows = sorted.map(formatBossForSheets);
  if (includeHeader) {
    return ['Name\t\tHr.\tวันที่ตาย\tชม\tนาที\tUpdate', ...rows].join('\n');
  }
  return rows.join('\n');
}

/**
 * Build rich HTML Table with exact background colors (Green, Yellow, Pink/Red) for Google Sheets paste
 */
export function buildColoredSheetHtml(bosses: BossRecord[]): string {
  const sorted = [...bosses].sort((a, b) => getSheetBossIndex(a) - getSheetBossIndex(b));

  const trRows = sorted
    .map((boss) => {
      const row = getBossSheetRowData(boss);
      // In user's sheet: decimal cooldown (4.5, 3.5, 2.5, 7.5) and minute are red text
      const cdStyle = row.isDecimalCd
        ? 'color: #cc0000; font-weight: bold;'
        : 'color: #000000;';
      const minStyle = row.isDecimalCd
        ? 'color: #cc0000; font-weight: bold;'
        : 'color: #000000;';

      return `<tr style="background-color: ${row.bgColor};">
  <td style="padding: 4px 8px; border: 1px solid #b7b7b7; text-align: left; color: #000000; font-family: Arial, sans-serif; font-size: 10pt;">${row.bossName}</td>
  <td style="padding: 4px 6px; border: 1px solid #b7b7b7; background-color: ${row.bgColor};"></td>
  <td style="padding: 4px 8px; border: 1px solid #b7b7b7; text-align: center; ${cdStyle} font-family: Arial, sans-serif; font-size: 10pt;">${row.cooldownStr}</td>
  <td style="padding: 4px 8px; border: 1px solid #b7b7b7; text-align: center; color: #000000; font-family: Arial, sans-serif; font-size: 10pt;">${row.dateStr}</td>
  <td style="padding: 4px 8px; border: 1px solid #b7b7b7; text-align: center; color: #000000; font-family: Arial, sans-serif; font-size: 10pt;">${row.hourStr}</td>
  <td style="padding: 4px 8px; border: 1px solid #b7b7b7; text-align: center; ${minStyle} font-family: Arial, sans-serif; font-size: 10pt;">${row.minStr}</td>
  <td style="padding: 4px 8px; border: 1px solid #b7b7b7; text-align: center; color: #800080; font-family: Arial, sans-serif; font-size: 11pt;">☐</td>
</tr>`;
    })
    .join('\n');

  return `<meta charset="utf-8">
<table style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10pt; width: 100%;">
  <thead>
    <tr style="background-color: #cfe2f3; font-weight: bold; text-align: center; color: #000000;">
      <th style="padding: 6px 12px; border: 1px solid #b7b7b7; text-align: left;">Name</th>
      <th style="padding: 6px 6px; border: 1px solid #b7b7b7;"></th>
      <th style="padding: 6px 10px; border: 1px solid #b7b7b7;">Hr.</th>
      <th style="padding: 6px 10px; border: 1px solid #b7b7b7;">วันที่ตาย</th>
      <th style="padding: 6px 10px; border: 1px solid #b7b7b7;">ชม</th>
      <th style="padding: 6px 10px; border: 1px solid #b7b7b7;">นาที</th>
      <th style="padding: 6px 10px; border: 1px solid #b7b7b7;">Update</th>
    </tr>
  </thead>
  <tbody>
${trRows}
  </tbody>
</table>`;
}

/**
 * Copy colored table to clipboard supporting both HTML and plain text
 */
export async function copyColoredBossesToClipboard(bosses: BossRecord[]): Promise<boolean> {
  const html = buildColoredSheetHtml(bosses);
  const plainText = formatBossesForSheets(bosses, true);

  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([plainText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        }),
      ]);
      return true;
    }
  } catch (err) {
    console.warn('ClipboardItem rich copy error, falling back to writeText:', err);
  }

  // Fallback to plain text
  try {
    await navigator.clipboard.writeText(plainText);
    return true;
  } catch (err2) {
    console.error('All clipboard copy attempts failed:', err2);
    return false;
  }
}
