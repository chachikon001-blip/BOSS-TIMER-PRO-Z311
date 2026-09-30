import React, { useState } from 'react';
import { BossRecord } from '../types';
import { formatHoursAndMinutes } from '../utils/formatTime';
import {
  Clock,
  RotateCcw,
  Zap,
  Volume2,
  Edit2,
  Edit3,
  MapPin,
  Shield,
  Swords,
  Star,
  Sparkles,
  ShieldAlert,
  Check,
  X,
} from 'lucide-react';

interface BossCardProps {
  boss: BossRecord;
  currentTime: Date;
  onQuickKill: (boss: BossRecord) => void;
  onCustomTime: (boss: BossRecord) => void;
  onResetTime: (boss: BossRecord) => void;
  onToggleFavorite: (boss: BossRecord) => void;
  onTestVoice: (boss: BossRecord) => void;
  onEditBoss?: (boss: BossRecord) => void;
  showServerBadge?: boolean;
  onUpdateSpawnTime?: (boss: BossRecord, newSpawnDate: Date) => void;
}

export const BossCard: React.FC<BossCardProps> = ({
  boss,
  currentTime,
  onQuickKill,
  onCustomTime,
  onResetTime,
  onToggleFavorite,
  onTestVoice,
  onEditBoss,
  showServerBadge = true,
  onUpdateSpawnTime,
}) => {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [inputTimeStr, setInputTimeStr] = useState('');
  let status: 'unknown' | 'spawned' | 'soon' | 'cooldown' = 'unknown';
  let diffMs = 0;
  let countdownText = '--:--:--';
  let timePillText = '--:--';

  if (boss.nextSpawnAt) {
    const spawnDate = new Date(boss.nextSpawnAt);
    if (!isNaN(spawnDate.getTime())) {
      timePillText = spawnDate.toLocaleTimeString('th-TH', {
        timeZone: 'Asia/Bangkok',
        hour: '2-digit',
        minute: '2-digit',
      });

      diffMs = spawnDate.getTime() - currentTime.getTime();

      if (diffMs <= 0) {
        status = 'spawned';
        const passedSec = Math.floor(Math.abs(diffMs) / 1000);
        const passedMin = Math.floor(passedSec / 60);
        const remSec = passedSec % 60;
        countdownText = `เกินมา ${passedMin}:${remSec.toString().padStart(2, '0')}`;
      } else {
        const totalSec = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSec / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;
        const pad = (n: number) => n.toString().padStart(2, '0');
        countdownText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

        if (diffMs <= 15 * 60 * 1000) {
          status = 'soon';
        } else {
          status = 'cooldown';
        }
      }
    }
  }

  const handleStartEditTime = () => {
    let initial = '';
    if (boss.nextSpawnAt) {
      const d = new Date(boss.nextSpawnAt);
      if (!isNaN(d.getTime())) {
        const pad = (n: number) => n.toString().padStart(2, '0');
        initial = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    }
    if (!initial) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      initial = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    }
    setInputTimeStr(initial);
    setIsEditingTime(true);
  };

  const handleSaveInlineTime = () => {
    if (!inputTimeStr.trim()) {
      setIsEditingTime(false);
      return;
    }
    const [hhStr, mmStr] = inputTimeStr.split(':');
    const h = parseInt(hhStr, 10);
    const m = parseInt(mmStr, 10);
    if (isNaN(h) || isNaN(m)) {
      setIsEditingTime(false);
      return;
    }

    const baseDate = boss.nextSpawnAt ? new Date(boss.nextSpawnAt) : new Date();
    baseDate.setHours(h);
    baseDate.setMinutes(m);
    baseDate.setSeconds(0);
    baseDate.setMilliseconds(0);

    onUpdateSpawnTime?.(boss, baseDate);
    setIsEditingTime(false);
  };

  const isServer1 = boss.serverId === 'server_1';

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between ${
        status === 'spawned'
          ? 'border-rose-500/70 bg-gradient-to-b from-rose-950/30 via-[#0e1628] to-[#080d18] shadow-lg shadow-rose-950/20'
          : status === 'soon'
          ? 'border-amber-500/70 bg-gradient-to-b from-amber-950/25 via-[#0e1628] to-[#080d18] shadow-lg shadow-amber-950/20'
          : 'border-[#16233f] bg-[#0c1324] hover:border-[#213560]'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {boss.bossNumber && (
              <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0f2c4e] text-[#38bdf8] border border-[#0284c7]/40 shadow-sm">
                #{boss.bossNumber}
              </span>
            )}
            {showServerBadge && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                  isServer1
                    ? 'border-amber-500/70 text-amber-300 bg-amber-500/10'
                    : 'border-purple-500/70 text-purple-300 bg-purple-500/10'
                }`}
              >
                {isServer1 ? (
                  <Shield className="w-3 h-3 text-amber-400" />
                ) : (
                  <Swords className="w-3 h-3 text-purple-400" />
                )}
                <span>{boss.serverName}</span>
              </span>
            )}
            {boss.isCustom && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> กำหนดเอง
              </span>
            )}
          </div>

          <button
            onClick={() => onToggleFavorite(boss)}
            className="text-stone-600 hover:text-amber-400 transition-colors cursor-pointer p-0.5"
            title="เพิ่ม/ลบรายการโปรด"
          >
            <Star
              className={`w-4 h-4 ${
                boss.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-stone-600'
              }`}
            />
          </button>
        </div>

        {/* Boss Name */}
        <h3 className="text-base font-bold text-white tracking-tight leading-snug truncate">
          {boss.nameTh} {boss.nameEn ? `- ${boss.nameEn}` : ''}
        </h3>

        {/* Location & Cooldown */}
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 my-1 truncate">
          <MapPin className="w-3 h-3 text-stone-500 flex-shrink-0" />
          <span className="truncate">{boss.location || 'ตามแมพ / พื้นที่ล่า'}</span>
          <span>•</span>
          <span className="text-stone-300">
            รอบ {formatHoursAndMinutes(boss.cooldownHours)}
          </span>
          {boss.rebootHours != null && (
            <>
              <span>•</span>
              <span className="text-amber-400/90 font-mono">
                รีบูท {formatHoursAndMinutes(boss.rebootHours)}
              </span>
            </>
          )}
        </div>

        {/* Spawn Time Pill Display */}
        <div className="my-3 p-3 rounded-xl bg-[#070b14] border border-[#16223b] text-center">
          <div className="flex items-center justify-center gap-2">
            {isEditingTime ? (
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#070b14] border-2 border-amber-500 shadow-xl shadow-amber-950/50 animate-in fade-in">
                <input
                  type="time"
                  autoFocus
                  value={inputTimeStr}
                  onChange={(e) => setInputTimeStr(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveInlineTime();
                    if (e.key === 'Escape') setIsEditingTime(false);
                  }}
                  className="bg-transparent text-amber-300 font-mono font-bold text-base focus:outline-none w-24"
                />
                <button
                  type="button"
                  onClick={handleSaveInlineTime}
                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                  title="บันทึกเวลาใหม่"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTime(false)}
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                  title="ยกเลิก"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={handleStartEditTime}
                className="group flex items-center gap-1.5 cursor-pointer p-1 rounded-lg hover:ring-2 hover:ring-amber-500/40 transition-all select-none"
                title="คลิกตรงนี้เพื่อแก้ไขเวลาเกิดได้ทันที"
              >
                <span
                  className={`font-mono font-bold text-xl ${
                    status === 'spawned'
                      ? 'text-rose-400'
                      : status === 'soon'
                      ? 'text-amber-400'
                      : status === 'cooldown'
                      ? 'text-white'
                      : 'text-stone-500'
                  }`}
                >
                  {timePillText}
                </span>
                <Clock className="w-4 h-4 text-stone-400 group-hover:text-amber-400 transition-colors" />
                <span className="text-xs text-stone-400">น.</span>
                <Edit2 className="w-3 h-3 text-stone-500 opacity-60 group-hover:opacity-100 group-hover:text-amber-400 transition-all" />
              </div>
            )}

            <button
              onClick={() => onResetTime(boss)}
              className="p-1 rounded-full text-stone-500 hover:text-rose-400 hover:bg-stone-800 transition-colors ml-1 cursor-pointer"
              title="รีเซ็ตเวลาบอสเป็น --:-- น. ทันที"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-1 text-xs font-mono">
            {status === 'spawned' ? (
              <span className="text-rose-400 font-bold inline-flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> {countdownText}
              </span>
            ) : status === 'unknown' ? (
              <span className="text-stone-600">นับถอยหลัง (--:--:--)</span>
            ) : (
              <span
                className={
                  status === 'soon' ? 'text-amber-400 font-semibold' : 'text-stone-400'
                }
              >
                นับถอยหลัง ({countdownText})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-2 border-t border-[#16233f] flex items-center justify-between gap-1.5">
        <button
          onClick={() => onQuickKill(boss)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs shadow-md shadow-orange-950/40 transition-all cursor-pointer whitespace-nowrap"
          title="นำเวลาเกิดล่าสุด + คูลดาวน์เกิดใหม่"
        >
          <Zap className="w-3.5 h-3.5 fill-black" />
          <span>อัปเดต</span>
        </button>

        <button
          onClick={() => onCustomTime(boss)}
          className="p-2 rounded-lg bg-[#141e35] hover:bg-[#1c2a4b] text-stone-300 hover:text-white border border-[#21325c] transition-colors cursor-pointer"
          title="ระบุเวลาตายย้อนหลัง หรือเลือกนาทีอิสระ"
        >
          <Clock className="w-4 h-4" />
        </button>

        <button
          onClick={() => onResetTime(boss)}
          className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 border border-rose-800/50 transition-colors cursor-pointer"
          title="รีเซ็ตเวลาบอสตัวนี้เป็น --:-- น. ทันที"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => onTestVoice(boss)}
          className="p-2 rounded-lg bg-[#141e35] hover:bg-[#1c2a4b] text-stone-400 hover:text-amber-400 border border-[#21325c] transition-colors cursor-pointer"
          title="ทดสอบเสียงอ่าน"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onEditBoss?.(boss)}
          className="p-2 rounded-lg bg-[#141e35] hover:bg-[#1c2a4b] text-stone-400 hover:text-sky-400 border border-[#21325c] transition-colors cursor-pointer"
          title="แก้ไขข้อมูลบอส"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
