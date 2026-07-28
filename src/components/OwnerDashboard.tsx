import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { Plus, Settings, MessageSquare, Phone, RotateCcw, LogOut, Check, ShieldCheck } from 'lucide-react';

interface OwnerDashboardProps {
  storeSettings: StoreSettings;
  onUpdateStoreSettings: (newSettings: StoreSettings) => void;
  onAddNewDish: () => void;
  onResetMenu: () => void;
  onExitOwnerMode: () => void;
  totalDishesCount: number;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  storeSettings,
  onUpdateStoreSettings,
  onAddNewDish,
  onResetMenu,
  onExitOwnerMode,
  totalDishesCount,
}) => {
  const [whatsappNum, setWhatsappNum] = useState(storeSettings.whatsappNumber);
  const [phoneNum, setPhoneNum] = useState(storeSettings.phoneNumber);
  const [announcement, setAnnouncement] = useState(storeSettings.announcement || '');
  const [isOpen, setIsOpen] = useState(storeSettings.isStoreOpen);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreSettings({
      ...storeSettings,
      whatsappNumber: whatsappNum,
      phoneNumber: phoneNum,
      announcement,
      isStoreOpen: isOpen,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="bg-[#FAF6F0] border-b border-[#D9CEBF] text-[#2D241E] py-4 px-3 sm:px-6 shadow-xs">
      <div className="max-w-7xl mx-auto space-y-3.5">
        
        {/* Top Header Bar for Owner */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#EAE2D7] shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#386641]/10 text-[#386641] border border-[#386641]/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg text-[#2D241E]">
                  Owner Management Dashboard
                </h2>
                <span className="text-[11px] bg-[#386641] text-white font-bold px-2 py-0.5 rounded-full">
                  Password Verified
                </span>
              </div>
              <p className="text-xs text-[#6E5E53]">
                Total Dishes in Menu: <strong className="text-[#C05621]">{totalDishesCount}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Kitchen Open/Close Status Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const newIsOpen = !isOpen;
                setIsOpen(newIsOpen);
                onUpdateStoreSettings({
                  ...storeSettings,
                  whatsappNumber: whatsappNum,
                  phoneNumber: phoneNum,
                  announcement,
                  isStoreOpen: newIsOpen,
                });
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition shadow-xs border active:scale-95 ${
                isOpen
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800'
                  : 'bg-rose-700 hover:bg-rose-800 text-white border-rose-800'
              }`}
              title={isOpen ? 'Click to Close Kitchen' : 'Click to Open Kitchen'}
            >
              <span className="relative flex h-2.5 w-2.5">
                {isOpen && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOpen ? 'bg-emerald-200' : 'bg-rose-200'}`}></span>
              </span>
              <span>{isOpen ? 'Kitchen is OPEN' : 'Kitchen is CLOSED'}</span>
              <span className="text-[10px] bg-black/25 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                {isOpen ? 'Turn Off' : 'Turn On'}
              </span>
            </button>

            <button
              onClick={onAddNewDish}
              className="px-4 py-2 rounded-xl bg-[#C05621] hover:bg-[#A84719] text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reset menu items back to default Currylicious initial list? Custom edits will be restored.')) {
                  onResetMenu();
                }
              }}
              className="px-3 py-2 rounded-xl bg-[#EFE8DE] hover:bg-rose-100 text-[#2D241E] hover:text-rose-800 text-xs font-semibold flex items-center gap-1 transition border border-[#D9CEBF]"
              title="Reset default menu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Menu</span>
            </button>

            <button
              onClick={onExitOwnerMode}
              className="px-3.5 py-2 rounded-xl bg-[#386641] hover:bg-[#2D5234] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Customer View</span>
            </button>
          </div>
        </div>

        {/* Quick Settings Bar */}
        <form onSubmit={handleSaveSettings} className="bg-white p-3.5 rounded-2xl border border-[#EAE2D7] shadow-xs space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-2">
            <div className="flex items-center gap-1.5 font-bold text-[#2D241E]">
              <Settings className="w-4 h-4 text-[#C05621]" />
              <span>WhatsApp & Contact Info Settings</span>
            </div>
            {savedSuccess && (
              <span className="text-emerald-700 font-bold flex items-center gap-1 animate-pulse">
                <Check className="w-3.5 h-3.5" /> Settings Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#2D241E] mb-1">
                WhatsApp Order Number (Country code + digits)
              </label>
              <div className="relative">
                <MessageSquare className="w-4 h-4 text-[#25D366] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={whatsappNum}
                  onChange={(e) => setWhatsappNum(e.target.value)}
                  placeholder="639176779779"
                  className="w-full pl-8 pr-2.5 py-1.5 bg-[#FAF6F0] border border-[#D9CEBF] rounded-lg text-[#2D241E] focus:outline-none focus:border-[#C05621] font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#2D241E] mb-1">
                Display Phone Number (Call / Viber)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#C05621] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  placeholder="+63 917 677 9779"
                  className="w-full pl-8 pr-2.5 py-1.5 bg-[#FAF6F0] border border-[#D9CEBF] rounded-lg text-[#2D241E] focus:outline-none focus:border-[#C05621] font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#2D241E] mb-1">
                Announcement Banner Text
              </label>
              <input
                type="text"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Notice for customers..."
                className="w-full px-2.5 py-1.5 bg-[#FAF6F0] border border-[#D9CEBF] rounded-lg text-[#2D241E] focus:outline-none focus:border-[#C05621] text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#2D241E] font-semibold">
              <input
                type="checkbox"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
                className="w-4 h-4 rounded accent-[#386641]"
              />
              <span>Restaurant is Currently Open for Orders</span>
            </label>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#386641] hover:bg-[#2D5234] text-white font-bold text-xs transition"
            >
              Save Store Info
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
