import React, { useState, useMemo } from 'react';
import { BossRecord, AppSettings, ServerFilter } from '../types';
import { DiscordService } from '../services/discordService';
import { formatThaiTime, formatRemainingTime } from '../utils/formatTime';
import {
  Send,
  X,
  Shield,
  Swords,
  Layers,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  Sparkles,
} from 'lucide-react';

interface SendTop30ModalProps {
  isOpen: boolean;
  onClose: () => void;
  bosses: BossRecord[];
  currentTime: Date;
  settings: AppSettings;
  currentFilter: ServerFilter;
  onOpenSettings: () => void;
}

export const SendTop30Modal: React.FC<SendTop30ModalProps> = ({
  isOpen,
  onClose,
  bosses,
  currentTime,
  settings,
  currentFilter,
  onOpenSettings,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<'both' | 'server_1' | 'server_2'>(
    currentFilter === 'server_2' ? 'server_2' : currentFilter === 'server_1' ? 'server_1' : 'both'
  );
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const nowMs = currentTime.getTime();

  // Helper to sort bosses by soonest
  const getSortedTop30 = (serverId?: string) => {
    let list = serverId ? bosses.filter((b) => b.serverId === serverId) : bosses;

    return [...list]
      .sort((a, b) => {
        const aTime = a.nextSpawnAt ? new Date(a.nextSpawnAt).getTime() : null;
        const bTime = b.nextSpawnAt ? new Date(b.nextSpawnAt).getTime() : null;

        if (aTime === null && bTime === null) return (a.bossNumber || 999) - (b.bossNumber || 999);
        if (aTime === null) return 1;
        if (bTime === null) return -1;

        const aDiff = aTime - nowMs;
        const bDiff = bTime - nowMs;

        if (aDiff <= 0 && bDiff <= 0) return bDiff - aDiff;
        if (aDiff <= 0) return -1;
        if (bDiff <= 0) return 1;

        return aTime - bTime;
      })
      .slice(0, 30);
  };

  const s1Top30 = getSortedTop30('server_1');
  const s2Top30 = getSortedTop30('server_2');
  const previewList =
    selectedTarget === 'server_1'
      ? s1Top30
      : selectedTarget === 'server_2'
      ? s2Top30
      : getSortedTop30();

  const s1Webhook = settings.server1WebhookUrl || settings.discordWebhookUrl;
  const s2Webhook = settings.server2WebhookUrl || settings.discordWebhookUrl;

  const handleSend = async () => {
    setIsSending(true);
    setStatusMessage(null);

    try {
      if (selectedTarget === 'server_1') {
        if (!s1Webhook) {
          throw new Error(`ยังไม่ได้ตั้งค่า Webhook สำหรับ ${settings.server1Name} (${settings.server1Tag})`);
        }
        const res = await DiscordService.notifyTop30Bosses(
          s1Webhook,
          `${settings.server1Name} ${settings.server1Tag}`,
          s1Top30,
          currentTime
        );
        if (!res.success) throw new Error(res.error || 'ส่งไม่สำเร็จ');
        setStatusMessage({
          type: 'success',
          text: `ส่งสรุป 30 บอสของ ${settings.server1Name} เข้า Discord สำเร็จแล้ว!`,
        });
      } else if (selectedTarget === 'server_2') {
        if (!s2Webhook) {
          throw new Error(`ยังไม่ได้ตั้งค่า Webhook สำหรับ ${settings.server2Name} (${settings.server2Tag})`);
        }
        const res = await DiscordService.notifyTop30Bosses(
          s2Webhook,
          `${settings.server2Name} ${settings.server2Tag}`,
          s2Top30,
          currentTime
        );
        if (!res.success) throw new Error(res.error || 'ส่งไม่สำเร็จ');
        setStatusMessage({
          type: 'success',
          text: `ส่งสรุป 30 บอสของ ${settings.server2Name} เข้า Discord สำเร็จแล้ว!`,
        });
      } else {
        // Send both to separate rooms!
        let sentCount = 0;
        let errors: string[] = [];

        if (s1Webhook) {
          const res1 = await DiscordService.notifyTop30Bosses(
            s1Webhook,
            `${settings.server1Name} ${settings.server1Tag}`,
            s1Top30,
            currentTime
          );
          if (res1.success) sentCount++;
          else errors.push(`ห้อง ${settings.server1Name}: ${res1.error}`);
        } else {
          errors.push(`ไม่มี Webhook ของ ${settings.server1Name}`);
        }

        if (s2Webhook) {
          const res2 = await DiscordService.notifyTop30Bosses(
            s2Webhook,
            `${settings.server2Name} ${settings.server2Tag}`,
            s2Top30,
            currentTime
          );
          if (res2.success) sentCount++;
          else errors.push(`ห้อง ${settings.server2Name}: ${res2.error}`);
        } else {
          errors.push(`ไม่มี Webhook ของ ${settings.server2Name}`);
        }

        if (sentCount > 0 && errors.length === 0) {
          setStatusMessage({
            type: 'success',
            text: `ส่งสรุป 30 บอสแยกห้องทั้ง 2 เซิร์ฟเวอร์เรียบร้อยแล้ว (${settings.server1Name} และ ${settings.server2Name})`,
          });
        } else if (sentCount > 0) {
          setStatusMessage({
            type: 'success',
            text: `ส่งสำเร็จบางส่วน (${sentCount}/2 ห้อง): ${errors.join(', ')}`,
          });
        } else {
          throw new Error(errors.join(', ') || 'ไม่มี Webhook ถูกต้อง');
        }
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'ส่งข้อความเข้า Discord ไม่สำเร็จ',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ส่งตาราง 30 บอสที่ใกล้ที่สุดเข้า Discord</h2>
              <p className="text-xs text-stone-400">
                ส่งแจ้งเตือนสรุปรายชื่อบอส 30 อันดับแรกที่กำลังจะเกิด แยกตามห้องของแต่ละเซิร์ฟเวอร์
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

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm text-stone-200">
          {/* Target Server Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider">
              เลือกห้องปลายทางที่ต้องการส่ง:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Both servers */}
              <button
                type="button"
                onClick={() => setSelectedTarget('both')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedTarget === 'both'
                    ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-md shadow-amber-950/30'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-amber-400">
                    <Layers className="w-3.5 h-3.5" /> ส่งแยก 2 ห้องพร้อมกัน
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-[11px] text-stone-400">
                  เซิร์ฟหลักส่งเข้าห้อง 1, เซิร์ฟรองส่งเข้าห้อง 2
                </div>
              </button>

              {/* Option 2: Server 1 */}
              <button
                type="button"
                onClick={() => setSelectedTarget('server_1')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedTarget === 'server_1'
                    ? 'bg-sky-950/40 border-sky-500 text-sky-200 shadow-md shadow-sky-950/30'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-sky-400">
                    <Shield className="w-3.5 h-3.5" /> {settings.server1Name}
                  </span>
                  <span className="text-[10px] font-mono px-1 rounded bg-sky-900/60 text-sky-300">
                    {settings.server1Tag}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400">
                  ส่ง 30 บอสเข้าห้อง {settings.server1Name}
                </div>
              </button>

              {/* Option 3: Server 2 */}
              <button
                type="button"
                onClick={() => setSelectedTarget('server_2')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedTarget === 'server_2'
                    ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-md shadow-purple-950/30'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-purple-400">
                    <Swords className="w-3.5 h-3.5" /> {settings.server2Name}
                  </span>
                  <span className="text-[10px] font-mono px-1 rounded bg-purple-900/60 text-purple-300">
                    {settings.server2Tag}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400">
                  ส่ง 30 บอสเข้าห้อง {settings.server2Name}
                </div>
              </button>
            </div>
          </div>

          {/* Webhook Status Info */}
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-stone-400 font-medium">ห้องเซิร์ฟหลัก {settings.server1Tag}:</span>
                {s1Webhook ? (
                  <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> เชื่อมต่อแล้ว
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold inline-flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> ยังไม่มี Webhook
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-400 font-medium">ห้องเซิร์ฟรอง {settings.server2Tag}:</span>
                {s2Webhook ? (
                  <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> เชื่อมต่อแล้ว
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold inline-flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> ยังไม่มี Webhook
                  </span>
                )}
              </div>
            </div>

            {(!s1Webhook || !s2Webhook) && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-semibold flex items-center gap-1 border border-stone-700 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" /> ตั้งค่า Webhook
              </button>
            )}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 text-emerald-200 border-emerald-800'
                  : 'bg-rose-950/60 text-rose-200 border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Boss Preview Table (30 Bosses) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-300">
              <span>ตัวอย่างบอส 30 อันดับแรกที่จะส่ง:</span>
              <span className="text-stone-400">ทั้งหมด {previewList.length} ตัว</span>
            </div>

            <div className="rounded-xl border border-stone-800 bg-stone-950 overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-stone-900/80 sticky top-0 text-stone-400 border-b border-stone-800">
                  <tr>
                    <th className="px-3 py-2 w-10 text-center">#</th>
                    <th className="px-3 py-2">ชื่อบอส</th>
                    <th className="px-3 py-2">เซิร์ฟเวอร์</th>
                    <th className="px-3 py-2 text-center">เวลาเกิด</th>
                    <th className="px-3 py-2 text-right">สถานะ / เหลือ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-900">
                  {previewList.map((b, idx) => {
                    let diffMs = b.nextSpawnAt ? new Date(b.nextSpawnAt).getTime() - nowMs : null;
                    const isSpawned = diffMs !== null && diffMs <= 0;
                    return (
                      <tr key={b.id} className="hover:bg-stone-900/40">
                        <td className="px-3 py-1.5 text-center font-mono text-stone-500">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-1.5 font-bold text-stone-100">
                          {b.nameTh}
                        </td>
                        <td className="px-3 py-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              b.serverId === 'server_1'
                                ? 'bg-sky-950 text-sky-400 border border-sky-800/40'
                                : 'bg-purple-950 text-purple-400 border border-purple-800/40'
                            }`}
                          >
                            {b.serverName}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-center font-mono text-amber-300">
                          {formatThaiTime(b.nextSpawnAt)}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono">
                          {diffMs !== null ? (
                            isSpawned ? (
                              <span className="text-rose-400 font-bold">🔴 เกิดแล้ว!</span>
                            ) : (
                              <span className="text-stone-300">
                                {formatRemainingTime(diffMs)}
                              </span>
                            )
                          ) : (
                            <span className="text-stone-600">--:-- น.</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800 bg-stone-950/60 flex-shrink-0">
          <span className="text-xs text-stone-400">
            {selectedTarget === 'both'
              ? 'ส่ง 30 บอสของทั้ง 2 เซิร์ฟเข้า 2 ห้องแยกกัน'
              : `ส่ง 30 บอสเข้าห้อง ${selectedTarget === 'server_1' ? settings.server1Name : settings.server2Name}`}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-950/50 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-pulse' : ''}`} />
              <span>{isSending ? 'กำลังส่งข้อมูล...' : 'ยืนยันส่งเข้า Discord'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
