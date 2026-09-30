import React from 'react';
import { User } from '../types';
import {
  Swords,
  Volume2,
  VolumeX,
  Plus,
  Settings,
  LogIn,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  onOpenAddBoss: () => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  user: User | null;
  onGoogleSignIn: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddBoss,
  onOpenSettings,
  soundEnabled,
  toggleSound,
  user,
  onGoogleSignIn,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#080d17]/95 backdrop-blur-md border-b border-[#141f38]">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-purple-700 p-0.5 shadow-md shadow-orange-950/40">
            <div className="w-full h-full bg-[#080d18] rounded-[10px] flex items-center justify-center text-amber-400">
              <Swords className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                BOSS TIMER <span className="text-amber-400 font-extrabold">PRO Z3</span>
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Real-Time
              </span>
            </div>
            <p className="text-[10px] text-stone-400 hidden sm:block">
              จับเวลาเกิดบอส • อ่านเสียงแจ้งเตือน • ส่งข้อความ Discord • ซิงค์ 2 เซิร์ฟเวอร์
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 hover:bg-amber-900/50'
                : 'bg-[#0f172a] border-[#1e293b] text-stone-500 hover:text-stone-300'
            }`}
            title={soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือนและเสียงพูด'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Add Boss Button */}
          <button
            onClick={onOpenAddBoss}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/30 transition-all cursor-pointer"
            title="เพิ่มบอสใหม่ในระบบ"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">เพิ่มบอส</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-stone-300 hover:text-white hover:bg-[#1a2642] transition-colors cursor-pointer"
            title="ตั้งค่าระบบ / Discord Webhook / เสียง"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Google Sign In status */}
          {user ? (
            <div
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-stone-200 cursor-pointer hover:border-stone-600"
              title="คลิกเพื่อจัดการบัญชี"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center uppercase">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <span className="hidden md:inline font-medium max-w-[90px] truncate">
                {user.displayName || user.email}
              </span>
            </div>
          ) : (
            <button
              onClick={onGoogleSignIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-950/60 hover:bg-sky-900/60 border border-sky-600/50 text-xs text-sky-300 font-semibold transition-colors cursor-pointer shadow-sm"
              title="เข้าสู่ระบบด้วย Google เพื่อซิงค์กับเพื่อน"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ซิงค์ Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
