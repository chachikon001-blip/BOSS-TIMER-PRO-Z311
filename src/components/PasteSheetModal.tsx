import React, { useState, useMemo } from 'react';
import { BossRecord } from '../types';
import { parseSheetData } from '../utils/sheetParser';
import {
  X,
  ClipboardPaste,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Shield,
  Swords,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface PasteSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  bosses: BossRecord[];
  currentServerFilter: string;
  server1Name: string;
  server1Tag: string;
  server2Name: string;
  server2Tag: string;
  onApplyImport: (
    updates: {
      bossId: string;
      nextSpawnAt: string | null;
      lastKilledAt: string | null;
      cooldownHours?: number;
    }[]
  ) => Promise<void>;
}

const SAMPLE_SHEET_DATA = `เฟลิส - Felis 	2	03/10/2026	10	26
คาทาน - Katan	8	03/10/2026	4	29
ทาลาคิน - Talakin	7	03/10/2026	5	59
บาซิลา - Basila 	2.5	03/10/2026	10	48
มาทูรา - Matura 	4	03/10/2026	9	54
เชอร์ทูบา - Chertuba 	3	03/10/2026	11	2
พันนาโรด - Pannarod 	3	03/10/2026	11	25
ทัลคิน - Talkin	5	03/10/2026	10	17
เรปิโร - Repiro	5	03/10/2026	10	21
เบรก้า - Breka 	4	03/10/2026	11	24
เทมเพสต์  - Valefar	3.5	03/10/2026	11	56
สตัน	4	03/10/2026	11	32
พัน ดรายด์ - Pan'Dra'eed	8	03/10/2026	7	37
เอนคูรา - Enkura 	3.5	03/10/2026	12	14
โครูน - Coroon	10	03/10/2026	5	50
แกเร็ธ - Gahareth	6	03/10/2026	9	51
ซาบัน - Savan	12	03/10/2026	3	54
ฟลินท์ - Flynt	8	03/10/2026	7	58
ฮิซิโลเม - Hisilrome	6	03/10/2026	10	2
แลนเดอร์ - Landor	8	03/10/2026	8	5
เบฮีมอธ - Behemoth 	6	03/10/2026	10	13
ทิมิทริส -Timitris	5	03/10/2026	11	15
ซาร์ก้า - Sarka	7	03/10/2026	10	15
เมดูซ่า - Medusa	7	03/10/2026	10	48
มด 3- Ant3 	6	03/10/2026	11	49
เซลลู - Selu	7.5	03/10/2026	10	54
แอนดราส - Andras	12	03/10/2026	7	46
บัลโบ - BalBo	8	03/10/2026	11	49
ลิลลี่ - Lily	12	03/10/2026	7	54
คาบริโอ -  Cabrio 	12	03/10/2026	7	55
กระจก - Mirror	12	03/10/2026	7	57
ครูม่าหนองน้ำ - Mutated Cruma	8	03/10/2026	12	2
ซามูเอล - Samuel	12	03/10/2026	8	12
ทิมิเนล - Timiniel  	8	03/10/2026	12	20
ครูม่าปนเปื้อน - Cruma4	8	03/10/2026	12	24
กลากิ -  Glaki	8	03/10/2026	12	25
คอร์ซัสเซปเตอร์ - Core 	12	03/10/2026	11	58
ดราก้อนบีสต์ - DB	12	03/10/2026	12	29
ฮาร์ป - Haff	24	03/10/2026	7	46
ออร์เฟน - Orfen	24	03/10/2026	11	51
โอล์คุส - Olkuth	24	03/10/2026	12	8
ทรอมบา - Tromba	4.5	30/09/2026		
เคลซอส - Kelsus 	6	30/09/2026		
ทานาทอส - Tanatos	24	30/09/2026		
ลาฮา - Rahha	33	26/09/2026`;

