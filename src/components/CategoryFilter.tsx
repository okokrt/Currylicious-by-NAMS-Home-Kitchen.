import React from 'react';
import { Category } from '../types';
import { Flame, Sparkles, Utensils, Heart, Search } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: Category;
  onSelectCategory: (cat: Category) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (val: boolean) => void;
  favoritesCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  showFavoritesOnly,
  setShowFavoritesOnly,
  favoritesCount,
}) => {
  return (
    <div className="bg-[#FAF6F0] border-b border-[#E8E0D5] py-3 px-3 sm:px-6 sticky top-[57px] sm:top-[61px] z-20 shadow-xs">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Search Bar & Favorites Filter */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#C05621] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search dish name (e.g. Butter Chicken, Garlic Naan, Sisig...)"
              className="w-full pl-9 pr-9 py-2 bg-white border border-[#D9CEBF] rounded-full text-xs sm:text-sm text-[#2D241E] placeholder-[#9A8B7E] focus:outline-none focus:border-[#C05621] focus:ring-1 focus:ring-[#C05621]/30 shadow-xs transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold flex items-center justify-center text-xs transition"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 shrink-0 transition ${
              showFavoritesOnly
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-white' : 'text-rose-600'}`} />
            <span className="hidden sm:inline">Favorites</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800">
              {favoritesCount}
            </span>
          </button>
        </div>

        {/* Quick Search Chips when no search query */}
        {!searchQuery && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] text-[#6E5E53] py-0.5">
            <span className="font-extrabold text-[#8C7A6B] shrink-0">Popular:</span>
            {['Butter Chicken', 'Garlic Naan', 'Pork Sisig', 'Samosa', 'Lassi', 'Kare-Kare'].map((tag) => (
              <button
                key={tag}
                onClick={() => onSearchChange(tag)}
                className="px-2 py-0.5 rounded-md bg-white hover:bg-[#F2ECE1] border border-[#E3D8C8] text-[#52443A] font-medium shrink-0 transition active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Category Touch Slider */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
          {categories.map((cat) => {
            const isActive = !showFavoritesOnly && activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setShowFavoritesOnly(false);
                  onSelectCategory(cat);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#C05621] text-white font-bold shadow-xs'
                    : 'bg-white text-[#52443A] hover:bg-[#F2ECE1] border border-[#E3D8C8]'
                }`}
              >
                {cat === 'Signature Curries' && <Flame className={`w-3.5 h-3.5 ${isActive ? 'text-amber-200' : 'text-[#C05621]'}`} />}
                {cat === 'Main Course' && <Sparkles className={`w-3.5 h-3.5 ${isActive ? 'text-amber-200' : 'text-[#386641]'}`} />}
                {cat === 'Starters & Snacks' && <Utensils className={`w-3.5 h-3.5 ${isActive ? 'text-amber-200' : 'text-[#D97706]'}`} />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
