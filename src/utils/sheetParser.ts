import { BossRecord } from '../types';

export interface ParsedSheetBoss {
  rawLine: string;
  matchedBossId?: string;
  matchedBossName?: string;
  cooldownHours?: number;
  dateStr?: string;
  parsedDate?: Date | null;
  deathDate?: Date | null;
  calculatedSpawnDate?: Date | null;
  effectiveSpawnDate?: Date | null;
  timeType: 'spawn' | 'kill';
  status: 'matched' | 'no_time' | 'not_found';
  originalBoss?: BossRecord;
}

/**
 * Clean and normalize a string for fuzzy matching
 */
function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-z0-9]/g, '')
    .trim();
}

/**
 * Match a raw boss name against the list of known bosses
 */
export function findMatchingBoss(rawName: string, bosses: BossRecord[]): BossRecord | undefined {
  const cleanRaw = rawName.trim();
  const normRaw = normalizeName(cleanRaw);

  if (!normRaw) return undefined;

  // 1. Direct nameTh or nameEn exact match
  const exact = bosses.find(
    (b) =>
      b.nameTh.trim().toLowerCase() === cleanRaw.toLowerCase() ||
      (b.nameEn && b.nameEn.trim().toLowerCase() === cleanRaw.toLowerCase())
  );
  if (exact) return exact;

  // 2. Normalized alphanumeric match
  const normMatch = bosses.find((b) => {
    const normTh = normalizeName(b.nameTh);
    const normEn = b.nameEn ? normalizeName(b.nameEn) : '';
    return normTh === normRaw || (normEn && normEn === normRaw);
  });
  if (normMatch) return normMatch;

  // 3. Substring / contains match (e.g. "เฟลิส - Felis" contains "เฟลิส")
  const subMatch = bosses.find((b) => {
    const normTh = normalizeName(b.nameTh);
    const normEn = b.nameEn ? normalizeName(b.nameEn) : '';
    return (
      (normTh.length >= 2 && normRaw.includes(normTh)) ||
      (normEn.length >= 2 && normRaw.includes(normEn)) ||
      (normRaw.length >= 2 && (normTh.includes(normRaw) || normEn.includes(normRaw)))
    );
  });
  if (subMatch) return subMatch;

  return undefined;
}

/**
 * Parse a date string like "03/10/2026", "3/10/26", "2026-10-03"
 */
function parseDateParts(dateStr: string): { day: number; month: number; year: number } | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // Pattern 1: DD/MM/YYYY or DD-MM-YYYY
  const slashParts = clean.split(/[/.-]/);
  if (slashParts.length === 3) {
    let p0 = parseInt(slashParts[0], 10);
    let p1 = parseInt(slashParts[1], 10);
    let p2 = parseInt(slashParts[2], 10);

    if (isNaN(p0) || isNaN(p1) || isNaN(p2)) return null;

    let day = p0;
    let month = p1;
    let year = p2;

    // Handle YYYY-MM-DD
    if (p0 > 1000) {
      year = p0;
      month = p1;
      day = p2;
    }

    // Two-digit year e.g. 26 -> 2026
    if (year < 100) {
      year += 2000;
    }

    // Buddhist Era (BE) e.g. 2569 -> 2026
    if (year > 2500) {
      year -= 543;
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { day, month, year };
    }
  }

  return null;
}

/**
 * Parse user pasted text from Google Sheets or Excel
 * Supports:
 * - Line format: [BossName]\t[Cooldown]\t[DD/MM/YYYY]\t[Hour]\t[Minute]
 * - Line format: [BossName]\t[Cooldown]\t[DD/MM/YYYY]\t[HH:MM]
 * - Line format: [BossName]\t[DeathTime]\t[SpawnTime]
 */
