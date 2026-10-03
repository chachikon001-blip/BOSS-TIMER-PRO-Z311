import React, { useState } from 'react';
import { AppSettings, User } from '../types';
import { DiscordService } from '../services/discordService';
import { soundService } from '../services/soundService';
import {
  X,
  Settings,
  Volume2,
  Bell,
  Send,
  CheckCircle,
  AlertCircle,
  LogIn,
  LogOut,
  Database,
  Radio,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  user: User | null;
  onGoogleSignIn: () => Promise<void>;
  onGoogleSignOut: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  user,
  onGoogleSignIn,
  onGoogleSignOut,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [testDiscordStatus, setTestDiscordStatus] = useState<{ [key: string]: string | null }>({});
  const [isTestingDiscord, setIsTestingDiscord] = useState<{ [key: string]: boolean }>({});
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyUrl = (key: string, url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLeadMinuteToggle = (minute: number) => {
    setFormData((prev) => {
      const exists = prev.notifyBeforeMinutes.includes(minute);
      const newMinutes = exists
        ? prev.notifyBeforeMinutes.filter((m) => m !== minute)
        : [...prev.notifyBeforeMinutes, minute].sort((a, b) => b - a);
      return { ...prev, notifyBeforeMinutes: newMinutes };
    });
  };

  const handleTestSpecificDiscord = async (key: string, url: string, label: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
      setTestDiscordStatus((prev) => ({
        ...prev,
        [key]: `กรุณากรอก Webhook URL ของ ${label} ก่อนกดทดสอบ`,
      }));
      return;
    }
    setIsTestingDiscord((prev) => ({ ...prev, [key]: true }));
    setTestDiscordStatus((prev) => ({ ...prev, [key]: null }));
    try {
      const res = await DiscordService.testWebhook(trimmed);
      if (res.success) {
        setTestDiscordStatus((prev) => ({
          ...prev,
          [key]: `✅ ส่งทดสอบเข้าห้อง ${label} สำเร็จแล้ว!`,
        }));
      } else {
        setTestDiscordStatus((prev) => ({
          ...prev,
          [key]: `❌ ข้อผิดพลาด: ${res.error || 'ส่งไม่สำเร็จ'}`,
        }));
      }
    } catch (e: any) {
      setTestDiscordStatus((prev) => ({ ...prev, [key]: `❌ ข้อผิดพลาด: ${e.message}` }));
    } finally {
      setIsTestingDiscord((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleTestVoice = () => {
    soundService.alertBossEvent('มด 3', 'เซิร์ฟเวอร์ 1', 5, {
      ttsEnabled: formData.ttsEnabled,
      chimeEnabled: formData.soundChimeEnabled,
      volume: formData.voiceVolume,
      rate: formData.voiceRate,
    });
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ตั้งค่าระบบและการแจ้งเตือน</h2>
              <p className="text-xs text-stone-400">
                BOSS TIMER PRO Z3 • เสียงพูด / Discord / คลาวด์ซิงค์
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
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-stone-200">
          {/* Section 1: Cloud & Google Account */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-stone-100 text-xs uppercase tracking-wider">
                  Firebase Real-Time Cloud Sync
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                  BOSS TIMER PRO Z3
                </span>
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-300 truncate max-w-[160px]">
                    👤 {user.displayName || user.email}
                  </span>
                  <button
                    onClick={async () => {
                      setIsAuthLoading(true);
                      await onGoogleSignOut();
                      setIsAuthLoading(false);
                    }}
                    disabled={isAuthLoading}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3 h-3 text-rose-400" /> ออกจากระบบ
                  </button>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    setIsAuthLoading(true);
                    await onGoogleSignIn();
                    setIsAuthLoading(false);
                  }}
                  disabled={isAuthLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" /> เข้าสู่ระบบด้วย Google
                </button>
              )}
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              เมื่อเพื่อนๆ หรือคนในกิลด์เปิดเว็บนี้ ทุกคนจะเห็นเวลาบอสซิงค์สดแบบ Real-time ร่วมกันทันทีผ่าน Firebase
            </p>
          </div>

          {/* Section 2: Discord Webhook Integration by Server Channel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Send className="w-4 h-4" />
                <span>การตั้งค่า Discord Webhook (แยกห้องแต่ละเซิร์ฟเวอร์)</span>
              </div>
              <span className="text-[11px] text-stone-400">ส่งแจ้งเตือนแยกห้องกัน</span>
            </div>

            {/* Server 1 Webhook */}
            <div className="p-3.5 rounded-xl bg-stone-950/80 border border-sky-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  Webhook URL ห้องเซิร์ฟหลัก {formData.server1Tag || '[T3]'}
                </label>
                <span className="text-[10px] text-stone-500 font-mono">ห้อง Discord 1</span>
              </div>

              {/* Full view textarea */}
              <textarea
                rows={2}
                placeholder="วางลิงก์ https://discord.com/api/webhooks/... ที่นี่ (ห้องเซิร์ฟหลัก)"
                value={formData.server1WebhookUrl || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, server1WebhookUrl: e.target.value.trim() }))
                }
                className="w-full bg-[#090d17] border border-[#1b2b4e] rounded-lg p-2.5 text-xs text-sky-200 font-mono focus:outline-none focus:border-sky-500 break-all leading-relaxed resize-none shadow-inner"
              />

              <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                <div className="text-[11px] text-stone-500 font-mono flex items-center gap-1.5">
                  <span>ความยาว: {formData.server1WebhookUrl ? `${formData.server1WebhookUrl.length} ตัวอักษร` : '0 ตัวอักษร'}</span>
                  {formData.server1WebhookUrl && formData.server1WebhookUrl.length < 80 && (
                    <span className="text-amber-400 font-sans text-[10px]">⚠️ ลิงก์สั้นกว่าปกติ (มักมี ~120 ตัว)</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {formData.server1WebhookUrl && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl('s1', formData.server1WebhookUrl || '')}
                        className="px-2 py-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="คัดลอกลิงก์"
                      >
                        {copiedKey === 's1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 's1' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, server1WebhookUrl: '' }))}
                        className="px-2 py-1 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="ลบออก"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบ</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleTestSpecificDiscord('s1', formData.server1WebhookUrl, `เซิร์ฟหลัก ${formData.server1Tag}`)
                    }
                    disabled={isTestingDiscord['s1'] || !formData.server1WebhookUrl}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                  >
                    <Radio className={`w-3.5 h-3.5 ${isTestingDiscord['s1'] ? 'animate-spin' : ''}`} />
                    <span>ทดสอบส่ง</span>
                  </button>
                </div>
              </div>

              {testDiscordStatus['s1'] && (
                <div
                  className={`text-xs p-2 rounded flex items-center gap-1.5 ${
                    testDiscordStatus['s1'].startsWith('✅')
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                  }`}
                >
                  {testDiscordStatus['s1']}
                </div>
              )}
            </div>

            {/* Server 2 Webhook */}
            <div className="p-3.5 rounded-xl bg-stone-950/80 border border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Webhook URL ห้องเซิร์ฟรอง {formData.server2Tag || '[S1]'}
                </label>
                <span className="text-[10px] text-stone-500 font-mono">ห้อง Discord 2</span>
              </div>

              {/* Full view textarea */}
              <textarea
                rows={2}
                placeholder="วางลิงก์ https://discord.com/api/webhooks/... ที่นี่ (ห้องเซิร์ฟรอง)"
                value={formData.server2WebhookUrl || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, server2WebhookUrl: e.target.value.trim() }))
                }
                className="w-full bg-[#090d17] border border-[#1b2b4e] rounded-lg p-2.5 text-xs text-purple-200 font-mono focus:outline-none focus:border-purple-500 break-all leading-relaxed resize-none shadow-inner"
              />

              <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                <div className="text-[11px] text-stone-500 font-mono flex items-center gap-1.5">
                  <span>ความยาว: {formData.server2WebhookUrl ? `${formData.server2WebhookUrl.length} ตัวอักษร` : '0 ตัวอักษร'}</span>
                  {formData.server2WebhookUrl && formData.server2WebhookUrl.length < 80 && (
                    <span className="text-amber-400 font-sans text-[10px]">⚠️ ลิงก์สั้นกว่าปกติ (มักมี ~120 ตัว)</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {formData.server2WebhookUrl && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl('s2', formData.server2WebhookUrl || '')}
                        className="px-2 py-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="คัดลอกลิงก์"
                      >
                        {copiedKey === 's2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 's2' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, server2WebhookUrl: '' }))}
                        className="px-2 py-1 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="ลบออก"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบ</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleTestSpecificDiscord('s2', formData.server2WebhookUrl, `เซิร์ฟรอง ${formData.server2Tag}`)
                    }
                    disabled={isTestingDiscord['s2'] || !formData.server2WebhookUrl}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                  >
                    <Radio className={`w-3.5 h-3.5 ${isTestingDiscord['s2'] ? 'animate-spin' : ''}`} />
                    <span>ทดสอบส่ง</span>
                  </button>
                </div>
              </div>

              {testDiscordStatus['s2'] && (
                <div
                  className={`text-xs p-2 rounded flex items-center gap-1.5 ${
                    testDiscordStatus['s2'].startsWith('✅')
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                  }`}
                >
                  {testDiscordStatus['s2']}
                </div>
              )}
            </div>

            {/* Combined / Fallback Webhook */}
            <div className="p-3.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-stone-300">
                  Webhook URL ห้องรวมทั้ง 2 เซิร์ฟ หรือห้องสำรอง (ไม่บังคับ)
                </label>
              </div>

              {/* Full view textarea */}
              <textarea
                rows={2}
                placeholder="วางลิงก์ https://discord.com/api/webhooks/... ที่นี่ (ห้องรวม)"
                value={formData.discordWebhookUrl || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, discordWebhookUrl: e.target.value.trim() }))
                }
                className="w-full bg-[#090d17] border border-stone-700 rounded-lg p-2.5 text-xs text-stone-100 font-mono focus:outline-none focus:border-indigo-500 break-all leading-relaxed resize-none shadow-inner"
              />

              <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                <div className="text-[11px] text-stone-500 font-mono flex items-center gap-1.5">
                  <span>ความยาว: {formData.discordWebhookUrl ? `${formData.discordWebhookUrl.length} ตัวอักษร` : '0 ตัวอักษร'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {formData.discordWebhookUrl && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl('main', formData.discordWebhookUrl || '')}
                        className="px-2 py-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="คัดลอกลิงก์"
                      >
                        {copiedKey === 'main' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'main' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, discordWebhookUrl: '' }))}
                        className="px-2 py-1 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="ลบออก"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบ</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleTestSpecificDiscord('main', formData.discordWebhookUrl, 'ห้องรวม')
                    }
                    disabled={isTestingDiscord['main'] || !formData.discordWebhookUrl}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0 shadow-sm"
                  >
                    <Radio className={`w-3.5 h-3.5 ${isTestingDiscord['main'] ? 'animate-spin' : ''}`} />
                    <span>ทดสอบส่ง</span>
                  </button>
                </div>
              </div>

              {testDiscordStatus['main'] && (
                <div
                  className={`text-xs p-2 rounded flex items-center gap-1.5 ${
                    testDiscordStatus['main'].startsWith('✅')
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                  }`}
                >
                  {testDiscordStatus['main']}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Notification Timings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Bell className="w-4 h-4" />
                <span>ช่วงเวลาแจ้งเตือนก่อนบอสเกิด (เสียง & Discord)</span>
              </div>
              <span className="text-[11px] text-amber-400 font-mono font-semibold">10, 3, 1 นาที และเกิดแล้ว</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[10, 3, 1].map((min) => {
                const checked = formData.notifyBeforeMinutes.includes(min);
                return (
                  <label
                    key={min}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'bg-amber-950/50 border-amber-500 text-amber-200 shadow-sm shadow-amber-950/30'
                        : 'bg-stone-950/50 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">{min} นาที</div>
                      <div className="text-[10px] text-stone-400">ก่อนบอสเกิด</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleLeadMinuteToggle(min)}
                      className="w-4 h-4 rounded text-amber-500 bg-stone-900 border-stone-700"
                    />
                  </label>
                );
              })}
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-stone-950/60 border border-stone-800 cursor-pointer text-stone-300 select-none">
                <input
                  type="checkbox"
                  checked={formData.notifyAtSpawn}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notifyAtSpawn: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-rose-500 bg-stone-900 border-stone-700"
                />
                <div>
                  <span className="font-bold text-rose-300">แจ้งเตือนทันทีเมื่อบอสเกิดแล้ว (0 นาที)</span>
                  <div className="text-[11px] text-stone-400">ส่งเสียงพูดและแจ้งเข้า Discord ทันทีที่บอสพร้อมล่า</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-stone-950/60 border border-stone-800 cursor-pointer text-stone-300 select-none">
                <input
                  type="checkbox"
                  checked={formData.notifyOnKill}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notifyOnKill: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-indigo-500 bg-stone-900 border-stone-700"
                />
                <div>
                  <span className="font-medium text-stone-200">ส่งข้อความเข้า Discord ทันทีเมื่อมีคนกดยืนยันบอสตาย</span>
                  <div className="text-[11px] text-stone-400">แจ้งเวลาตายและเวลาเกิดรอบถัดไปอัตโนมัติ</div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Voice TTS & Sound alerts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <Volume2 className="w-4 h-4" />
                <span>เสียงแจ้งเตือนและระบบอ่านชื่อบอส (TTS)</span>
              </div>
              <button
                type="button"
                onClick={handleTestVoice}
                className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 cursor-pointer flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-rose-400" /> ทดสอบฟังเสียง
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.ttsEnabled}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, ttsEnabled: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-rose-500 bg-stone-900 border-stone-700"
                />
                <div>
                  <div className="font-semibold text-stone-200">เปิดระบบอ่านเสียงบอส (TTS)</div>
                  <div className="text-[11px] text-stone-400">
                    อ่านชื่อบอสและเซิร์ฟเวอร์ด้วยเสียงภาษาไทย
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.soundChimeEnabled}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, soundChimeEnabled: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-rose-500 bg-stone-900 border-stone-700"
                />
                <div>
                  <div className="font-semibold text-stone-200">เปิดเสียงสัญญาณเตือน (Chime)</div>
                  <div className="text-[11px] text-stone-400">
                    เสียงบี๊บเตือนความสนใจก่อนอ่านข้อความ
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-stone-800 bg-stone-950/60 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-900/40 transition-colors cursor-pointer"
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
};
