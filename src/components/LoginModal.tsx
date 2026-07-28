import React, { useState } from 'react';
import { ShieldCheck, Lock, Utensils, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';
import logoImg from '../assets/images/currylicious_logo_1785234718076.jpg';

interface LoginModalProps {
  isOpen: boolean;
  onSelectRole: (role: UserRole) => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onSelectRole,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'select' | 'owner-password'>('select');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleCustomerLogin = () => {
    onSelectRole('customer');
    if (onClose) onClose();
  };

  const handleOwnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Currylici0us18') {
      setErrorMessage('');
      setPassword('');
      onSelectRole('owner');
      if (onClose) onClose();
    } else {
      setErrorMessage('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FAF6F0] border border-[#D9CEBF] rounded-3xl shadow-2xl overflow-hidden text-[#2D241E]">
        
        {/* Header Decorator */}
        <div className="bg-[#2D241E] p-6 text-center relative overflow-hidden">
          <img
            src={logoImg}
            alt="Currylicious"
            className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-[#C05621] shadow-md relative z-10 mb-2"
            referrerPolicy="no-referrer"
          />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 tracking-wide relative z-10">
            Currylicious
          </h2>
          <p className="text-xs sm:text-sm text-amber-200/90 font-medium relative z-10">
            by NAMS Home Kitchen
          </p>
          <div className="mt-2 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#C05621] text-white text-[11px] font-semibold shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-200" />
            <span>Warm Spices & Vibrant Herbs</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">

          {activeTab === 'select' ? (
            <div className="space-y-4">
              <p className="text-center text-xs font-semibold text-[#6E5E53]">
                Welcome! Please select how you want to continue:
              </p>

              {/* Big Customer Button */}
              <button
                onClick={handleCustomerLogin}
                className="w-full py-4 px-5 rounded-2xl bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-base sm:text-lg flex items-center justify-between shadow-md active:scale-[0.98] transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold leading-tight">I AM A CUSTOMER</div>
                    <div className="text-xs font-medium text-amber-100">
                      Explore menu, add favorites & place WhatsApp orders
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Owner Access Button */}
              <button
                onClick={() => {
                  setActiveTab('owner-password');
                  setErrorMessage('');
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-[#EFE8DE] text-[#2D241E] font-semibold text-xs sm:text-sm flex items-center justify-between border border-[#D9CEBF] shadow-xs transition active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#386641]" />
                  <span>Restaurant Owner Login</span>
                </div>
                <span className="text-xs text-[#C05621] font-bold">Enter Password →</span>
              </button>
            </div>
          ) : (
            /* Owner Password Form */
            <form onSubmit={handleOwnerSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-3">
                <div className="flex items-center gap-2 text-[#386641] font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Owner Mode Access</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('select')}
                  className="text-xs text-[#C05621] font-bold hover:underline"
                >
                  ← Back
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2D241E]">
                  Enter Owner Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#C05621] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D9CEBF] rounded-xl text-[#2D241E] focus:outline-none focus:border-[#386641] text-sm"
                    autoFocus
                  />
                </div>
                {errorMessage && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#386641] hover:bg-[#2D5234] text-white font-bold text-sm shadow transition active:scale-[0.98]"
              >
                Access Owner Dashboard
              </button>
            </form>
          )}

          {/* Footer note */}
          <p className="text-[11px] text-center text-[#8C7A6B]">
            Currylicious by NAMS Home Kitchen • Freshly prepared with love
          </p>

        </div>
      </div>
    </div>
  );
};
