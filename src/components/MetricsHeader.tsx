import React from 'react';
import { Flame, Sparkles, Clock, Skull } from 'lucide-react';
import { BossRecord } from '../types';

interface MetricsHeaderProps {
  bosses: BossRecord[];
  currentTime: Date;
}

export const MetricsHeader: React.FC<MetricsHeaderProps> = ({ bosses, currentTime }) => {
  const nowMs = currentTime.getTime();

  let soonCount = 0;
  let spawnedCount = 0;
  let nextBoss: BossRecord | null = null;
  let nextBossDiffMs = Infinity;

  bosses.forEach((boss) => {
    if (!boss.nextSpawnAt) return;
    const spawnMs = new Date(boss.nextSpawnAt).getTime();
    if (isNaN(spawnMs)) return;
    const diff = spawnMs - nowMs;

    if (diff <= 0) {
      spawnedCount++;
    } else {
      if (diff <= 15 * 60 * 1000) {
        soonCount++;
      }
      if (diff < nextBossDiffMs) {
        nextBossDiffMs = diff;
        nextBoss = boss;
      }
    }
  });

  // Next boss countdown format
  let nextBossCountdown = '--:--:--';
  if (nextBoss && nextBossDiffMs < Infinity && nextBossDiffMs > 0) {
    const totalSec = Math.floor(nextBossDiffMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    nextBossCountdown = `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
      {/* Card 1: ใกล้เกิด (< 15 นาที) */}
      <div className="bg-[#0e1628]/90 border border-[#162340] rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/20">
        <div className="flex items-center justify-between text-stone-300 mb-2">
          <span className="text-xs font-semibold tracking-wide">ใกล้เกิด (&lt; 15 นาที)</span>
          <div className="w-8 h-8 rounded-xl bg-[#14203b] border border-[#1d2d52] flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-black text-white font-mono">
            {soonCount}
          </span>
          <span className="text-xs text-stone-400 font-medium">ตัว</span>
        </div>
      </div>

      {/* Card 2: เกิดแล้วในแมพ */}
      <div className="bg-[#0e1628]/90 border border-[#162340] rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/20">
        <div className="flex items-center justify-between text-stone-300 mb-2">
          <span className="text-xs font-semibold tracking-wide">เกิดแล้วในแมพ</span>
          <div className="w-8 h-8 rounded-xl bg-[#14203b] border border-[#1d2d52] flex items-center justify-center text-rose-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-black text-white font-mono">
            {spawnedCount}
          </span>
          <span className="text-xs text-stone-400 font-medium">ตัวพร้อมล่า</span>
        </div>
      </div>

      {/* Card 3: บอสตัวถัดไป */}
      <div className="bg-[#0e1628]/90 border border-[#162340] rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/20">
        <div className="flex items-center justify-between text-stone-300 mb-2">
          <span className="text-xs font-semibold tracking-wide">บอสตัวถัดไป</span>
          <div className="w-8 h-8 rounded-xl bg-[#14203b] border border-[#1d2d52] flex items-center justify-center text-sky-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-base sm:text-lg font-bold text-white truncate max-w-[200px]">
            {nextBoss ? `${(nextBoss as BossRecord).nameTh} - ${(nextBoss as BossRecord).nameEn || ''}` : 'ยังไม่มีบอสรอเกิด'}
          </div>
          <div className="text-xs font-mono text-amber-400 font-semibold">
            {nextBoss ? nextBossCountdown : '--:--:--'}
          </div>
        </div>
      </div>

      {/* Card 4: ติดตามทั้งหมด */}
      <div className="bg-[#0e1628]/90 border border-[#162340] rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/20">
        <div className="flex items-center justify-between text-stone-300 mb-2">
          <span className="text-xs font-semibold tracking-wide">ติดตามทั้งหมด</span>
          <div className="w-8 h-8 rounded-xl bg-[#14203b] border border-[#1d2d52] flex items-center justify-center text-purple-400">
            <Skull className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-black text-white font-mono">
            {bosses.length}
          </span>
          <span className="text-xs text-stone-400 font-medium">(ทั้ง 2 เซิร์ฟ)</span>
        </div>
      </div>
    </div>
  );
};
