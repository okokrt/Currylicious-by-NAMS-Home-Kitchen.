import React, { useState, useEffect } from 'react';
import { CartItem, OrderDetails, StoreSettings } from '../types';
import { ShoppingBag, X, Trash2, MessageSquare, Phone, Sparkles, MapPin, User, Clock, CreditCard, ChevronRight, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (dishId: string, qty: number) => void;
  onUpdateInstructions: (dishId: string, text: string) => void;
  onClearCart: () => void;
  onSendWhatsAppOrder: (orderDetails: OrderDetails) => void;
  storeSettings: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onUpdateInstructions,
  onClearCart,
  onSendWhatsAppOrder,
  storeSettings,
}) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    customerName: '',
    contactNumber: '',
    orderType: 'Delivery',
    deliveryAddress: '',
    specialInstructions: '',
    paymentMethod: 'GCash',
  });

  const [aiPairingTip, setAiPairingTip] = useState<string>('');
  const [loadingAiTip, setLoadingAiTip] = useState<boolean>(false);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.dish.price * item.quantity,
    0
  );
  const deliveryFee = orderDetails.orderType === 'Delivery' && subtotal > 0 ? 50 : 0;
  const totalPrice = subtotal + deliveryFee;

  // Fetch AI Pairing Suggestion when cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      setLoadingAiTip(true);
      fetch('/api/gemini/suggest-pairings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cartItems.map((i) => ({ name: i.dish.name })) }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.suggestion) setAiPairingTip(data.suggestion);
        })
        .catch(() => {
          setAiPairingTip('Pro Tip: Pair your curries with hot Garlic Naan and chilled Mango Lassi!');
        })
        .finally(() => setLoadingAiTip(false));
    } else {
      setAiPairingTip('');
    }
  }, [cartItems.length]);

  if (!isOpen) return null;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeSettings.isStoreOpen) {
      alert('Sorry, the kitchen is closed right now. Orders cannot be placed at the moment.');
      return;
    }
    if (!orderDetails.customerName.trim()) {
      alert('Please enter your name for the order.');
      return;
    }
    if (!orderDetails.contactNumber.trim()) {
      alert('Please enter your contact phone number.');
      return;
    }
    if (orderDetails.orderType === 'Delivery' && !orderDetails.deliveryAddress?.trim()) {
      alert('Please enter your delivery address.');
      return;
    }

    onSendWhatsAppOrder(orderDetails);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-[#FAF6F0] text-[#2D241E] h-full flex flex-col justify-between shadow-2xl border-l border-[#E8E0D5] overflow-hidden">
        
        {/* Cart Header */}
        <div className="bg-white px-4 py-3.5 border-b border-[#E8E0D5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-[#F9EFE6] text-[#C05621]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#2D241E] leading-tight">
                Your Currylicious Cart
              </h2>
              <p className="text-xs text-[#6E5E53]">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-rose-700 hover:text-rose-800 font-semibold px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 transition"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#EFE8DE] text-[#2D241E] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">

          {/* Kitchen Closed Warning Notice */}
          {!storeSettings.isStoreOpen && (
            <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3.5 text-rose-800 text-xs font-semibold flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Sorry, the kitchen is closed right now. You cannot place an order at the moment.</span>
            </div>
          )}

          {/* AI Chef Pairing Suggestion Box */}
          {cartItems.length > 0 && (
            <div className="bg-white border border-[#C05621]/30 rounded-2xl p-3.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#C05621] mb-1">
                <Sparkles className="w-4 h-4 text-[#C05621]" />
                <span>AI Chef Pairing Recommendation</span>
              </div>
              <p className="text-xs text-[#52443A] leading-relaxed italic">
                {loadingAiTip ? 'Consulting Currylicious AI Chef...' : aiPairingTip}
              </p>
            </div>
          )}

          {/* Empty State */}
          {cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-3 text-[#6E5E53]">
              <ShoppingBag className="w-12 h-12 mx-auto text-[#C05621]/30" />
              <p className="text-base font-semibold text-[#2D241E]">Your cart is empty!</p>
              <p className="text-xs text-[#6E5E53] max-w-xs mx-auto">
                Explore our authentic curries, sizzling fusion dishes, and hot naan to start your order.
              </p>
              <button
                onClick={onClose}
                className="mt-3 px-5 py-2.5 rounded-xl bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-xs transition shadow-xs"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            /* Item List */
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.dish.id}
                  className="bg-white rounded-xl p-3 border border-[#EAE2D7] shadow-xs space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={item.dish.imageUrl}
                      alt={item.dish.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0 border border-[#E8E0D5]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-sm text-[#2D241E] truncate">
                        {item.dish.name}
                      </h4>
                      <div className="text-xs font-extrabold text-[#C05621] mt-0.5">
                        ₱{item.dish.price.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-[#6E5E53]">each</span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-[#FAF6F0] rounded-lg p-1 border border-[#D9CEBF]">
                      <button
                        onClick={() => onUpdateQuantity(item.dish.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-[#EFE8DE] hover:bg-[#E3D8C8] text-[#2D241E] flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-[#2D241E] w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.dish.id, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-[#C05621] hover:bg-[#A84719] text-white flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Special Instruction Input */}
                  <input
                    type="text"
                    value={item.instructions || ''}
                    onChange={(e) => onUpdateInstructions(item.dish.id, e.target.value)}
                    placeholder="Custom instruction (e.g. Extra spicy, no coriander)..."
                    className="w-full px-2.5 py-1 bg-[#FAF6F0] border border-[#D9CEBF] rounded-lg text-xs text-[#2D241E] placeholder-[#9A8B7E] focus:outline-none focus:border-[#C05621]"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Customer Delivery Form */}
          {cartItems.length > 0 && (
            <form id="orderForm" onSubmit={handleSubmitOrder} className="bg-white rounded-xl p-3.5 border border-[#EAE2D7] shadow-xs space-y-3 text-xs">
              <h3 className="font-serif font-bold text-sm text-[#2D241E] border-b border-[#E8E0D5] pb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#C05621]" />
                <span>Customer & Delivery Details</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#2D241E] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderDetails.customerName}
                    onChange={(e) => setOrderDetails({ ...orderDetails, customerName: e.target.value })}
                    placeholder="Juan Dela Cruz"
                    className="w-full px-2.5 py-1.5 bg-[#FAF6F0] border border-[#D9CEBF] rounded-lg text-[#2D241E] placeholder-[#9A8B7E] focus:outline-none focus:border-[#C05621]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#2D241E] mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={orderDetails.contactNumber}
                    onChange={(e) => setOrderDetails({ ...orderDetails, contactNumber: e.target.value })}
                    placeholder="0917 123 4567"
                    className="w-full px-2.5 py-1.5 bg-[#FAF6F0] border border-[#D9CEBF] rounded-lg text-[#2D241E] placeholder-[#9A8B7E] focus:outline-none focus:border-[#C05621]"
                  />
                </div>
              </div>

              {/* Order Type Buttons */}
              <div>
                <label className="block text-[11px] font-semibold text-[#2D241E] mb-1">
                  Order Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Delivery', 'Pickup', 'Dine-In'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderDetails({ ...orderDetails, orderType: type })}
                      className={`py-1.5 rounded-lg text-[11px] font-bold transition ${
                        orderDetails.orderType === type
                          ? 'bg-[#C05621] text-white shadow-xs'
                          : 'bg-[#FAF6F0] text-[#6E5E53] border border-[#D9CEBF] hover:bg-[#EFE8DE]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address Input for Delivery */}
              {orderDetails.orderType === 'Delivery' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#2D241E] mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={orderDetails.deliveryAddress}
                    onChange={(e) => setOrderDetails({ ...orderDetails, deliveryAddress: e.target.value })}
                    placeholder="Complete Street Address, House/Unit #, Barangay, City..."
                    className="w-full px-2.5 py-1.5 bg-[#FAF6F0] border border-[#D9CEBF] rounded-lg text-[#2D241E] placeholder-[#9A8B7E] focus:outline-none focus:border-[#C05621]"
                  />
                </div>
              )}

              {/* Payment Method Option - GCash Only */}
              <div>
                <label className="block text-[11px] font-semibold text-[#2D241E] mb-1">
                  Payment Method
                </label>
                <div className="flex items-center gap-3 p-2.5 bg-[#F0F7FF] border border-[#BEE3F8] rounded-lg">
                  <div className="w-8 h-8 rounded-md bg-[#005CE6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    G
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#2D241E] flex items-center justify-between">
                      <span>GCash Only</span>
                      <span className="text-[10px] bg-[#005CE6] text-white font-semibold px-2 py-0.5 rounded-full">Primary</span>
                    </div>
                    <p className="text-[10px] text-[#4A5568] mt-0.5">
                      Send GCash payment to: <span className="font-semibold text-[#2D241E]">{storeSettings.phoneNumber || '+63 917 677 9779'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-[#2D241E] mb-1">
                  Order / Delivery Notes
                </label>
                <input
                  type="text"
                  value={orderDetails.specialInstructions || ''}
                  onChange={(e) => setOrderDetails({ ...orderDetails, specialInstructions: e.target.value })}
                  placeholder="Gate code, landmark, preferred time..."
                  className="w-full px-2.5 py-1.5 bg-[#FAF6F0] border border-[#D9CEBF] rounded-lg text-[#2D241E] placeholder-[#9A8B7E] focus:outline-none focus:border-[#C05621]"
                />
              </div>
            </form>
          )}

        </div>

        {/* Footer Summary & Direct WhatsApp Action */}
        {cartItems.length > 0 && (
          <div className="bg-white p-4 border-t border-[#E8E0D5] space-y-3">
            <div className="space-y-1 text-xs text-[#6E5E53]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-[#2D241E]">₱{subtotal.toLocaleString()}</span>
              </div>
              {orderDetails.orderType === 'Delivery' && (
                <div className="flex justify-between text-[#C05621]">
                  <span>Estimated Delivery Fee:</span>
                  <span className="font-semibold">₱{deliveryFee}</span>
                </div>
              )}
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-[#2D241E] pt-1.5 border-t border-[#E8E0D5]">
                <span>Total Amount:</span>
                <span className="text-[#C05621]">₱{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Direct WhatsApp Order Action */}
            <div className="grid grid-cols-1 gap-2">
              <button
                type="submit"
                form="orderForm"
                disabled={!storeSettings.isStoreOpen}
                className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition ${
                  storeSettings.isStoreOpen
                    ? 'bg-[#25D366] hover:bg-[#20bd5a] text-white active:scale-[0.98]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-400'
                }`}
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>
                  {storeSettings.isStoreOpen
                    ? 'Place Order via WhatsApp'
                    : 'Kitchen Closed - Cannot Place Order'}
                </span>
                {storeSettings.isStoreOpen && <ChevronRight className="w-4 h-4" />}
              </button>

              <a
                href={`tel:${storeSettings.phoneNumber}`}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE8DE] text-[#2D241E] font-semibold text-xs flex items-center justify-center gap-1.5 border border-[#D9CEBF] transition"
              >
                <Phone className="w-4 h-4 text-[#C05621]" />
                <span>Or Call Restaurant Directly ({storeSettings.phoneNumber})</span>
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
