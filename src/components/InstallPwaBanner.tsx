import React from 'react';
import { Download, X, Smartphone, Sparkles, Share2 } from 'lucide-react';
import logoImg from '../assets/images/currylicious_logo_1785234718076.jpg';

interface InstallPwaBannerProps {
  onOpenModal: () => void;
  onDismiss: () => void;
  isIOS: boolean;
  hasNativePrompt: boolean;
}

export const InstallPwaBanner: React.FC<InstallPwaBannerProps> = ({
  onOpenModal,
  onDismiss,
  isIOS,
  hasNativePrompt,
}) => {
  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-40 bg-[#FAF6F0] border-2 border-[#C05621] rounded-2xl shadow-2xl p-3.5 flex items-center justify-between gap-3 animate-slide-up">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={logoImg}
          alt="Currylicious"
          className="w-11 h-11 rounded-full object-cover border-2 border-[#C05621] shrink-0 shadow-xs"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2D241E] truncate">Install Currylicious</h4>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          </div>
          <p className="text-[11px] text-[#6E5E53] truncate">
            {isIOS ? 'Add to Home Screen on Safari' : hasNativePrompt ? 'Tap to install app instantly' : 'Get quick 1-tap app access'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpenModal}
          className="px-3 py-1.5 bg-[#C05621] hover:bg-[#A84719] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1 active:scale-95"
        >
          {isIOS ? <Share2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          <span>{isIOS ? 'Add to Home' : 'Install'}</span>
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 text-[#6E5E53] hover:text-[#2D241E] hover:bg-[#EFE8DE] rounded-lg transition"
          title="Dismiss for now"
          aria-label="Dismiss install banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
