import React, { useState } from 'react';
import { CartItem, OrderDetails, StoreSettings } from '../types';
import { buildWhatsAppOrderMessage, generateWhatsAppUrl } from '../utils/whatsapp';
import { MessageSquare, Copy, Check, Phone, X, ExternalLink, CheckCircle } from 'lucide-react';

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  orderDetails: OrderDetails;
  storeSettings: StoreSettings;
  onConfirmOrderSent: () => void;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  orderDetails,
  storeSettings,
  onConfirmOrderSent,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const rawText = buildWhatsAppOrderMessage(cartItems, orderDetails, storeSettings);
  const whatsappUrl = generateWhatsAppUrl(cartItems, orderDetails, storeSettings);

  const handleCopyText = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
    onConfirmOrderSent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF6F0] border border-[#D9CEBF] rounded-2xl shadow-2xl overflow-hidden text-[#2D241E] max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-[#128C7E] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-white/20 text-white">
              <MessageSquare className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                WhatsApp Order Sent to Owner
              </h3>
              <p className="text-xs text-emerald-100">
                Directly sent to {storeSettings.restaurantName} (+63 917 677 9779)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onConfirmOrderSent();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Formatted Summary Box */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 no-scrollbar">
          
          {/* Auto-Dispatched Banner */}
          <div className="p-3 bg-[#E6F4EA] border border-[#34A853]/30 rounded-xl flex items-start gap-2.5 text-xs text-[#137333]">
            <CheckCircle className="w-5 h-5 shrink-0 text-[#34A853] mt-0.5" />
            <div>
              <span className="font-bold block">Order automatically sent to WhatsApp!</span>
              <span>Your complete order summary has been prefilled and sent to the owner on WhatsApp. If popups were blocked, click <strong>"Re-open WhatsApp Chat"</strong> below.</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6E5E53] px-1">
            <span>Sent Message Summary:</span>
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1 text-[#128C7E] hover:text-[#075E54] font-bold"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Message</span>
                </>
              )}
            </button>
          </div>

          <pre className="w-full p-3.5 bg-white border border-[#E8E0D5] rounded-xl text-xs text-[#2D241E] font-mono whitespace-pre-wrap break-words leading-relaxed shadow-inner">
            {rawText}
          </pre>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-white border-t border-[#E8E0D5] space-y-2">
          <button
            onClick={handleOpenWhatsApp}
            className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition"
          >
            <MessageSquare className="w-5 h-5 fill-white" />
            <span>Re-open WhatsApp Chat with Owner</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyText}
              className="py-2 px-3 rounded-lg bg-[#FAF6F0] hover:bg-[#EFE8DE] text-[#2D241E] text-xs font-semibold border border-[#D9CEBF] flex items-center justify-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <a
              href={`tel:${storeSettings.phoneNumber}`}
              className="py-2 px-3 rounded-lg bg-[#FAF6F0] hover:bg-[#EFE8DE] text-[#2D241E] text-xs font-semibold border border-[#D9CEBF] flex items-center justify-center gap-1.5 transition text-center"
            >
              <Phone className="w-3.5 h-3.5 text-[#C05621]" />
              <span>Call Owner ({storeSettings.phoneNumber})</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