export const PasteSheetModal: React.FC<PasteSheetModalProps> = ({
  isOpen,
  onClose,
  bosses,
  currentServerFilter,
  server1Name,
  server1Tag,
  server2Name,
  server2Tag,
  onApplyImport,
}) => {
  const [inputText, setInputText] = useState('');
  const [targetServer, setTargetServer] = useState<'server_1' | 'server_2' | 'all'>(
    currentServerFilter === 'server_2' ? 'server_2' : 'server_1'
  );
  const [timeType, setTimeType] = useState<'spawn' | 'kill'>('kill');
  const [autoRollNextRound, setAutoRollNextRound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Target bosses to match against based on server selection
  const candidateBosses = useMemo(() => {
    if (targetServer === 'all') return bosses;
    return bosses.filter((b) => b.serverId === targetServer);
  }, [bosses, targetServer]);

  // Real-time parse of the pasted text (หาเวลาเกิดให้ทันที)
  const parsedItems = useMemo(() => {
    return parseSheetData(inputText, candidateBosses, timeType, autoRollNextRound);
  }, [inputText, candidateBosses, timeType, autoRollNextRound]);

  const stats = useMemo(() => {
    const totalLines = parsedItems.length;
    const matchedCount = parsedItems.filter((p) => p.status === 'matched').length;
    const noTimeCount = parsedItems.filter((p) => p.status === 'no_time').length;
    const notFoundCount = parsedItems.filter((p) => p.status === 'not_found').length;
    return { totalLines, matchedCount, noTimeCount, notFoundCount };
  }, [parsedItems]);

  if (!isOpen) return null;

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
      }
    } catch (err) {
      alert('ไม่สามารถอ่านจากคลิปบอร์ดได้ กรุณากดคลิกในกล่องข้อความแล้วกด Ctrl + V');
    }
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_SHEET_DATA);
  };

  const handleSave = async () => {
    if (parsedItems.length === 0) return;

    setIsSubmitting(true);
    try {
      const updates: {
        bossId: string;
        nextSpawnAt: string | null;
        lastKilledAt: string | null;
        cooldownHours?: number;
      }[] = [];

      for (const item of parsedItems) {
        if (!item.matchedBossId || !item.originalBoss) continue;

        const boss = item.originalBoss;
        const cooldown = item.cooldownHours || boss.cooldownHours;
        const targetSpawn = item.effectiveSpawnDate || item.calculatedSpawnDate;
        const targetDeath = item.deathDate;

        if (targetSpawn) {
          const lastKilledStr = targetDeath
            ? targetDeath.toISOString()
            : new Date(targetSpawn.getTime() - cooldown * 3600 * 1000).toISOString();

          updates.push({
            bossId: boss.id,
            nextSpawnAt: targetSpawn.toISOString(),
            lastKilledAt: lastKilledStr,
            cooldownHours: cooldown,
          });
        } else if (item.status === 'no_time') {
          // Date with no time (e.g. Tromba, Kelsus) -> set nextSpawnAt to null
          updates.push({
            bossId: boss.id,
            nextSpawnAt: null,
            lastKilledAt: item.dateStr ? new Date().toISOString() : null,
            cooldownHours: cooldown,
          });
        }
      }

      await onApplyImport(updates);
      onClose();
    } catch (e: any) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (e?.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-[#0a0f1d] border border-[#1b2b4e] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#16233f] bg-[#0d1424] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>วางข้อมูลบอสจากชีต (Import from Google Sheets)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Auto-Detect
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                คัดลอกตารางจาก Google Sheets หรือ Excel แล้วนำมากดวางได้ทันที ระบบจะจับคู่บอสและเวลาให้อัตโนมัติ
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
          {/* Top Options Bar: Target Server & Time Meaning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Target Server */}
            <div className="p-3.5 rounded-xl bg-[#0e1628] border border-[#1a2948] space-y-2">
              <label className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-sky-400" />
                <span>1. เซิร์ฟเวอร์เป้าหมายที่จะนำเข้า:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetServer('server_1')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    targetServer === 'server_1'
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-950/40 border border-sky-400'
                      : 'bg-[#141f38] text-stone-300 hover:bg-[#1a2848] border border-[#1e3057]'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="truncate">{server1Tag || 'เซิร์ฟหลัก'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetServer('server_2')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    targetServer === 'server_2'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40 border border-purple-400'
                      : 'bg-[#141f38] text-stone-300 hover:bg-[#1a2848] border border-[#1e3057]'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span className="truncate">{server2Tag || 'เซิร์ฟรอง'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetServer('all')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    targetServer === 'all'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40 border border-amber-400'
                      : 'bg-[#141f38] text-stone-300 hover:bg-[#1a2848] border border-[#1e3057]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>ทั้ง 2 เซิร์ฟ</span>
                </button>
              </div>
            </div>

            {/* 2. Time Mode */}
            <div className="p-3.5 rounded-xl bg-[#0e1628] border border-[#1a2948] space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>2. ข้อมูลเวลาในชีตคือ:</span>
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-stone-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoRollNextRound}
                    onChange={(e) => setAutoRollNextRound(e.target.checked)}
                    className="rounded border-stone-600 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span>🔄 หากรอบเกิดผ่านไปแล้ว ให้หารอบถัดไปทันที</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTimeType('kill')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    timeType === 'kill'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40 border border-emerald-400'
                      : 'bg-[#141f38] text-stone-300 hover:bg-[#1a2848] border border-[#1e3057]'
                  }`}
                >
                  <span>💀 เวลาบอสตาย 👉 หาเวลาเกิดทันที (+คูลดาวน์)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTimeType('spawn')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    timeType === 'spawn'
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-950/40 border border-sky-400'
                      : 'bg-[#141f38] text-stone-300 hover:bg-[#1a2848] border border-[#1e3057]'
                  }`}
                >
                  <span>🎯 เวลาในชีตคือเวลาเกิดอยู่แล้ว</span>
                </button>
              </div>
            </div>
          </div>

          {/* Textarea Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <span>วางข้อมูลตารางจาก Google Sheets หรือ Excel (กด Ctrl+V):</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="px-2.5 py-1 rounded-lg bg-[#141f38] hover:bg-[#1e2f55] text-sky-300 text-xs font-semibold border border-[#213560] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>วางจากคลิปบอร์ด</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ใส่ตัวอย่างชีต (45 บอส)</span>
                </button>
                {inputText && (
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-rose-950/80 text-stone-400 hover:text-rose-300 text-xs transition-colors cursor-pointer"
                  >
                    ล้าง
                  </button>
                )}
              </div>
            </div>

            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`ตัวอย่างเช่น:
เฟลิส - Felis 	2	03/10/2026	10	26
คาทาน - Katan	8	03/10/2026	4	29
ทาลาคิน - Talakin	7	03/10/2026	5	59
ทรอมบา - Tromba	4.5	30/09/2026`}
              className="w-full bg-[#080d19] border border-[#1b2b4e] rounded-xl p-3 text-xs text-stone-100 font-mono focus:outline-none focus:border-emerald-500 leading-relaxed shadow-inner"
            />
          </div>

          {/* Real-time Detection Summary */}
          {inputText.trim() && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl bg-[#0d1628] border border-[#1b2b4e]">
                <div className="flex items-center gap-3 flex-wrap text-xs">
                  <span className="font-bold text-stone-200">
                    📊 ผลการตรวจจับ: {stats.totalLines} แถว
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    ⚡ หาเวลาเกิดได้ {stats.matchedCount} ตัว
                  </span>
                  {stats.noTimeCount > 0 && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                      ⏳ รอระบุเวลา {stats.noTimeCount} ตัว
                    </span>
                  )}
                  {stats.notFoundCount > 0 && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30">
                      ❌ ไม่พบบอส {stats.notFoundCount} ตัว
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-[#16233f] rounded-xl overflow-hidden max-h-56 overflow-y-auto bg-[#070b14]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#0e1628] text-stone-400 sticky top-0 border-b border-[#16233f]">
                    <tr>
                      <th className="px-3 py-2 w-10 text-center">#</th>
                      <th className="px-3 py-2">ข้อความในชีต</th>
                      <th className="px-3 py-2">บอสในระบบ</th>
                      <th className="px-3 py-2 text-center">เวลาตาย (ชีต)</th>
                      <th className="px-3 py-2 text-center">คูลดาวน์</th>
                      <th className="px-3 py-2 text-center">🎯 เวลาเกิด (คำนวณทันที)</th>
                      <th className="px-3 py-2 text-center">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#131b2e] font-mono">
                    {parsedItems.map((item, idx) => {
                      let deathTimeDisplay = '--:-- น.';
                      if (item.deathDate) {
                        deathTimeDisplay =
                          item.deathDate.toLocaleTimeString('th-TH', {
                            timeZone: 'Asia/Bangkok',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) + ' น.';
                      }

                      const targetSpawn = item.effectiveSpawnDate || item.calculatedSpawnDate;
                      let spawnTimeDisplay = '--:-- น.';
                      if (targetSpawn) {
                        spawnTimeDisplay =
                          targetSpawn.toLocaleTimeString('th-TH', {
                            timeZone: 'Asia/Bangkok',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) + ' น.';
                      }

                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-[#10192e] ${
                            item.status === 'matched'
                              ? 'text-stone-200'
                              : item.status === 'no_time'
                              ? 'text-amber-300/80 bg-amber-950/10'
                              : 'text-rose-400/80 bg-rose-950/20'
                          }`}
                        >
                          <td className="px-3 py-2 text-center text-stone-500 text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2 truncate max-w-[170px] font-sans">
                            {item.rawLine}
                          </td>
                          <td className="px-3 py-2 font-sans font-bold text-sky-300">
                            {item.matchedBossName || (
                              <span className="text-rose-400 font-normal">ไม่พบชื่อบอสนี้</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center text-stone-300">
                            {deathTimeDisplay}
                          </td>
                          <td className="px-3 py-2 text-center text-stone-400">
                            {item.cooldownHours ? `+${item.cooldownHours} ชม.` : '-'}
                          </td>
                          <td className="px-3 py-2 text-center font-bold text-emerald-400 text-sm bg-emerald-950/20 border-x border-emerald-900/30">
                            {spawnTimeDisplay}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {item.status === 'matched' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-sans font-semibold">
                                พร้อมอัปเดต
                              </span>
                            ) : item.status === 'no_time' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-sans">
                                ไม่มีเวลา (--:--)
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-sans">
                                ไม่พบบอส
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#16233f] bg-[#0d1424] flex-shrink-0">
          <div className="text-xs text-stone-400">
            {stats.matchedCount > 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  พร้อมนำเข้าเวลาบอสจำนวน <strong>{stats.matchedCount}</strong> ตัว
                </span>
              </span>
            ) : (
              <span>กรุณาวางข้อมูลจาก Google Sheets หรือ Excel ก่อนกดบันทึก</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || (stats.matchedCount === 0 && stats.noTimeCount === 0)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    นำเข้าและอัปเดต ({stats.matchedCount + stats.noTimeCount} ตัว)
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
