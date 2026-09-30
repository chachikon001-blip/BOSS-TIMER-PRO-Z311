import React, { useState } from 'react';
import { BossRecord } from '../types';
import { X, Check, Trash2, Edit3 } from 'lucide-react';

interface EditBossModalProps {
  boss: BossRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: BossRecord) => Promise<void>;
  onDelete?: (bossId: string) => Promise<void>;
}

export const EditBossModal: React.FC<EditBossModalProps> = ({
  boss,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!isOpen || !boss) return null;

  // Split cooldown into hours and minutes
  const initialCdH = Math.floor(boss.cooldownHours);
  const initialCdM = Math.round((boss.cooldownHours - initialCdH) * 60);

  const initialRbH = boss.rebootHours != null ? Math.floor(boss.rebootHours) : '';
  const initialRbM = boss.rebootHours != null ? Math.round((boss.rebootHours - Math.floor(boss.rebootHours)) * 60) : '';

  const [nameTh, setNameTh] = useState(boss.nameTh);
  const [nameEn, setNameEn] = useState(boss.nameEn || '');
  const [location, setLocation] = useState(boss.location || 'ตามแมพ / พื้นที่ล่า');
  const [cooldownHours, setCooldownHours] = useState(initialCdH.toString());
  const [cooldownMinutes, setCooldownMinutes] = useState(initialCdM.toString());
  const [rebootHours, setRebootHours] = useState(initialRbH.toString());
  const [rebootMinutes, setRebootMinutes] = useState(initialRbM.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(cooldownHours || '0');
    const m = parseFloat(cooldownMinutes || '0');
    const cd = h + m / 60;
    if (isNaN(cd) || cd <= 0) {
      alert('กรุณากรอกคูลดาวน์ให้ถูกต้อง');
      return;
    }

    let rb: number | null = null;
    if (rebootHours.trim() || rebootMinutes.trim()) {
      const rh = parseFloat(rebootHours || '0');
      const rm = parseFloat(rebootMinutes || '0');
      rb = rh + rm / 60;
      if (isNaN(rb) || rb < 0) {
        alert('กรุณากรอกเวลารีบูทให้ถูกต้อง');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSave({
        ...boss,
        nameTh: nameTh.trim(),
        nameEn: nameEn.trim() || undefined,
        location: location.trim(),
        cooldownHours: Number(cd.toFixed(2)),
        rebootHours: rb !== null ? Number(rb.toFixed(2)) : null,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      alert('แก้ไขไม่สำเร็จ: ' + (err?.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`ต้องการลบบอส ${boss.nameTh} หรือไม่?`)) return;
    if (onDelete) {
      await onDelete(boss.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#0e1628] border border-[#1b2b4e] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4 border-b border-[#182645] pb-3">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">แก้ไขข้อมูลบอส</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              ชื่อบอส (ภาษาไทย)
            </label>
            <input
              type="text"
              required
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              className="w-full bg-[#080d18] border border-[#1e2f55] rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              ชื่อบอส (ภาษาอังกฤษ)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full bg-[#080d18] border border-[#1e2f55] rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              สถานที่ / จุดเกิด
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#080d18] border border-[#1e2f55] rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
              placeholder="เช่น ตามแมพ / พื้นที่ล่า"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                คูลดาวน์ปกติ
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="ชม."
                    value={cooldownHours}
                    onChange={(e) => setCooldownHours(e.target.value)}
                    className="w-full bg-[#080d18] border border-[#1e2f55] rounded-lg pl-2.5 pr-8 py-2 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-[#080d18] border border-[#1e2f55] rounded-lg pl-2.5 pr-9 py-2 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    นาที
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
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
                    className="w-full bg-[#080d18] border border-[#1e2f55] rounded-lg pl-2.5 pr-8 py-2 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-[#080d18] border border-[#1e2f55] rounded-lg pl-2.5 pr-9 py-2 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
                    นาที
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#182645]">
            {boss.isCustom ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> ลบบอส
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs font-medium hover:bg-stone-700 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> บันทึก
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