export function parseSheetData(
  text: string,
  bosses: BossRecord[],
  timeType: 'spawn' | 'kill' = 'kill',
  autoRollNextRound = false
): ParsedSheetBoss[] {
  if (!text || !text.trim()) return [];

  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const results: ParsedSheetBoss[] = [];

  for (const line of lines) {
    // Split by tab (\t) or multiple whitespace / commas
    let parts = line.includes('\t')
      ? line.split('\t').map((p) => p.trim())
      : line.split(/\s{2,}|\t/).map((p) => p.trim());

    if (parts.length === 0 || !parts[0]) continue;

    // Handle spacer column B (e.g. from Sheet where column B is blank)
    // [Name, "", "Hr", "Date", "Hour", "Minute"] -> [Name, "Hr", "Date", "Hour", "Minute"]
    if (parts.length >= 5 && parts[1] === '' && !isNaN(parseFloat(parts[2]))) {
      parts = [parts[0], ...parts.slice(2)];
    }

    // Skip header lines
    if (
      parts[0].includes('ชื่อบอส') ||
      parts[0].toLowerCase().includes('name') ||
      parts[0].toLowerCase().includes('boss') ||
      parts[0].includes('ลำดับ')
    ) {
      continue;
    }

    const rawName = parts[0];
    const matched = findMatchingBoss(rawName, bosses);

    let cooldown: number | undefined = undefined;
    let dateObj: Date | null = null;
    let dateStr: string | undefined = undefined;

    // Format A (5 parts): Name \t Cooldown \t DD/MM/YYYY \t Hour \t Minute
    // e.g. เฟลิส - Felis \t 2 \t 03/10/2026 \t 10 \t 26
    if (parts.length >= 5) {
      const cdNum = parseFloat(parts[1]);
      if (!isNaN(cdNum)) cooldown = cdNum;

      dateStr = parts[2];
      const parsedDateParts = parseDateParts(dateStr);
      const h = parseInt(parts[3], 10);
      const m = parseInt(parts[4], 10);

      if (parsedDateParts && !isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        dateObj = new Date(parsedDateParts.year, parsedDateParts.month - 1, parsedDateParts.day, h, m, 0, 0);
      }
    }
    // Format B (4 parts): Name \t Cooldown \t DD/MM/YYYY \t HH:MM
    else if (parts.length === 4) {
      const cdNum = parseFloat(parts[1]);
      if (!isNaN(cdNum)) cooldown = cdNum;

      dateStr = parts[2];
      const parsedDateParts = parseDateParts(dateStr);
      const timeParts = parts[3].split(':');

      if (parsedDateParts && timeParts.length >= 2) {
        const h = parseInt(timeParts[0], 10);
        const m = parseInt(timeParts[1], 10);
        if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          dateObj = new Date(parsedDateParts.year, parsedDateParts.month - 1, parsedDateParts.day, h, m, 0, 0);
        }
      }
    }
    // Format C (3 parts): Name \t Cooldown \t DD/MM/YYYY (No time given, e.g. ทรอมบา - Tromba \t 4.5 \t 30/09/2026)
    else if (parts.length === 3 && (parts[2].includes('/') || parts[2].includes('-'))) {
      const cdNum = parseFloat(parts[1]);
      if (!isNaN(cdNum)) cooldown = cdNum;
      dateStr = parts[2];
      dateObj = null; // No hour/minute specified
    }
    // Format D (3 parts): Name \t DeathTime \t SpawnTime (e.g. from app's Copy button)
    else if (parts.length === 3 && parts[2].includes(':')) {
      const timeStr = timeType === 'kill' ? parts[1] : parts[2];
      const timeParts = timeStr.replace(/[^0-9:]/g, '').split(':');
      if (timeParts.length >= 2) {
        const h = parseInt(timeParts[0], 10);
        const m = parseInt(timeParts[1], 10);
        if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          const now = new Date();
          dateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
        }
      }
    }
    // Format E (2 parts): Name \t HH:MM
    else if (parts.length === 2 && parts[1].includes(':')) {
      const timeParts = parts[1].replace(/[^0-9:]/g, '').split(':');
      if (timeParts.length >= 2) {
        const h = parseInt(timeParts[0], 10);
        const m = parseInt(timeParts[1], 10);
        if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          const now = new Date();
          dateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
        }
      }
    }

    let status: 'matched' | 'no_time' | 'not_found' = 'not_found';
    if (matched) {
      status = dateObj ? 'matched' : 'no_time';
    }

    const effectiveCooldown = cooldown ?? matched?.cooldownHours ?? 0;
    let deathDate: Date | null = null;
    let calculatedSpawnDate: Date | null = null;
    let effectiveSpawnDate: Date | null = null;

    if (dateObj && effectiveCooldown > 0) {
      if (timeType === 'kill') {
        deathDate = dateObj;
        calculatedSpawnDate = new Date(dateObj.getTime() + effectiveCooldown * 3600 * 1000);
      } else {
        calculatedSpawnDate = dateObj;
        deathDate = new Date(dateObj.getTime() - effectiveCooldown * 3600 * 1000);
      }

      effectiveSpawnDate = new Date(calculatedSpawnDate.getTime());
      if (autoRollNextRound && effectiveCooldown > 0) {
        const nowMs = Date.now();
        // Roll forward until spawn time is >= nowMs - 15 minutes (or in the future)
        let loops = 0;
        while (effectiveSpawnDate.getTime() < nowMs && loops < 100) {
          effectiveSpawnDate = new Date(effectiveSpawnDate.getTime() + effectiveCooldown * 3600 * 1000);
          loops++;
        }
      }
    }

    results.push({
      rawLine: line,
      matchedBossId: matched?.id,
      matchedBossName: matched ? `${matched.nameTh} (${matched.nameEn || ''})` : undefined,
      cooldownHours: cooldown ?? matched?.cooldownHours,
      dateStr,
      parsedDate: dateObj,
      deathDate,
      calculatedSpawnDate,
      effectiveSpawnDate,
      timeType,
      status,
      originalBoss: matched,
    });
  }

  return results;
}
