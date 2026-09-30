import React from 'react';
import { BossRecord } from '../types';
import { BossTableRow } from './BossTableRow';
import { Star, RotateCcw, Swords } from 'lucide-react';

interface BossTableProps {
  bosses: BossRecord[];
  currentTime: Date;
  onQuickKill: (boss: BossRecord) => void;
  onCustomTime: (boss: BossRecord) => void;
  onResetTime: (boss: BossRecord) => void;
  onResetAllTimes: () => void;
  onToggleFavorite: (boss: BossRecord) => void;
  onTestVoice: (boss: BossRecord) => void;
  onEditBoss?: (boss: BossRecord) => void;
  onReloadDefaults?: () => void;
  onUpdateSpawnTime?: (boss: BossRecord, newSpawnDate: Date) => void;
}

export const BossTable: React.FC<BossTableProps> = ({
  bosses,
  currentTime,
  onQuickKill,
  onCustomTime,
  onResetTime,
  onResetAllTimes,
  onToggleFavorite,
  onTestVoice,
  onEditBoss,
  onReloadDefaults,
  onUpdateSpawnTime,
}) => {
  if (bosses.length === 0) {
    return (
      <div className="p-12 text-center bg-[#0d1424] rounded-2xl border border-[#1b2b4e] my-4">
        <Swords className="w-12 h-12 text-stone-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-300">ไม่พบบอสที่ตรงกับเงื่อนไขการค้นหา</h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
          ลองค้นหาด้วยคำอื่น หรือเปลี่ยนตัวกรองเซิร์ฟเวอร์ / สถานะ
        </p>
        {onReloadDefaults && (
          <button
            onClick={onReloadDefaults}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow cursor-pointer transition-colors"
          >
            🔄 รีโหลดรายชื่อบอสเริ่มต้น 90 ตัว
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#16233f] overflow-hidden bg-[#0a0f1d] shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#16233f] bg-[#0c1222] text-xs font-semibold text-stone-400">
              {/* Star Column */}
              <th className="w-12 px-4 py-3.5 text-center">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 mx-auto" />
              </th>

              {/* Boss / Server Column */}
              <th className="px-4 py-3.5 tracking-wider">
                <span>ชื่อบอส / เซิร์ฟเวอร์</span>
              </th>

              {/* Spawn Time Column */}
              <th className="px-4 py-3.5 text-center tracking-wider min-w-[200px]">
                <div className="inline-flex items-center gap-2">
                  <span>เวลาเกิด GMT+7</span>
                  <span className="text-[10px] text-stone-500 font-normal">(แก้ไขได้)</span>
                  <button
                    onClick={onResetAllTimes}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 text-[10px] font-bold border border-rose-800/60 cursor-pointer transition-colors"
                    title="ล้างเวลาบอสที่กำลังแสดงทั้งหมดเป็น --:-- น."
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>รีเซ็ตทั้งหมด</span>
                  </button>
                </div>
              </th>

              {/* Update Time Column */}
              <th className="px-4 py-3.5 text-center tracking-wider min-w-[180px]">
                <span>อัปเดตเวลา</span>{' '}
                <span className="text-[10px] text-stone-500 font-normal">
                  (เวลาล่าสุด + รอบเกิด)
                </span>
              </th>

              {/* Tools Column */}
              <th className="w-24 px-4 py-3.5 text-center tracking-wider">
                <span>เครื่องมือ</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#141d33]">
            {bosses.map((boss) => (
              <BossTableRow
                key={boss.id}
                boss={boss}
                currentTime={currentTime}
                onQuickKill={onQuickKill}
                onCustomTime={onCustomTime}
                onResetTime={onResetTime}
                onToggleFavorite={onToggleFavorite}
                onTestVoice={onTestVoice}
                onEditBoss={onEditBoss}
                onUpdateSpawnTime={onUpdateSpawnTime}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
