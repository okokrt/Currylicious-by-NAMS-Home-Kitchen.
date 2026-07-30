import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share2, PlusSquare, X, CheckCircle2, Monitor, Info, ArrowUpRight } from 'lucide-react';
import logoImg from '../assets/images/currylicious_logo_1785234718076.jpg';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: BeforeInstallPromptEvent | null;
  onInstallSuccess: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess,
}) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check if running on iOS (iPhone/iPad/iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iosDevice);

    // Check if already running as standalone app
    const inStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(inStandalone);
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        onInstallSuccess();
        onClose();
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }
    } catch (err) {
      console.error('[PWA] Error triggering install prompt:', err);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FAF6F0] rounded-2xl shadow-2xl border border-[#E8E0D5] overflow-hidden">
        {/* Modal Header Banner */}
        <div className="bg-gradient-to-r from-[#C05621] via-[#A84719] to-[#7C2D12] p-5 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={logoImg}
            alt="Currylicious"
            className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-amber-200 shadow-md object-cover"
          />
          <h2 className="font-serif font-bold text-xl tracking-tight">Install Currylicious App</h2>
          <p className="text-xs text-amber-100 mt-1">NAMS Home Kitchen • Fast Ordering on Any Device</p>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {isStandalone ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="font-serif font-bold text-lg text-[#2D241E]">App Already Installed!</h3>
              <p className="text-xs text-[#6E5E53]">
                Currylicious is running directly as a standalone app on your home screen. Enjoy fast online ordering!
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-sm rounded-xl transition shadow-sm"
              >
                Close Window
              </button>
            </div>
          ) : deferredPrompt ? (
            /* Native One-Click Install for Android / Desktop Chrome / Edge / Brave */
            <div className="space-y-4 text-center">
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-left text-xs text-[#6E5E53] space-y-1.5">
                <div className="font-semibold text-[#2D241E] flex items-center gap-1.5 text-sm">
                  <Smartphone className="w-4 h-4 text-[#C05621]" />
                  <span>Why install the App?</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Instant 1-tap access directly from your Home Screen</li>
                  <li>Opens fullscreen without browser search bars</li>
                  <li>Loads faster with offline menu caching</li>
                  <li>Saves your cart & active WhatsApp order details</li>
                </ul>
              </div>

              <button
                onClick={handleNativeInstall}
                disabled={installing}
                className="w-full py-3 bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>{installing ? 'Installing...' : 'Install Now (One-Click)'}</span>
              </button>
            </div>
          ) : isIOS ? (
            /* iOS Safari Step-by-Step Instructions */
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-2 text-xs text-[#2D241E] font-medium">
                <Info className="w-4 h-4 text-[#C05621] shrink-0" />
                <span>To install Currylicious on iPhone / iPad (Safari):</span>
              </div>

              <ol className="space-y-2.5 text-xs text-[#2D241E]">
                <li className="flex items-start gap-2.5 bg-white p-2.5 rounded-lg border border-[#E8E0D5]">
                  <span className="w-5 h-5 rounded-full bg-[#C05621] text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    Tap the <span className="font-bold text-[#C05621]">Share button</span> at the bottom of Safari (<Share2 className="w-3.5 h-3.5 inline text-[#C05621]" />).
                  </div>
                </li>
                <li className="flex items-start gap-2.5 bg-white p-2.5 rounded-lg border border-[#E8E0D5]">
                  <span className="w-5 h-5 rounded-full bg-[#C05621] text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    Scroll down and select <span className="font-bold text-[#2D241E]">"Add to Home Screen"</span> (<PlusSquare className="w-3.5 h-3.5 inline text-[#C05621]" />).
                  </div>
                </li>
                <li className="flex items-start gap-2.5 bg-white p-2.5 rounded-lg border border-[#E8E0D5]">
                  <span className="w-5 h-5 rounded-full bg-[#C05621] text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    Tap <span className="font-bold text-[#2D241E]">"Add"</span> at the top right. The app icon will appear on your Home Screen!
                  </div>
                </li>
              </ol>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#2D241E] hover:bg-[#1F1814] text-white font-bold text-xs rounded-xl transition"
              >
                Got It
              </button>
            </div>
          ) : (
            /* Desktop / General Fallback Instructions */
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-xl border border-[#E8E0D5] text-xs text-[#2D241E] space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-sm text-[#C05621]">
                  <Monitor className="w-4 h-4" /> Desktop / Browser Instructions
                </div>
                <p>
                  To install in Chrome, Edge, Brave, or Samsung Internet:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>Look for the <span className="font-semibold text-[#C05621]">Install icon</span> (<ArrowUpRight className="w-3.5 h-3.5 inline" />) in your browser address bar.</li>
                  <li>Or click the <strong>3 dots menu (⋮)</strong> top right → <strong>"Install Currylicious"</strong> or <strong>"Add to Home screen"</strong>.</li>
                </ol>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-[#C05621] text-white font-bold text-xs rounded-xl transition hover:bg-[#A84719]"
              >
                Close Instructions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
