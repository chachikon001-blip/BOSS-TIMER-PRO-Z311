import React, { useState } from 'react';
import { RotateCcw, X, AlertTriangle, Send, Calendar, Clock } from 'lucide-react';
import { ServerFilter } from '../types';

interface RebootModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReboot: (
    targetServer: ServerFilter,
    rebootDate: Date,
    sendDiscordAlert: boolean
  ) => Promise<void>;
  currentFilter: ServerFilter;
}

export const RebootModal: React.FC<RebootModalProps> = ({
  isOpen,
  onClose,
  onConfirmReboot,
  currentFilter,
}) => {
  // Format local date-time string YYYY-MM-DDTHH:mm
  const getInitialLocalDateTime = () => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const [targetServer, setTargetServer] = useState<ServerFilter>(
    currentFilter === 'all' ? 'all' : currentFilter
  );
  const [rebootDateTimeStr, setRebootDateTimeStr] = useState<string>(getInitialLocalDateTime());
  const [sendDiscordAlert, setSendDiscordAlert] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const setOffsetMinutes = (mins: number) => {
    const d = new Date(Date.now() - mins * 60 * 1000);
    const pad = (n: number) => n.toString().padStart(2, '0');
    setRebootDateTimeStr(
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosenDate = new Date(rebootDateTimeStr);
    if (isNaN(chosenDate.getTime())) {
      alert('กรุณาระบุวันและเวลาที่ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmReboot(targetServer, chosenDate, sendDiscordAlert);
      onClose();
    } catch (err: any) {
      console.error('Reboot execution failed:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกการรีบูท: ' + (err?.message || 'โปรดลองใหม่อีกครั้ง'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg border border-purple-500/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">บันทึกเวลารีบูทเซิร์ฟเวอร์เสร็จสิ้น</h2>
              <p className="text-xs text-stone-400">
                ล้างเวลาเก่าทั้งหมด และคำนวณรอบเกิดตามตารางรีบูท
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Server Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-2">
              เลือกเซิร์ฟเวอร์ที่รีบูท
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetServer('server_1')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  targetServer === 'server_1'
                    ? 'bg-sky-600 border-sky-400 text-white'
                    : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
                }`}
              >
                เซิร์ฟเวอร์ 1
              </button>
              <button
                type="button"
                onClick={() => setTargetServer('server_2')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  targetServer === 'server_2'
                    ? 'bg-purple-600 border-purple-400 text-white'
                    : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
                }`}
              >
                เซิร์ฟเวอร์ 2
              </button>
              <button
                type="button"
                onClick={() => setTargetServer('all')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  targetServer === 'all'
                    ? 'bg-amber-600 border-amber-400 text-white'
                    : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
                }`}
              >
                ทั้งสองเซิร์ฟเวอร์
              </button>
            </div>
          </div>

          {/* DateTime Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-2">
              เวลารีบูทเสร็จสิ้น (วันที่และเวลา)
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={rebootDateTimeStr}
                onChange={(e) => setRebootDateTimeStr(e.target.value)}
                required
                className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3.5 py-2.5 text-stone-100 font-mono text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Quick offset buttons */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs">
              <span className="text-stone-400">ลัดเวลา:</span>
              <button
                type="button"
                onClick={() => setOffsetMinutes(0)}
                className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer"
              >
                ตอนนี้
              </button>
              <button
                type="button"
                onClick={() => setOffsetMinutes(5)}
                className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer"
              >
                5 นาทีก่อน
              </button>
              <button
                type="button"
                onClick={() => setOffsetMinutes(15)}
                className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer"
              >
                15 นาทีก่อน
              </button>
              <button
                type="button"
                onClick={() => setOffsetMinutes(30)}
                className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 cursor-pointer"
              >
                30 นาทีก่อน
              </button>
            </div>
          </div>

          {/* Logic explanation info box */}
          <div className="p-3.5 rounded-lg bg-stone-950/80 border border-stone-800 text-xs text-stone-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>การคำนวณตามสูตรรีบูทของระบบ</span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              • บอสที่มีเวลารีบูท <b>(27 ตัว)</b> เช่น ซาบัน (6h), มด 3 (14h), เคลซอส (6h), DB (14h), ออร์เฟน (14h) ฯลฯ จะนำเวลานี้มาบวกทันที
            </p>
            <p className="text-stone-400 leading-relaxed">
              • บอสที่ไม่มีในรายการรีบูท จะถูกตั้งค่าเป็น <span className="font-mono text-stone-300 bg-stone-800 px-1.5 py-0.5 rounded">--:-- น.</span> เพื่อรอผู้เล่นไปเช็คหรือบันทึกเวลาจริง
            </p>
          </div>

          {/* Discord Alert toggle */}
          <label className="flex items-center gap-2.5 text-xs text-stone-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sendDiscordAlert}
              onChange={(e) => setSendDiscordAlert(e.target.checked)}
              className="w-4 h-4 rounded bg-stone-800 border-stone-700 text-purple-600 focus:ring-purple-500"
            />
            <span className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-indigo-400" /> ส่งข้อความแจ้งเตือนการรีบูทเข้า Discord อัตโนมัติ
            </span>
          </label>

          {/* Action buttons */}
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
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'กำลังคำนวณและอัปเดต...' : 'ยืนยันรีบูทเสร็จ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
