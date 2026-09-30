import React, { useState } from 'react';
import { BossRecord } from '../types';
import { X, Clock, Skull, Plus, Minus } from 'lucide-react';
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

  // Preview next spawn time
  const previewSpawnTime = () => {
    const killedDate = new Date(deathDateTimeStr);
    if (isNaN(killedDate.getTime())) return '--:-- น.';
    const spawnDate = new Date(killedDate.getTime() + boss.cooldownHours * 3600 * 1000);
    return (
      spawnDate.toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' น.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-600/20 text-rose-400 rounded-lg border border-rose-500/30">
              <Skull className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ระบุเวลาตายของบอส</h2>
              <p className="text-xs text-stone-400">
                {boss.nameTh} ({boss.nameEn || boss.nameTh}) • {boss.serverName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-2">
              เวลาที่บอสตายจริง
            </label>
            <input
              type="datetime-local"
              value={deathDateTimeStr}
              onChange={(e) => setDeathDateTimeStr(e.target.value)}
              required
              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3.5 py-2.5 text-stone-100 font-mono text-sm focus:outline-none focus:border-rose-500"
            />

            {/* Quick adjust by minutes */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>ปรับเพิ่ม/ลดจำนวนนาที:</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => adjustCurrentMinutes(-10)}
                  className="px-2 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer flex items-center justify-center gap-0.5"
                >
                  <Minus className="w-3 h-3 text-rose-400" /> 10 น.
                </button>
                <button
                  type="button"
                  onClick={() => adjustCurrentMinutes(-5)}
                  className="px-2 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer flex items-center justify-center gap-0.5"
                >
                  <Minus className="w-3 h-3 text-rose-400" /> 5 น.
                </button>
                <button
                  type="button"
                  onClick={() => adjustCurrentMinutes(-1)}
                  className="px-2 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer flex items-center justify-center gap-0.5"
                >
                  <Minus className="w-3 h-3 text-rose-400" /> 1 น.
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetMinutes(0)}
                  className="px-2 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 font-semibold border border-stone-700 cursor-pointer text-center"
                >
                  เวลานี้
                </button>

                <button
                  type="button"
                  onClick={() => adjustCurrentMinutes(1)}
                  className="px-2 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer flex items-center justify-center gap-0.5"
                >
                  <Plus className="w-3 h-3 text-emerald-400" /> 1 น.
                </button>
                <button
                  type="button"
                  onClick={() => adjustCurrentMinutes(5)}
                  className="px-2 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer flex items-center justify-center gap-0.5"
                >
                  <Plus className="w-3 h-3 text-emerald-400" /> 5 น.
                </button>
                <button
                  type="button"
                  onClick={() => adjustCurrentMinutes(10)}
                  className="px-2 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer flex items-center justify-center gap-0.5"
                >
                  <Plus className="w-3 h-3 text-emerald-400" /> 10 น.
                </button>
                <button
                  type="button"
                  onClick={() => adjustCurrentMinutes(30)}
                  className="px-2 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer flex items-center justify-center gap-0.5"
                >
                  <Plus className="w-3 h-3 text-emerald-400" /> 30 น.
                </button>
              </div>
            </div>
          </div>

          {/* Cooldown preview calculation */}
          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>คูลดาวน์เกิดใหม่:</span>
              <span className="font-mono text-amber-300 font-semibold">
                {formatHoursAndMinutes(boss.cooldownHours)} ({boss.cooldownHours} ชม.)
              </span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>เวลาเกิดรอบถัดไป:</span>
              <span className="font-mono text-emerald-400 font-bold">{previewSpawnTime()}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกเวลาตาย'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
