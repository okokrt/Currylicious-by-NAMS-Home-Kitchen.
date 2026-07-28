import React from 'react';
import { ShoppingBag, Heart, ShieldCheck, User, Store, Phone, MessageSquare, Star } from 'lucide-react';
import { UserRole, StoreSettings } from '../types';
import logoImg from '../assets/images/currylicious_logo_1785234718076.jpg';

interface HeaderProps {
  role: UserRole;
  cartCount: number;
  favoritesCount: number;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (val: boolean) => void;
  onOpenCart: () => void;
  onOpenFeedback: () => void;
  onSwitchRoleClick: () => void;
  storeSettings: StoreSettings;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  cartCount,
  favoritesCount,
  showFavoritesOnly,
  setShowFavoritesOnly,
  onOpenCart,
  onOpenFeedback,
  onSwitchRoleClick,
  storeSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF6F0] text-[#2D241E] shadow-sm border-b border-[#E8E0D5]">
      {/* Notice Banner if store announcement exists */}
      {storeSettings.announcement && (
        <div className="bg-[#C05621] text-amber-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-inner">
          <span className="text-amber-200">✨</span>
          <span className="truncate">{storeSettings.announcement}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer shrink-0" onClick={() => setShowFavoritesOnly(false)}>
          <img
            src={logoImg}
            alt="Currylicious Logo"
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-full object-cover border-2 border-[#C05621] shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif font-bold text-lg sm:text-2xl text-[#2D241E] tracking-tight leading-none">
                Currylicious
              </h1>
              {role === 'owner' && (
                <span className="bg-[#386641] text-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3 h-3" /> Owner
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-[#6E5E53] font-medium">
              by NAMS Home Kitchen
            </p>
          </div>
        </div>

        {/* Header Contact & Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Direct Phone Call Button */}
          <a
            href={`tel:${storeSettings.phoneNumber}`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFE8DE] hover:bg-[#E3D8C8] text-[#2D241E] text-xs font-semibold transition border border-[#D9CEBF]"
            title="Call / WhatsApp / Viber Restaurant"
          >
            <Phone className="w-3.5 h-3.5 text-[#C05621]" />
            <span>Call: {storeSettings.phoneNumber}</span>
          </a>

          {/* WhatsApp Direct Link */}
          <a
            href={`https://wa.me/${storeSettings.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition shadow-xs"
            title="Chat on WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-white text-white" />
            <span>WhatsApp</span>
          </a>

          {/* Customer Feedback Button */}
          <button
            onClick={onOpenFeedback}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-[#EFE8DE] hover:bg-[#E3D8C8] text-[#2D241E] text-xs font-semibold flex items-center gap-1.5 transition border border-[#D9CEBF]"
            title="Give Feedback & View Reviews"
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="hidden sm:inline">Feedback</span>
          </button>

          {/* Customer Favorites Button */}
          {role === 'customer' && (
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                showFavoritesOnly
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-[#EFE8DE] text-[#2D241E] hover:bg-[#E3D8C8]'
              }`}
              title="My Favorite Dishes"
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-white' : 'text-rose-600'}`} />
              <span className="hidden sm:inline">Favorites</span>
              {favoritesCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[10px] rounded-full font-bold">
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Icon Button for Customers */}
          {role === 'customer' && (
            <button
              onClick={onOpenCart}
              className="relative p-2.5 sm:px-3.5 sm:py-1.5 rounded-full bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-sm active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Switch Mode / Login Button */}
          <button
            onClick={onSwitchRoleClick}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-[#EFE8DE] hover:bg-[#E3D8C8] text-[#2D241E] text-xs font-semibold flex items-center gap-1.5 transition border border-[#D9CEBF]"
            title="Switch Access Mode"
          >
            {role === 'owner' ? (
              <>
                <User className="w-4 h-4 text-[#386641]" />
                <span className="hidden sm:inline">Customer View</span>
              </>
            ) : (
              <>
                <Store className="w-4 h-4 text-[#C05621]" />
                <span className="hidden sm:inline">Owner Access</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
