import React, { useState } from 'react';
import { BossRecord } from '../types';
import {
  X,
  Clock,
  Skull,
  Plus,
  Minus,
  MapPin,
  Hourglass,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import { formatHoursAndMinutes } from '../utils/formatTime';

interface CustomTimeModalProps {
  boss: BossRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (boss: BossRecord, killedAtDate: Date) => Promise<void>;
}

export const CustomTimeModal: React.FC<CustomTimeModalProps> = ({
  boss,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !boss) return null;

  const getInitialLocalDateTime = () => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const [deathDateTimeStr, setDeathDateTimeStr] = useState<string>(getInitialLocalDateTime());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const setOffsetMinutes = (mins: number) => {
    const d = new Date(Date.now() - mins * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    setDeathDateTimeStr(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`
    );
  };

  const adjustCurrentMinutes = (deltaMinutes: number) => {
    const curr = new Date(deathDateTimeStr);
    if (isNaN(curr.getTime())) return;
    const nextDate = new Date(curr.getTime() + deltaMinutes * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    setDeathDateTimeStr(
      `${nextDate.getFullYear()}-${pad(nextDate.getMonth() + 1)}-${pad(nextDate.getDate())}T${pad(
        nextDate.getHours()
      )}:${pad(nextDate.getMinutes())}`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const killedDate = new Date(deathDateTimeStr);
    if (isNaN(killedDate.getTime())) {
      alert('กรุณาระบุวันและเวลาที่ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(boss, killedDate);
      onClose();
    } catch (err: any) {
      console.error('Custom kill update error:', err);
      alert('บันทึกเวลาไม่สำเร็จ: ' + (err?.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date helper
  const formatDateTime = (isoStr?: string | null): string => {
    if (!isoStr) return '--:-- น.';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '--:-- น.';
    return (
      d.toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' น.'
    );
  };

  // Time diff helper
  const getTimeDiff = (isoStr?: string | null): { text: string; isPast: boolean } | null => {
    if (!isoStr) return null;
    const target = new Date(isoStr).getTime();
    if (isNaN(target)) return null;
    const now = Date.now();
    const diffMs = target - now;
    const absDiff = Math.abs(diffMs);
    const hours = Math.floor(absDiff / (3600 * 1000));
    const minutes = Math.floor((absDiff % (3600 * 1000)) / (60 * 1000));

    if (diffMs < 0) {
      if (hours === 0 && minutes === 0) return { text: 'เมื่อสักครู่', isPast: true };
      return { text: `ผ่านมา ${hours > 0 ? `${hours} ชม. ` : ''}${minutes} นาที`, isPast: true };
    } else {
      return { text: `อีก ${hours > 0 ? `${hours} ชม. ` : ''}${minutes} นาที`, isPast: false };
    }
  };

  // Preview new calculated next spawn time
  const previewSpawnInfo = () => {
    const killedDate = new Date(deathDateTimeStr);
    if (isNaN(killedDate.getTime())) return { text: '--:-- น.', diffText: '' };
    const spawnDate = new Date(killedDate.getTime() + boss.cooldownHours * 3600 * 1000);
    const formatted =
      spawnDate.toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' น.';

    const now = Date.now();
    const diffMs = spawnDate.getTime() - now;
    const absDiff = Math.abs(diffMs);
    const hours = Math.floor(absDiff / (3600 * 1000));
    const minutes = Math.floor((absDiff % (3600 * 1000)) / (60 * 1000));
    const diffText =
      diffMs < 0
        ? `(เวลาเกิดผ่านมาแล้ว ${hours > 0 ? `${hours} ชม. ` : ''}${minutes} นาที)`
        : `(จะเกิดในอีก ${hours > 0 ? `${hours} ชม. ` : ''}${minutes} นาที)`;

    return { text: formatted, diffText };
  };

  const lastKilledDiff = getTimeDiff(boss.lastKilledAt);
  const currentSpawnDiff = getTimeDiff(boss.nextSpawnAt);
  const nextSpawnInfo = previewSpawnInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#0c1222] border border-[#1b2b4e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#16233f] bg-[#0e1628] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Skull className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  ข้อมูลบอส & ระบุเวลาตาย
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                  #{boss.bossNumber || '-'}
                </span>
              </div>
              <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                <span className="font-semibold text-amber-300">{boss.nameTh}</span>
                <span className="text-stone-500">({boss.nameEn || boss.nameTh})</span>
                <span className="text-stone-600">•</span>
                <span className="text-sky-300 font-medium">{boss.serverName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm text-stone-200">
          {/* 1. Boss Information & Current Status Panel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>ข้อมูลและสถานะบอสปัจจุบันในระบบ</span>
              </span>
              {boss.location && (
                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>{boss.location}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Card 1: เวลาตายล่าสุด */}
              <div className="p-3 rounded-xl bg-[#080d19] border border-[#182746] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="flex items-center gap-1 font-semibold text-rose-300">
                    <Skull className="w-3.5 h-3.5 text-rose-400" />
                    <span>เวลาตายล่าสุด</span>
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-rose-200 truncate">
                  {formatDateTime(boss.lastKilledAt)}
                </div>
                <div className="text-[10px] text-stone-400">
                  {lastKilledDiff ? (
                    <span className="text-stone-400">{lastKilledDiff.text}</span>
                  ) : (
                    <span className="text-stone-500">ยังไม่มีประวัติตาย</span>
                  )}
                  {boss.updatedBy && (
                    <span className="text-stone-500 truncate block">
                      โดย: {boss.updatedBy}
                    </span>
                  )}
                </div>
              </div>

              {/* Card 2: เวลาเกิดปัจจุบัน */}
              <div className="p-3 rounded-xl bg-[#080d19] border border-[#182746] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="flex items-center gap-1 font-semibold text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>เวลาเกิดปัจจุบัน</span>
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-emerald-300 truncate">
                  {formatDateTime(boss.nextSpawnAt)}
                </div>
                <div className="text-[10px]">
                  {currentSpawnDiff ? (
                    currentSpawnDiff.isPast ? (
                      <span className="text-amber-400 font-semibold">
                        🔴 เกิดแล้ว ({currentSpawnDiff.text})
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium">
                        🟢 {currentSpawnDiff.text}
                      </span>
                    )
                  ) : (
                    <span className="text-stone-500">ยังไม่ทราบเวลาเกิด</span>
                  )}
                </div>
              </div>

              {/* Card 3: คูลดาวน์ */}
              <div className="p-3 rounded-xl bg-[#080d19] border border-[#182746] space-y-1">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="flex items-center gap-1 font-semibold text-amber-300">
                    <Hourglass className="w-3.5 h-3.5 text-amber-400" />
                    <span>คูลดาวน์บอส</span>
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-amber-300">
                  {formatHoursAndMinutes(boss.cooldownHours)} ({boss.cooldownHours} ชม.)
                </div>
                <div className="text-[10px] text-stone-400">
                  {boss.rebootHours ? (
                    <span className="text-sky-300 flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 text-sky-400" />
                      <span>รีบูท: {boss.rebootHours} ชม.</span>
                    </span>
                  ) : (
                    <span className="text-stone-500">ไม่มีรอบรีบูทพิเศษ</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#16233f]" />

          {/* 2. Custom Kill Time Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rose-400" />
                  <span>ระบุวันและเวลาที่บอสตายรอบใหม่:</span>
                </label>
                {boss.lastKilledAt && (
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(boss.lastKilledAt!);
                      const pad = (n: number) => n.toString().padStart(2, '0');
                      setDeathDateTimeStr(
                        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
                          d.getHours()
                        )}:${pad(d.getMinutes())}`
                      );
                    }}
                    className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    ใช้เวลาตายล่าสุด
                  </button>
                )}
              </div>

              <input
                type="datetime-local"
                value={deathDateTimeStr}
                onChange={(e) => setDeathDateTimeStr(e.target.value)}
                required
                className="w-full bg-[#080d19] border border-[#1b2b4e] rounded-xl px-3.5 py-2.5 text-stone-100 font-mono text-sm focus:outline-none focus:border-rose-500 shadow-inner"
              />

              {/* Quick adjust by minutes */}
              <div className="mt-3 space-y-1.5">
                <div className="text-[11px] text-stone-400">
                  ปุ่มปรับเพิ่ม / ลดเวลาตายอย่างรวดเร็ว:
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => adjustCurrentMinutes(-10)}
                    className="px-2 py-1.5 rounded-lg bg-[#141f38] hover:bg-[#1e2f55] text-rose-300 border border-[#213560] cursor-pointer flex items-center justify-center gap-0.5 transition-colors"
                  >
                    <Minus className="w-3 h-3 text-rose-400" /> 10 น.
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustCurrentMinutes(-5)}
                    className="px-2 py-1.5 rounded-lg bg-[#141f38] hover:bg-[#1e2f55] text-rose-300 border border-[#213560] cursor-pointer flex items-center justify-center gap-0.5 transition-colors"
                  >
                    <Minus className="w-3 h-3 text-rose-400" /> 5 น.
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustCurrentMinutes(-1)}
                    className="px-2 py-1.5 rounded-lg bg-[#141f38] hover:bg-[#1e2f55] text-rose-300 border border-[#213560] cursor-pointer flex items-center justify-center gap-0.5 transition-colors"
                  >
                    <Minus className="w-3 h-3 text-rose-400" /> 1 น.
                  </button>
                  <button
                    type="button"
                    onClick={() => setOffsetMinutes(0)}
                    className="px-2 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 cursor-pointer text-center transition-colors"
                  >
                    เวลานี้
                  </button>

                  <button
                    type="button"
                    onClick={() => adjustCurrentMinutes(1)}
                    className="px-2 py-1.5 rounded-lg bg-[#141f38] hover:bg-[#1e2f55] text-emerald-300 border border-[#213560] cursor-pointer flex items-center justify-center gap-0.5 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" /> 1 น.
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustCurrentMinutes(5)}
                    className="px-2 py-1.5 rounded-lg bg-[#141f38] hover:bg-[#1e2f55] text-emerald-300 border border-[#213560] cursor-pointer flex items-center justify-center gap-0.5 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" /> 5 น.
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustCurrentMinutes(10)}
                    className="px-2 py-1.5 rounded-lg bg-[#141f38] hover:bg-[#1e2f55] text-emerald-300 border border-[#213560] cursor-pointer flex items-center justify-center gap-0.5 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" /> 10 น.
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustCurrentMinutes(30)}
                    className="px-2 py-1.5 rounded-lg bg-[#141f38] hover:bg-[#1e2f55] text-emerald-300 border border-[#213560] cursor-pointer flex items-center justify-center gap-0.5 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" /> 30 น.
                  </button>
                </div>
              </div>
            </div>

            {/* 3. New Calculated Spawn Preview Box */}
            <div className="p-3.5 rounded-xl bg-[#080d19] border border-emerald-500/30 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>เวลาเกิดรอบถัดไป (คำนวณอัตโนมัติ):</span>
                </span>
                <span className="font-mono text-xs text-amber-300 font-bold">
                  + {formatHoursAndMinutes(boss.cooldownHours)}
                </span>
              </div>
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <div className="font-mono text-base font-black text-emerald-400">
                  {nextSpawnInfo.text}
                </div>
                <div className="text-xs text-stone-400 font-medium">
                  {nextSpawnInfo.diffText}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-rose-950/50 transition-all cursor-pointer disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                <span>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกเวลาตาย'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
