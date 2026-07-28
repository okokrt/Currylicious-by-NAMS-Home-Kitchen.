import React from 'react';
import { MenuItem, UserRole } from '../types';
import { Heart, Flame, Plus, Minus, Edit2, Trash2, Clock, Sparkles } from 'lucide-react';

interface DishCardProps {
  dish: MenuItem;
  role: UserRole;
  isFavorite: boolean;
  cartQuantity: number;
  isStoreOpen?: boolean;
  onToggleFavorite: (dishId: string) => void;
  onAddToCart: (dish: MenuItem) => void;
  onUpdateQuantity: (dishId: string, qty: number) => void;
  onEditDish?: (dish: MenuItem) => void;
  onDeleteDish?: (dishId: string) => void;
  onToggleAvailability?: (dishId: string) => void;
}

export const DishCard: React.FC<DishCardProps> = ({
  dish,
  role,
  isFavorite,
  cartQuantity,
  isStoreOpen = true,
  onToggleFavorite,
  onAddToCart,
  onUpdateQuantity,
  onEditDish,
  onDeleteDish,
  onToggleAvailability,
}) => {
  const renderSpiceIndicator = (level?: string) => {
    if (!level || level === 'Mild') return null;
    const count = level === 'Medium' ? 1 : level === 'Spicy' ? 2 : 3;
    return (
      <div className="flex items-center gap-0.5 text-xs font-semibold text-[#C05621] bg-[#F9EFE6] px-2 py-0.5 rounded-full border border-[#EAC8B4]">
        {Array.from({ length: count }).map((_, i) => (
          <Flame key={i} className="w-3 h-3 text-[#C05621] fill-[#C05621]" />
        ))}
        <span className="ml-0.5 text-[10px] font-bold text-[#A84719]">{level}</span>
      </div>
    );
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border ${
        !dish.isAvailable ? 'opacity-60 border-gray-300' : 'border-[#EAE2D7] hover:border-[#C05621]/40'
      } shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden`}
    >
      {/* Card Image Banner */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F2ECE1]">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {dish.isBestseller && (
            <span className="bg-[#C05621] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-200" /> Bestseller
            </span>
          )}
          {dish.isVegetarian && (
            <span className="bg-[#386641] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              🌱 Veg
            </span>
          )}
          {!dish.isAvailable && (
            <span className="bg-rose-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Favorite Heart Button (Customer Mode) */}
        {role === 'customer' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(dish.id);
            }}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 transition active:scale-90 shadow-xs z-10"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-rose-600 text-rose-600' : 'text-gray-600 hover:text-rose-600'
              }`}
            />
          </button>
        )}

        {/* Price Tag Overlay */}
        <div className="absolute bottom-2.5 left-2.5 bg-[#2D241E]/90 text-amber-200 border border-[#C05621]/40 px-2.5 py-1 rounded-lg text-sm sm:text-base font-black shadow-sm backdrop-blur-sm">
          ₱{dish.price.toLocaleString()}
        </div>

        {/* Prep Time */}
        {dish.preparationTimeMinutes && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 text-[10px] font-semibold text-white/90 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
            <Clock className="w-3 h-3 text-amber-300" />
            <span>{dish.preparationTimeMinutes} mins</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D241E] leading-snug">
              {dish.name}
            </h3>
            {renderSpiceIndicator(dish.spicyLevel)}
          </div>
          <p className="text-xs text-[#6E5E53] mt-1 line-clamp-2 font-normal leading-relaxed">
            {dish.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-[#EAE2D7]">
          {role === 'customer' ? (
            cartQuantity > 0 ? (
              <div className="flex items-center justify-between bg-[#FAF6F0] rounded-xl p-1 border border-[#D9CEBF]">
                <button
                  onClick={() => onUpdateQuantity(dish.id, cartQuantity - 1)}
                  className="w-8 h-8 rounded-lg bg-[#EFE8DE] hover:bg-[#E3D8C8] text-[#2D241E] flex items-center justify-center font-bold text-sm transition active:scale-90"
                >
                  <Minus className="w-4 h-4 text-[#2D241E]" />
                </button>
                <span className="font-bold text-[#2D241E] text-xs sm:text-sm px-2">
                  {cartQuantity} in cart
                </span>
                <button
                  onClick={() => {
                    if (!isStoreOpen) {
                      alert('Sorry, the kitchen is closed right now.');
                      return;
                    }
                    onUpdateQuantity(dish.id, cartQuantity + 1);
                  }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition active:scale-90 ${
                    isStoreOpen
                      ? 'bg-[#C05621] hover:bg-[#A84719] text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                disabled={!dish.isAvailable || !isStoreOpen}
                onClick={() => {
                  if (!isStoreOpen) {
                    alert('Sorry, the kitchen is closed right now.');
                    return;
                  }
                  onAddToCart(dish);
                }}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-xs ${
                  !isStoreOpen
                    ? 'bg-rose-100 text-rose-800 border border-rose-200 cursor-not-allowed'
                    : dish.isAvailable
                    ? 'bg-[#C05621] hover:bg-[#A84719] text-white active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>
                  {!isStoreOpen
                    ? 'Kitchen Closed'
                    : dish.isAvailable
                    ? 'Add to Cart'
                    : 'Currently Unavailable'}
                </span>
              </button>
            )
          ) : (
            /* Owner Controls */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#6E5E53]">
                <span className="font-medium">Status:</span>
                <button
                  onClick={() => onToggleAvailability && onToggleAvailability(dish.id)}
                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] transition ${
                    dish.isAvailable
                      ? 'bg-[#386641]/10 text-[#386641] border border-[#386641]/30'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {dish.isAvailable ? 'Available' : 'Mark Available'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditDish && onEditDish(dish)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#EFE8DE] hover:bg-[#E3D8C8] text-[#2D241E] font-semibold text-xs border border-[#D9CEBF] flex items-center justify-center gap-1 transition"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#C05621]" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDeleteDish && onDeleteDish(dish.id)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                  title="Delete dish"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
