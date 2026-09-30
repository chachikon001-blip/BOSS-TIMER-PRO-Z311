import React, { useState } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { ServerFilter } from '../types';

interface AddBossModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBoss: (newBoss: {
    nameTh: string;
    nameEn: string;
    cooldownHours: number;
    rebootHours: number | null;
    targetServer: ServerFilter;
  }) => Promise<void>;
  defaultServer: ServerFilter;
}

export const AddBossModal: React.FC<AddBossModalProps> = ({
  isOpen,
  onClose,
  onAddBoss,
  defaultServer,
}) => {
  const [nameTh, setNameTh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [cooldownHours, setCooldownHours] = useState('8');
  const [cooldownMinutes, setCooldownMinutes] = useState('0');
  const [rebootHours, setRebootHours] = useState('');
  const [rebootMinutes, setRebootMinutes] = useState('');
  const [targetServer, setTargetServer] = useState<ServerFilter>(
    defaultServer === 'all' ? 'all' : defaultServer
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameTh.trim()) {
      alert('กรุณากรอกชื่อบอสภาษาไทย');
      return;
    }

    const h = parseFloat(cooldownHours || '0');
    const m = parseFloat(cooldownMinutes || '0');
    const totalCd = h + m / 60;
    if (isNaN(totalCd) || totalCd <= 0) {
      alert('กรุณากรอกคูลดาวน์ให้ถูกต้อง (ต้องมากกว่า 0 นาที)');
      return;
    }

    let totalRb: number | null = null;
    if (rebootHours.trim() || rebootMinutes.trim()) {
      const rh = parseFloat(rebootHours || '0');
      const rm = parseFloat(rebootMinutes || '0');
      totalRb = rh + rm / 60;
      if (isNaN(totalRb) || totalRb < 0) {
        alert('กรุณากรอกเวลารีบูทให้ถูกต้อง');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onAddBoss({
        nameTh: nameTh.trim(),
        nameEn: nameEn.trim() || nameTh.trim(),
        cooldownHours: Number(totalCd.toFixed(2)),
        rebootHours: totalRb !== null ? Number(totalRb.toFixed(2)) : null,
        targetServer,
      });
      setNameTh('');
      setNameEn('');
      setCooldownHours('8');
      setCooldownMinutes('0');
      setRebootHours('');
      setRebootMinutes('');
      onClose();
    } catch (err: any) {
      alert('เพิ่มบอสไม่สำเร็จ: ' + (err?.message || 'โปรดลองใหม่อีกครั้ง'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">เพิ่มบอสใหม่ในระบบ</h2>
              <p className="text-xs text-stone-400">สร้างบอสเพื่อจับเวลาในเซิร์ฟเวอร์</p>
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
              ชื่อบอส (ภาษาไทย) *
            </label>
            <input
              type="text"
              required
              placeholder="เช่น บอสกิจกรรม, กิลด์บอส"
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3.5 py-2 text-stone-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
              ชื่อบอส (ภาษาอังกฤษ / ฉายา)
            </label>
            <input
              type="text"
              placeholder="เช่น Event Boss, King Dragon"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3.5 py-2 text-stone-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Cooldown & Reboot Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Cooldown Duration */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                คูลดาวน์ปกติ *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="ชม."
                    value={cooldownHours}
                    onChange={(e) => setCooldownHours(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg pl-2.5 pr-8 py-2 text-stone-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    ชม.
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="นาที"
                    value={cooldownMinutes}
                    onChange={(e) => setCooldownMinutes(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg pl-2.5 pr-9 py-2 text-stone-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    นาที
                  </span>
                </div>
              </div>
            </div>

            {/* Reboot Duration */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1">
                เวลารีบูท <span className="text-stone-500 text-[10px]">(ไม่ระบุก็ได้)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="ชม."
                    value={rebootHours}
                    onChange={(e) => setRebootHours(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg pl-2.5 pr-8 py-2 text-stone-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    ชม.
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="นาที"
                    value={rebootMinutes}
                    onChange={(e) => setRebootMinutes(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg pl-2.5 pr-9 py-2 text-stone-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    นาที
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
              เพิ่มในเซิร์ฟเวอร์
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetServer('server_1')}
                className={`py-2 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  targetServer === 'server_1'
                    ? 'bg-sky-600 border-sky-400 text-white'
                    : 'bg-stone-800 border-stone-700 text-stone-300'
                }`}
              >
                เซิร์ฟเวอร์ 1
              </button>
              <button
                type="button"
                onClick={() => setTargetServer('server_2')}
                className={`py-2 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  targetServer === 'server_2'
                    ? 'bg-purple-600 border-purple-400 text-white'
                    : 'bg-stone-800 border-stone-700 text-stone-300'
                }`}
              >
                เซิร์ฟเวอร์ 2
              </button>
              <button
                type="button"
                onClick={() => setTargetServer('all')}
                className={`py-2 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  targetServer === 'all'
                    ? 'bg-amber-600 border-amber-400 text-white'
                    : 'bg-stone-800 border-stone-700 text-stone-300'
                }`}
              >
                ทั้งสองเซิร์ฟเวอร์
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
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
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังเพิ่ม...' : 'เพิ่มบอส'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
