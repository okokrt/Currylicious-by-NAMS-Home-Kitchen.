import React, { useState } from 'react';
import { CartItem, OrderDetails, StoreSettings } from '../types';
import { MessageSquare, Copy, Check, Phone, X, ExternalLink } from 'lucide-react';

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

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.dish.price * item.quantity,
    0
  );
  const deliveryFee = orderDetails.orderType === 'Delivery' ? 50 : 0;
  const grandTotal = subtotal + deliveryFee;

  // Build formatted WhatsApp message with markdown styling (*bold*, emojis, line breaks)
  const buildWhatsAppMessage = (): string => {
    let msg = `*🌶️ NEW ORDER - ${storeSettings.restaurantName}*\n`;
    msg += `------------------------------------\n`;
    msg += `👤 *Customer:* ${orderDetails.customerName}\n`;
    msg += `📞 *Phone:* ${orderDetails.contactNumber}\n`;
    msg += `🛵 *Type:* ${orderDetails.orderType}\n`;
    if (orderDetails.orderType === 'Delivery' && orderDetails.deliveryAddress) {
      msg += `📍 *Address:* ${orderDetails.deliveryAddress}\n`;
    }
    msg += `💳 *Payment:* ${orderDetails.paymentMethod}\n`;
    if (orderDetails.specialInstructions) {
      msg += `📝 *Order Note:* ${orderDetails.specialInstructions}\n`;
    }
    msg += `------------------------------------\n`;
    msg += `📋 *ORDER ITEMS:*\n`;

    cartItems.forEach((item, index) => {
      msg += `${index + 1}. *${item.dish.name}* x${item.quantity} = ₱${(item.dish.price * item.quantity).toLocaleString()}\n`;
      if (item.instructions) {
        msg += `   └ Note: _${item.instructions}_\n`;
      }
    });

    msg += `------------------------------------\n`;
    msg += `💵 *Subtotal:* ₱${subtotal.toLocaleString()}\n`;
    if (orderDetails.orderType === 'Delivery') {
      msg += `🛵 *Delivery Fee:* ₱${deliveryFee}\n`;
    }
    msg += `💰 *TOTAL AMOUNT:* *₱${grandTotal.toLocaleString()}*\n`;
    msg += `------------------------------------\n`;
    msg += `✨ _Thank you for ordering from Currylicious by NAMS Home Kitchen!_`;

    return msg;
  };

  const rawText = buildWhatsAppMessage();
  const encodedText = encodeURIComponent(rawText);
  // Clean phone number for wa.me URL
  const cleanPhone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

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
                WhatsApp Order Summary
              </h3>
              <p className="text-xs text-emerald-100">
                Ready to send to Currylicious by NAMS Home Kitchen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Formatted Summary Box */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 no-scrollbar">
          <div className="flex items-center justify-between text-xs text-[#6E5E53] px-1">
            <span>Generated Message Preview:</span>
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1 text-[#128C7E] hover:text-[#075E54] font-bold"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied to Clipboard!</span>
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
            <span>Send Order via WhatsApp Now</span>
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
              <span>Call Owner</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
