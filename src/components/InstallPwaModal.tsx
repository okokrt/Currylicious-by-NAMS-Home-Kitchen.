import React, { useState, useEffect } from 'react';
import { Download, AlertTriangle, Share2, PlusSquare, X, CheckCircle2, Monitor, Info, ArrowUpRight, ArrowDown } from 'lucide-react';
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
  const [isReadInstructions, setIsReadInstructions] = useState(false);
  const [showIosOverlay, setShowIosOverlay] = useState(false);

  useEffect(() => {
    // Reset checkbox state whenever modal is opened
    if (isOpen) {
      setIsReadInstructions(false);
      setShowIosOverlay(false);
    }

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
  }, [isOpen]);

  const handleIosContinue = () => {
    if (!isReadInstructions) return;
    onClose();
    // Smoothly scroll window to the top so Safari toolbar reveals itself if hidden
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowIosOverlay(true);
  };

  const handleNativeInstall = async () => {
    if (!deferredPrompt || !isReadInstructions) return;
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
    <>
      {/* Full-Screen Guided Overlay for iOS Safari */}
      {showIosOverlay && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-6 bg-black/85 backdrop-blur-md text-white animate-fade-in">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5">
              <img
                src={logoImg}
                alt="Currylicious"
                className="w-10 h-10 rounded-full border border-amber-300 shadow-sm object-cover"
              />
              <div>
                <h3 className="font-serif font-bold text-sm text-amber-100">Currylicious App</h3>
                <p className="text-[10px] text-amber-200/80">Safari Installation Guide</p>
              </div>
            </div>
            <button
              onClick={() => setShowIosOverlay(false)}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl backdrop-blur-xs transition flex items-center gap-1.5 border border-white/20 active:scale-95"
              aria-label="Close guide overlay"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>

          {/* Center Instruction Banner */}
          <div className="my-auto max-w-sm mx-auto bg-gradient-to-b from-[#2D241E] to-[#1F1814] border border-amber-500/30 p-5 rounded-2xl shadow-2xl text-center space-y-3.5">
            <div className="w-12 h-12 rounded-full bg-[#C05621]/20 border border-[#C05621] flex items-center justify-center mx-auto text-amber-400">
              <Share2 className="w-6 h-6 animate-pulse" />
            </div>

            <h4 className="font-serif font-bold text-base sm:text-lg text-amber-100 leading-tight">
              Tap the Safari Share button, then choose 'Add to Home Screen'.
            </h4>

            <p className="text-xs text-amber-200/80 leading-relaxed">
              Look at Safari's bottom bar (or top right on iPad). Tap <Share2 className="w-3.5 h-3.5 inline text-amber-400" /> <strong>Share</strong>, scroll down, and tap <PlusSquare className="w-3.5 h-3.5 inline text-amber-400" /> <strong>Add to Home Screen</strong>.
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowIosOverlay(false)}
                className="w-full py-2.5 bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md active:scale-98"
              >
                Got It
              </button>
            </div>
          </div>

          {/* Bottom Pointing Arrow */}
          <div className="pb-4 text-center flex flex-col items-center gap-1 text-amber-400 animate-bounce">
            <p className="text-xs font-bold tracking-wide uppercase bg-black/60 backdrop-blur-xs px-3.5 py-1 rounded-full border border-amber-400/40 text-amber-200 shadow-sm">
              Tap Safari Share Button Below <ArrowDown className="w-3.5 h-3.5 inline text-amber-400 ml-0.5" />
            </p>
            <ArrowDown className="w-8 h-8 text-amber-400 stroke-[2.5]" />
          </div>
        </div>
      )}

      {/* Main Installation Instructions Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-[#FAF6F0] rounded-2xl shadow-2xl border border-[#E8E0D5] overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header Banner */}
            <div className="bg-gradient-to-r from-[#C05621] via-[#A84719] to-[#7C2D12] p-5 text-white text-center relative shrink-0">
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
              <h2 className="font-serif font-bold text-lg sm:text-xl tracking-tight">
                {isIOS ? 'Add to Home Screen' : 'Important Installation Instructions'}
              </h2>
              <p className="text-xs text-amber-100 mt-0.5">
                {isIOS ? 'iPhone & iPad Safari Guide' : 'Currylicious • NAMS Home Kitchen App'}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {isStandalone ? (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                  <h3 className="font-serif font-bold text-lg text-[#2D241E]">App Already Installed!</h3>
                  <p className="text-xs text-[#6E5E53]">
                    Currylicious is running directly as a standalone app on your device. Enjoy fast online ordering!
                  </p>
                  <button
                    onClick={onClose}
                    className="w-full py-2.5 bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-sm rounded-xl transition shadow-sm"
                  >
                    Close Window
                  </button>
                </div>
              ) : isIOS ? (
                /* Dedicated Apple iOS & iPadOS Safari Installation Flow */
                <div className="space-y-4">
                  <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3.5 text-left text-xs text-[#2D241E] flex items-center gap-2.5">
                    <Info className="w-5 h-5 text-[#C05621] shrink-0" />
                    <div>
                      <span className="font-bold block text-sm text-[#9A3412]">iOS Installation Guide</span>
                      <span className="text-[#6E5E53]">Safari on iPhone and iPad requires manual Home Screen addition:</span>
                    </div>
                  </div>

                  <ol className="space-y-2.5 text-xs text-[#2D241E] font-medium">
                    <li className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#E8E0D5] shadow-2xs">
                      <span className="w-6 h-6 rounded-full bg-[#C05621] text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                      <div className="pt-0.5 leading-relaxed">
                        Tap the <span className="font-bold text-[#C05621]">Share button</span> (<Share2 className="w-4 h-4 inline text-[#C05621] -mt-0.5" />) in Safari's toolbar.
                      </div>
                    </li>
                    <li className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#E8E0D5] shadow-2xs">
                      <span className="w-6 h-6 rounded-full bg-[#C05621] text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                      <div className="pt-0.5 leading-relaxed">
                        Scroll down and tap <span className="font-bold text-[#2D241E]">"Add to Home Screen"</span> (<PlusSquare className="w-4 h-4 inline text-[#C05621] -mt-0.5" />).
                      </div>
                    </li>
                    <li className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#E8E0D5] shadow-2xs">
                      <span className="w-6 h-6 rounded-full bg-[#C05621] text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                      <div className="pt-0.5 leading-relaxed">
                        Tap <span className="font-bold text-[#2D241E]">"Add"</span> in the top right corner.
                      </div>
                    </li>
                    <li className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#E8E0D5] shadow-2xs">
                      <span className="w-6 h-6 rounded-full bg-[#C05621] text-white font-bold text-xs flex items-center justify-center shrink-0">4</span>
                      <div className="pt-0.5 leading-relaxed">
                        The <span className="font-bold text-[#C05621]">Currylicious</span> app icon will appear on your Home Screen!
                      </div>
                    </li>
                  </ol>

                  {/* Required Checkbox Section */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#2D241E] select-none p-2.5 rounded-xl bg-white border border-[#E8E0D5] hover:border-amber-300 transition">
                      <input
                        type="checkbox"
                        id="understand-ios-instructions"
                        checked={isReadInstructions}
                        onChange={(e) => setIsReadInstructions(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-[#C05621] focus:ring-[#C05621] border-amber-300 cursor-pointer shrink-0 accent-[#C05621]"
                      />
                      <span className="font-semibold text-[#2D241E] leading-tight">
                        I have read and understood the installation instructions.
                      </span>
                    </label>
                  </div>

                  {/* Action Buttons: Cancel and Continue */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 px-4 bg-[#EFE8DE] hover:bg-[#E2D8C9] text-[#2D241E] font-bold text-xs sm:text-sm rounded-xl transition text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleIosContinue}
                      disabled={!isReadInstructions}
                      className="flex-1 py-3 px-4 bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Continue</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Android / Windows / macOS / Linux / ChromeOS Flow */
                <>
                  {/* Important Installation Instructions Box */}
                  <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-4 text-left text-[#2D241E] space-y-3 shadow-2xs">
                    <div className="font-serif font-bold text-xs sm:text-sm text-[#9A3412] flex items-center gap-2 border-b border-amber-200/70 pb-2">
                      <AlertTriangle className="w-4.5 h-4.5 text-[#C05621] shrink-0" />
                      <span>Installation Notice</span>
                    </div>

                    <p className="text-xs text-[#4A3B32] leading-relaxed">
                      This app may display a security warning on some older Android devices because it is not installed from the Google Play Store. If this happens:
                    </p>

                    <ol className="space-y-2 text-xs text-[#2D241E] font-medium">
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#C05621]/15 text-[#C05621] font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                        <span className="pt-0.5">Tap <strong>'More details'</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#C05621]/15 text-[#C05621] font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                        <span className="pt-0.5">Tap <strong>'Install anyway'</strong> (or the equivalent option shown on your device).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#C05621]/15 text-[#C05621] font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                        <span className="pt-0.5">Continue the installation.</span>
                      </li>
                    </ol>

                    <p className="text-[11px] text-[#6E5E53] italic border-t border-amber-200/70 pt-2">
                      This does not affect the functionality of the application.
                    </p>
                  </div>

                  {/* Checkbox Section */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#2D241E] select-none p-2.5 rounded-xl bg-white border border-[#E8E0D5] hover:border-amber-300 transition">
                      <input
                        type="checkbox"
                        id="understand-instructions"
                        checked={isReadInstructions}
                        onChange={(e) => setIsReadInstructions(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-[#C05621] focus:ring-[#C05621] border-amber-300 cursor-pointer shrink-0 accent-[#C05621]"
                      />
                      <span className="font-semibold text-[#2D241E] leading-tight">
                        I have read and understood the installation instructions.
                      </span>
                    </label>
                  </div>

                  {/* Action Buttons: Cancel and Install */}
                  {deferredPrompt ? (
                    <div className="flex items-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-[#EFE8DE] hover:bg-[#E2D8C9] text-[#2D241E] font-bold text-xs sm:text-sm rounded-xl transition text-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleNativeInstall}
                        disabled={!isReadInstructions || installing}
                        className="flex-1 py-3 px-4 bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4" />
                        <span>{installing ? 'Installing...' : 'Install App'}</span>
                      </button>
                    </div>
                  ) : (
                    /* Desktop / General Fallback Instructions */
                    <div className="space-y-3 pt-2">
                      <div className="bg-white p-3 rounded-xl border border-[#E8E0D5] text-xs text-[#2D241E] space-y-2">
                        <div className="font-bold flex items-center gap-1.5 text-sm text-[#C05621]">
                          <Monitor className="w-4 h-4" /> Browser Menu Instructions
                        </div>
                        <p>
                          To install in Chrome, Edge, Brave, or Samsung Internet:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-slate-700">
                          <li>Look for the <span className="font-semibold text-[#C05621]">Install icon</span> (<ArrowUpRight className="w-3.5 h-3.5 inline" />) in your browser address bar.</li>
                          <li>Or click the <strong>3 dots menu (⋮)</strong> top right → <strong>"Install Currylicious"</strong> or <strong>"Add to Home screen"</strong>.</li>
                        </ol>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={onClose}
                          className="w-full py-2.5 bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-xs rounded-xl transition"
                        >
                          Close Instructions
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};


