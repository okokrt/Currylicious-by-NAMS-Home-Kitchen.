import React, { useState, useEffect } from 'react';
import { MenuItem, Category, SpiceLevel } from '../types';
import { X, Upload, Sparkles, Image, Flame, Check } from 'lucide-react';

interface DishFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDish: (dishData: Partial<MenuItem>) => void;
  editingDish: MenuItem | null;
  categories: Category[];
}

export const DishFormModal: React.FC<DishFormModalProps> = ({
  isOpen,
  onClose,
  onSaveDish,
  editingDish,
  categories,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Signature Curries');
  const [price, setPrice] = useState<string>('250');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [spicyLevel, setSpicyLevel] = useState<SpiceLevel>('Medium');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [prepTime, setPrepTime] = useState('20');
  
  const [generatingAi, setGeneratingAi] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (editingDish) {
      setName(editingDish.name);
      setCategory(editingDish.category);
      setPrice(editingDish.price.toString());
      setDescription(editingDish.description);
      setImageUrl(editingDish.imageUrl);
      setImagePreview(editingDish.imageUrl);
      setSpicyLevel(editingDish.spicyLevel || 'Medium');
      setIsVegetarian(!!editingDish.isVegetarian);
      setIsBestseller(!!editingDish.isBestseller);
      setIsAvailable(editingDish.isAvailable);
      setPrepTime((editingDish.preparationTimeMinutes || 20).toString());
    } else {
      setName('');
      setCategory('Signature Curries');
      setPrice('280');
      setDescription('');
      setImageUrl('https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800');
      setImagePreview('https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800');
      setSpicyLevel('Medium');
      setIsVegetarian(false);
      setIsBestseller(false);
      setIsAvailable(true);
      setPrepTime('20');
    }
  }, [editingDish, isOpen]);

  if (!isOpen) return null;

  // Photo upload from phone gallery / camera / WhatsApp saved photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageUrl(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // AI Description Generator
  const handleGenerateAiDescription = async () => {
    if (!name.trim()) {
      alert('Please enter a dish name first so AI can describe it!');
      return;
    }
    setGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini/describe-dish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          price: parseFloat(price) || 0,
          spicyLevel,
        }),
      });
      const data = await res.json();
      if (data.description) {
        setDescription(data.description);
      }
    } catch (err) {
      console.error('Failed to generate description', err);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Dish name is required');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      alert('Please enter a valid price in Php');
      return;
    }

    onSaveDish({
      id: editingDish ? editingDish.id : `dish-${Date.now()}`,
      name,
      category,
      price: numPrice,
      description: description || 'A delicious home-cooked dish from Currylicious NAMS Home Kitchen.',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800',
      spicyLevel,
      isVegetarian,
      isBestseller,
      isAvailable,
      preparationTimeMinutes: parseInt(prepTime) || 20,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF6F0] border border-[#D9CEBF] rounded-2xl shadow-2xl overflow-hidden text-[#2D241E] max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-white px-4 py-3 border-b border-[#E8E0D5] flex items-center justify-between gap-2">
          <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D241E] truncate">
            {editingDish ? 'Edit Dish Details' : 'Add New Dish to Menu'}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="submit"
              form="dishForm"
              className="px-3.5 py-1.5 rounded-xl bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingDish ? 'Save Changes' : 'Add Dish'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#EFE8DE] text-[#2D241E] transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Form Scrollable */}
        <form id="dishForm" onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto space-y-4 text-xs no-scrollbar">
          
          {/* Top Submit Action Bar inside Form */}
          <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 flex items-center justify-between gap-2 sm:hidden">
            <span className="font-semibold text-[#6E5E53] text-[11px]">
              Ready to submit?
            </span>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-xs flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingDish ? 'Save Changes' : 'Add Dish'}</span>
            </button>
          </div>
          
          {/* Photo Upload Section */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#2D241E]">
              Dish Photo (Upload from Phone Gallery / WhatsApp or Image URL)
            </label>
            <div className="flex gap-3 items-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Dish preview"
                  className="w-20 h-20 rounded-xl object-cover border-2 border-[#D9CEBF] shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-white border border-dashed border-[#D9CEBF] flex items-center justify-center shrink-0 text-[#C05621]">
                  <Image className="w-8 h-8" />
                </div>
              )}

              <div className="flex-1 space-y-2">
                <label className="cursor-pointer px-3 py-2 bg-white hover:bg-[#EFE8DE] text-[#C05621] border border-[#D9CEBF] rounded-xl font-bold text-xs flex items-center gap-1.5 justify-center transition shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo from Gallery / Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="Or paste image URL..."
                  className="w-full px-2.5 py-1.5 bg-white border border-[#D9CEBF] rounded-lg text-[#2D241E] placeholder-[#9A8B7E] focus:outline-none focus:border-[#C05621]"
                />
              </div>
            </div>
          </div>

          {/* Dish Name */}
          <div className="space-y-1">
            <label className="block font-semibold text-[#2D241E]">
              Dish Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Special Coconut Lamb Curry"
              className="w-full px-3 py-2 bg-white border border-[#D9CEBF] rounded-xl text-[#2D241E] placeholder-[#9A8B7E] focus:outline-none focus:border-[#C05621] text-sm font-semibold"
            />
          </div>

          {/* Category & Price in PHP */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-[#2D241E]">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 bg-white border border-[#D9CEBF] rounded-xl text-[#2D241E] focus:outline-none focus:border-[#C05621]"
              >
                {categories.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#2D241E]">
                Price in PHP (₱) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C05621] font-bold">₱</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="250"
                  className="w-full pl-7 pr-3 py-2 bg-white border border-[#D9CEBF] rounded-xl text-[#2D241E] focus:outline-none focus:border-[#C05621] font-bold"
                />
              </div>
            </div>
          </div>

          {/* Spice Level & Prep Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-[#2D241E]">
                Spicy Level
              </label>
              <select
                value={spicyLevel}
                onChange={(e) => setSpicyLevel(e.target.value as SpiceLevel)}
                className="w-full px-3 py-2 bg-white border border-[#D9CEBF] rounded-xl text-[#2D241E] focus:outline-none focus:border-[#C05621]"
              >
                <option value="Mild">Mild 🌶️</option>
                <option value="Medium">Medium 🌶️🌶️</option>
                <option value="Spicy">Spicy 🌶️🌶️🌶️</option>
                <option value="Extra Hot">Extra Hot 🔥🔥🔥</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-[#2D241E]">
                Prep Time (mins)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D9CEBF] rounded-xl text-[#2D241E] focus:outline-none focus:border-[#C05621]"
              />
            </div>
          </div>

          {/* Description & AI Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-[#2D241E]">
                Menu Description
              </label>
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={generatingAi}
                className="px-2.5 py-1 bg-white hover:bg-[#EFE8DE] text-[#C05621] font-bold rounded-lg border border-[#D9CEBF] flex items-center gap-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C05621]" />
                <span>{generatingAi ? 'Generating AI...' : 'AI Generate Description'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Flavorful description highlighting home-ground spices and fresh herbs..."
              className="w-full px-3 py-2 bg-white border border-[#D9CEBF] rounded-xl text-[#2D241E] placeholder-[#9A8B7E] focus:outline-none focus:border-[#C05621]"
            />
          </div>

          {/* Checkbox Toggles */}
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isVegetarian}
                onChange={(e) => setIsVegetarian(e.target.checked)}
                className="w-4 h-4 rounded accent-[#386641]"
              />
              <span className="text-[#2D241E] font-medium">🌱 Vegetarian Dish</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-4 h-4 rounded accent-[#C05621]"
              />
              <span className="text-[#2D241E] font-medium">✨ Bestseller Tag</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded accent-[#386641]"
              />
              <span className="text-[#2D241E] font-medium">Available in Menu</span>
            </label>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-[#E8E0D5] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#EFE8DE] text-[#2D241E] font-semibold border border-[#D9CEBF]"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="dishForm"
            className="px-5 py-2 rounded-xl bg-[#C05621] hover:bg-[#A84719] text-white font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>{editingDish ? 'Save Changes' : 'Add Dish'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
