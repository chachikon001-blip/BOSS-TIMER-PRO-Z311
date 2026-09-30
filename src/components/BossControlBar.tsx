import React from 'react';
import {
  ServerFilter,
  StatusFilter,
  SortOption,
  ViewMode,
} from '../types';
import {
  Shield,
  Swords,
  Layers,
  Search,
  RotateCcw,
  Zap,
  LayoutList,
  LayoutGrid,
  Edit2,
  Send,
} from 'lucide-react';

interface BossControlBarProps {
  serverFilter: ServerFilter;
  setServerFilter: (s: ServerFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (st: StatusFilter) => void;
  sortOption: SortOption;
  setSortOption: (so: SortOption) => void;
  viewMode: ViewMode;
  setViewMode: (vm: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenReboot: () => void;
  onSendTop30ToDiscord: () => void;
  server1Name: string;
  server1Tag: string;
  server2Name: string;
  server2Tag: string;
  onEditServer1: () => void;
  onEditServer2: () => void;
  counts: {
    server1Count: number;
    server2Count: number;
    totalCount: number;
  };
}

export const BossControlBar: React.FC<BossControlBarProps> = ({
  serverFilter,
  setServerFilter,
  statusFilter,
  setStatusFilter,
  sortOption,
  setSortOption,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  onOpenReboot,
  onSendTop30ToDiscord,
  server1Name,
  server1Tag,
  server2Name,
  server2Tag,
  onEditServer1,
  onEditServer2,
  counts,
}) => {
  return (
    <div className="space-y-3 mb-4">
      {/* 1. Server Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-2xl bg-[#0b101b] border border-[#16223d]">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {/* Server 1 Tab */}
          <button
            onClick={() => setServerFilter('server_1')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              serverFilter === 'server_1'
                ? 'bg-[#142342] text-sky-300 border border-[#2b4c8f] shadow-md shadow-sky-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#10192e]'
            }`}
          >
            <Shield className="w-4 h-4 text-sky-400" />
            <span>{server1Name}</span>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-[#091122] text-sky-400 border border-sky-800/40">
              {server1Tag}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onEditServer1();
              }}
              className="p-1 text-stone-500 hover:text-stone-200 transition-colors rounded"
              title="แก้ไขชื่อเซิร์ฟเวอร์หลัก"
            >
              <Edit2 className="w-3 h-3" />
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800/70 text-stone-300 font-mono">
              {counts.server1Count}
            </span>
          </button>

          {/* Server 2 Tab */}
          <button
            onClick={() => setServerFilter('server_2')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              serverFilter === 'server_2'
                ? 'bg-[#251842] text-purple-300 border border-[#5d3a9b] shadow-md shadow-purple-950/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#10192e]'
            }`}
          >
            <Swords className="w-4 h-4 text-purple-400" />
            <span>{server2Name}</span>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-[#140b25] text-purple-400 border border-purple-800/40">
              {server2Tag}
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onEditServer2();
              }}
              className="p-1 text-stone-500 hover:text-stone-200 transition-colors rounded"
              title="แก้ไขชื่อเซิร์ฟเวอร์รอง"
            >
              <Edit2 className="w-3 h-3" />
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800/70 text-stone-300 font-mono">
              {counts.server2Count}
            </span>
          </button>
        </div>

        {/* Tab 3: Active Orange Combined Table Button */}
        <button
          onClick={() => setServerFilter('all')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            serverFilter === 'all'
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black shadow-lg shadow-orange-950/50'
              : 'bg-[#18233c] text-amber-400 hover:bg-[#202f50] border border-[#2d4272]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ตารางรวมทั้ง 2 เซิร์ฟ</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/30 font-mono">
            {counts.totalCount}
          </span>
        </button>
      </div>

      {/* 2. Controls & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อบอส, สถานที่, หรือไอเทมดรอป..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d1424] border border-[#1b2b4e] rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 shadow-inner transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters, View toggle & Reboot button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="appearance-none bg-[#0d1424] border border-[#1b2b4e] rounded-xl px-4 py-2.5 pr-8 text-xs sm:text-sm text-stone-200 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">สถานะ: ทั้งหมด</option>
              <option value="spawned">สถานะ: เกิดแล้วในแมพ</option>
              <option value="soon">สถานะ: ใกล้เกิด (&lt; 15 นาที)</option>
              <option value="cooldown">สถานะ: รอเกิด (คูลดาวน์)</option>
              <option value="unknown">สถานะ: ไม่ทราบเวลา (--:-- น.)</option>
              <option value="favorite">สถานะ: รายการโปรด ⭐</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
              ▼
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="appearance-none bg-[#0d1424] border border-[#1b2b4e] rounded-xl px-4 py-2.5 pr-8 text-xs sm:text-sm text-stone-200 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="soonest">เรียงตาม: เวลาเกิดเร็วสุด</option>
              <option value="number">เรียงตาม: หมายเลขบอส (#)</option>
              <option value="name">เรียงตาม: ชื่อบอส (ก-ฮ)</option>
              <option value="cooldown">เรียงตาม: คูลดาวน์เกิดใหม่</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">
              ▼
            </div>
          </div>

          {/* View mode toggle: Table or Grid */}
          <div className="flex items-center p-1 rounded-xl bg-[#0d1424] border border-[#1b2b4e]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="มุมมองแบบตาราง (Table View)"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="มุมมองแบบการ์ด (Grid View)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Send Top 30 Closest Bosses to Discord */}
          <button
            onClick={onSendTop30ToDiscord}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-indigo-500/70 hover:border-indigo-400 bg-indigo-500/15 hover:bg-indigo-500/25 active:scale-95 text-indigo-300 hover:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm shadow-indigo-950/30 whitespace-nowrap"
            title="ส่งสรุป 30 บอสที่ใกล้เกิดที่สุดเข้าห้อง Discord ตามเซิร์ฟเวอร์"
          >
            <Send className="w-3.5 h-3.5 text-indigo-400" />
            <span>ส่ง 30 บอสเข้าดิส</span>
          </button>

          {/* Reboot Button: 🔄⚡ รีบูทเซิร์ฟ */}
          <button
            onClick={onOpenReboot}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-500/70 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-400 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm shadow-amber-950/30 whitespace-nowrap"
            title="บันทึกเวลารีบูทเซิร์ฟเวอร์เสร็จสิ้นเพื่อคำนวณรอบใหม่"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>รีบูทเซิร์ฟ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
