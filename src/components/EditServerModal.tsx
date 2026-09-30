import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface EditServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverKey: 'server_1' | 'server_2';
  currentName: string;
  currentTag: string;
  onSave: (newName: string, newTag: string) => void;
}

export const EditServerModal: React.FC<EditServerModalProps> = ({
  isOpen,
  onClose,
  serverKey,
  currentName,
  currentTag,
  onSave,
}) => {
  const [name, setName] = useState(currentName);
  const [tag, setTag] = useState(currentTag);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), tag.trim() || (serverKey === 'server_1' ? '[T3]' : '[S1]'));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-[#0e1628] border border-[#1b2b4e] rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">
            แก้ไขชื่อ {serverKey === 'server_1' ? 'เซิร์ฟเวอร์หลัก' : 'เซิร์ฟเวอร์รอง'}
          </h3>
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
              ชื่อเซิร์ฟเวอร์
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#080d18] border border-[#1e2f55] rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
              placeholder="เช่น เซิร์ฟหลัก หรือ เซิร์ฟ 1"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              แท็กย่อ (เช่น [T3] หรือ [S1])
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full bg-[#080d18] border border-[#1e2f55] rounded-lg px-3 py-2 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
              placeholder="เช่น [T3]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs font-medium hover:bg-stone-700"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1 shadow"
            >
              <Check className="w-3.5 h-3.5" /> บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
