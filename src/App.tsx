import React, { useState, useEffect } from 'react';
import { MenuItem, CartItem, UserRole, Category, StoreSettings, OrderDetails, Feedback } from './types';
import { INITIAL_MENU_ITEMS, DEFAULT_STORE_SETTINGS, heroImg } from './data/initialMenu';
import { INITIAL_FEEDBACKS } from './data/initialFeedbacks';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { CategoryFilter } from './components/CategoryFilter';
import { DishCard } from './components/DishCard';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppOrderModal } from './components/WhatsAppOrderModal';
import { OwnerDashboard } from './components/OwnerDashboard';
import { DishFormModal } from './components/DishFormModal';
import { FeedbackModal } from './components/FeedbackModal';
import { ShoppingBag, Flame, Sparkles, Heart, Utensils, MessageSquare, Phone, RefreshCw, Store, Star, MessageSquarePlus, Search } from 'lucide-react';

const CATEGORIES: Category[] = [
  'All',
  'Signature Curries',
  'Main Course',
  'Starters & Snacks',
  'Rice & Breads',
  'Desserts & Drinks',
];

export default function App() {
  // State Initialization from LocalStorage
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('currylicious_role') as UserRole) || 'customer';
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('currylicious_menu');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            ...item,
            category: item.category === 'Filipino-Spice Fusion' ? 'Main Course' : item.category,
          }));
        }
      } catch (e) {
        console.error('Failed to parse menu items', e);
      }
    }
    return INITIAL_MENU_ITEMS;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('currylicious_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cart items', e);
      }
    }
    return [];
  });

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('currylicious_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
    return ['curry-1', 'fusion-1'];
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('currylicious_store_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STORE_SETTINGS,
          ...parsed,
          whatsappNumber: '639176779779',
          phoneNumber: '+63 917 677 9779',
          announcement: parsed.announcement && parsed.announcement.includes('Free Garlic Butter Naan') ? '' : (parsed.announcement || ''),
        };
      } catch (e) {
        console.error('Failed to parse store settings', e);
      }
    }
    return DEFAULT_STORE_SETTINGS;
  });

  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    const saved = localStorage.getItem('currylicious_feedbacks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse feedbacks', e);
      }
    }
    return INITIAL_FEEDBACKS;
  });

  // UI Modals & Filters State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => {
    // Show login choice on first load if role not set explicitly
    return !localStorage.getItem('currylicious_role');
  });

  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [currentOrderDetails, setCurrentOrderDetails] = useState<OrderDetails | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('currylicious_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('currylicious_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('currylicious_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => {
    localStorage.setItem('currylicious_store_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    localStorage.setItem('currylicious_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    localStorage.setItem('currylicious_role', role);
  }, [role]);

  // Feedback Handlers
  const handleAddFeedback = (newFb: Omit<Feedback, 'id' | 'createdAt'>) => {
    const created: Feedback = {
      ...newFb,
      id: 'fb-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setFeedbacks((prev) => [created, ...prev]);
  };

  const handleDeleteFeedback = (id: string) => {
    setFeedbacks((prev) => prev.filter((item) => item.id !== id));
  };

  // Cart Handlers
  const handleAddToCart = (dish: MenuItem) => {
    if (!storeSettings.isStoreOpen && role === 'customer') {
      alert('Sorry, the kitchen is closed right now.');
      return;
    }
    setCartItems((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { dish, quantity: 1, instructions: '' }];
    });
  };

  const handleUpdateQuantity = (dishId: string, qty: number) => {
    if (!storeSettings.isStoreOpen && role === 'customer' && qty > (cartItems.find(i => i.dish.id === dishId)?.quantity || 0)) {
      alert('Sorry, the kitchen is closed right now.');
      return;
    }
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((item) => item.dish.id !== dishId));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.dish.id === dishId ? { ...item, quantity: qty } : item
        )
      );
    }
  };

  const handleUpdateInstructions = (dishId: string, text: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.dish.id === dishId ? { ...item, instructions: text } : item
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Favorites Handler
  const handleToggleFavorite = (dishId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(dishId)
        ? prev.filter((id) => id !== dishId)
        : [...prev, dishId]
    );
  };

  // Owner Handlers
  const handleSaveDish = (dishData: Partial<MenuItem>) => {
    if (editingDish) {
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === editingDish.id ? ({ ...item, ...dishData } as MenuItem) : item
        )
      );
    } else {
      setMenuItems((prev) => [dishData as MenuItem, ...prev]);
    }
    setEditingDish(null);
  };

  const handleDeleteDish = (dishId: string) => {
    if (confirm('Are you sure you want to delete this dish from the menu?')) {
      setMenuItems((prev) => prev.filter((item) => item.id !== dishId));
      setCartItems((prev) => prev.filter((item) => item.dish.id !== dishId));
    }
  };

  const handleToggleAvailability = (dishId: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === dishId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const handleResetMenu = () => {
    setMenuItems(INITIAL_MENU_ITEMS);
    localStorage.removeItem('currylicious_menu');
  };

  // Order Submission Handler
  const handleSendWhatsAppOrder = (orderDetails: OrderDetails) => {
    setCurrentOrderDetails(orderDetails);
    setIsCartOpen(false);
    setIsWhatsAppModalOpen(true);
  };

  const handleConfirmOrderSent = () => {
    setCartItems([]);
    setIsWhatsAppModalOpen(false);
  };

  // Filtered Dishes Computation (Real-time Search)
  const filteredDishes = menuItems.filter((dish) => {
    if (showFavoritesOnly && !favoriteIds.includes(dish.id)) {
      return false;
    }
    // Real-time search filter takes precedence across all dishes
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = dish.name.toLowerCase().includes(q);
      const matchDesc = dish.description.toLowerCase().includes(q);
      const matchCat = dish.category.toLowerCase().includes(q);
      const matchSpicy = dish.spicyLevel?.toLowerCase().includes(q);
      return matchName || matchDesc || matchCat || matchSpicy;
    }
    if (activeCategory !== 'All' && dish.category !== activeCategory) {
      return false;
    }
    return true;
  });

  const cartTotalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cartItems.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2D241E] font-sans flex flex-col antialiased selection:bg-[#C05621] selection:text-white">
      
      {/* Top Main Navigation Header */}
      <Header
        role={role}
        cartCount={cartTotalItems}
        favoritesCount={favoriteIds.length}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        onSwitchRoleClick={() => setIsLoginModalOpen(true)}
        storeSettings={storeSettings}
      />

      {/* Owner Control Dashboard Bar */}
      {role === 'owner' && (
        <OwnerDashboard
          storeSettings={storeSettings}
          onUpdateStoreSettings={(newSettings) => setStoreSettings(newSettings)}
          onAddNewDish={() => {
            setEditingDish(null);
            setIsDishModalOpen(true);
          }}
          onResetMenu={handleResetMenu}
          onExitOwnerMode={() => setRole('customer')}
          totalDishesCount={menuItems.length}
        />
      )}

      {/* Hero Food Photography Banner (Customer View) */}
      {role === 'customer' && !showFavoritesOnly && !searchQuery && (
        <div className="relative w-full h-48 sm:h-64 md:h-72 overflow-hidden border-b border-[#E8E0D5]">
          <img
            src={heroImg}
            alt="Currylicious Feast"
            className="w-full h-full object-cover brightness-95"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D241E]/90 via-[#2D241E]/40 to-black/20" />

          <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-6 sm:pb-8 text-white">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C05621] text-amber-100 text-xs font-bold shadow-xs w-fit backdrop-blur-md mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>NAMS Home Kitchen • Authentic Spices</span>
            </div>
            <h2 className="font-serif font-extrabold text-2xl sm:text-4xl text-amber-100 tracking-tight drop-shadow-md">
              Aromatic Curries & Sizzling Delights
            </h2>
            <p className="text-xs sm:text-base text-amber-200/90 max-w-xl font-medium mt-1 drop-shadow">
              Hand-ground spices, creamy slow-cooked sauces, and hot tandoori flatbreads delivered straight to your home via WhatsApp!
            </p>
          </div>
        </div>
      )}

      {/* Kitchen Closed Warning Banner for Customers */}
      {role === 'customer' && !storeSettings.isStoreOpen && (
        <div className="bg-rose-700 text-white py-3.5 px-4 shadow-md border-b border-rose-800 animate-fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-center text-xs sm:text-sm font-extrabold">
            <Store className="w-5 h-5 text-amber-200 shrink-0" />
            <span>Sorry, the kitchen is closed right now. We are currently not accepting orders.</span>
          </div>
        </div>
      )}

      {/* Category Touch Filter Slider */}
      <CategoryFilter
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={(val) => setShowFavoritesOnly(val)}
        favoritesCount={favoriteIds.length}
      />

      {/* Main Content Menu Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 pb-28">
        
        {/* Section Title */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E8E0D5]">
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#2D241E] flex items-center gap-2">
              {searchQuery ? (
                <>
                  <Search className="w-5 h-5 text-[#C05621]" />
                  <span>Search Results for "{searchQuery}"</span>
                </>
              ) : showFavoritesOnly ? (
                <>
                  <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
                  <span>Your Favorite Dishes</span>
                </>
              ) : (
                <>
                  <Utensils className="w-5 h-5 text-[#C05621]" />
                  <span>{activeCategory === 'All' ? 'Full Menu Options' : activeCategory}</span>
                </>
              )}
            </h2>
            <p className="text-xs text-[#6E5E53] mt-0.5 font-medium flex items-center gap-2">
              <span>
                Showing {filteredDishes.length} {filteredDishes.length === 1 ? 'dish' : 'dishes'}
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#C05621] hover:underline font-bold text-xs"
                >
                  (Clear search)
                </button>
              )}
            </p>
          </div>

          {role === 'owner' && (
            <button
              onClick={() => {
                setEditingDish(null);
                setIsDishModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
            >
              <span>+ Add Dish</span>
            </button>
          )}
        </div>

        {/* Empty Search / Favorites State */}
        {filteredDishes.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#EAE2D7] p-6 max-w-md mx-auto my-8 shadow-xs">
            <Utensils className="w-12 h-12 mx-auto text-[#C05621]/40" />
            <h3 className="font-serif font-bold text-lg text-[#2D241E]">No dishes found</h3>
            <p className="text-xs text-[#6E5E53]">
              {showFavoritesOnly
                ? "You haven't saved any favorite dishes yet! Click the heart icon on any dish to save it here."
                : "No menu items match your search or category filter."}
            </p>
            {(showFavoritesOnly || searchQuery || activeCategory !== 'All') && (
              <button
                onClick={() => {
                  setShowFavoritesOnly(false);
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                className="px-4 py-2 rounded-xl bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-xs transition shadow-xs"
              >
                View Full Menu
              </button>
            )}
          </div>
        ) : (
          /* Responsive Food Card Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredDishes.map((dish) => {
              const cartItem = cartItems.find((i) => i.dish.id === dish.id);
              const qty = cartItem ? cartItem.quantity : 0;
              const isFav = favoriteIds.includes(dish.id);

              return (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  role={role}
                  isFavorite={isFav}
                  cartQuantity={qty}
                  isStoreOpen={storeSettings.isStoreOpen}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onEditDish={(item) => {
                    setEditingDish(item);
                    setIsDishModalOpen(true);
                  }}
                  onDeleteDish={handleDeleteDish}
                  onToggleAvailability={handleToggleAvailability}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Mobile Sticky Bottom Cart Bar for Customers */}
      {role === 'customer' && cartTotalItems > 0 && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#C05621] hover:bg-[#A84719] text-white font-extrabold text-sm sm:text-base flex items-center justify-between shadow-xl border-2 border-amber-200 active:scale-95 transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs text-white">
                {cartTotalItems}
              </div>
              <span className="font-bold">View Cart & Order</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-black text-amber-100">₱{cartTotalPrice.toLocaleString()}</span>
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      )}

      {/* Role Selection / Owner Password Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onSelectRole={(selectedRole) => {
          setRole(selectedRole);
          setIsLoginModalOpen(false);
        }}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Customer Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateInstructions={handleUpdateInstructions}
        onClearCart={handleClearCart}
        onSendWhatsAppOrder={handleSendWhatsAppOrder}
        storeSettings={storeSettings}
      />

      {/* WhatsApp Summary Modal */}
      {currentOrderDetails && (
        <WhatsAppOrderModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          cartItems={cartItems}
          orderDetails={currentOrderDetails}
          storeSettings={storeSettings}
          onConfirmOrderSent={handleConfirmOrderSent}
        />
      )}

      {/* Customer Feedback Callout Banner Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12 border-t border-[#E8E0D5] w-full">
        <div className="bg-gradient-to-br from-[#2D241E] to-[#3D3128] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-amber-400" />
              ))}
              <span className="ml-2 text-sm font-extrabold text-amber-200">
                {(feedbacks.reduce((acc, f) => acc + f.rating, 0) / (feedbacks.length || 1)).toFixed(1)} / 5.0 Rating
              </span>
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-amber-50">
              Loved Your Currylicious Meal?
            </h3>
            <p className="text-xs sm:text-sm text-amber-200/80 max-w-xl">
              We value your voice! Leave a rating from 1 to 5 stars, write a line or paragraph about your food experience, and upload a photo of your dish!
            </p>
          </div>
          <button
            onClick={() => setIsFeedbackModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-[#C05621] hover:bg-[#A84719] text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-lg active:scale-95 transition shrink-0"
          >
            <MessageSquarePlus className="w-5 h-5" />
            <span>Give Feedback & View Reviews</span>
          </button>
        </div>
      </section>

      {/* Customer Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        feedbacks={feedbacks}
        onAddFeedback={handleAddFeedback}
        onDeleteFeedback={handleDeleteFeedback}
        menuItems={menuItems}
        isOwner={role === 'owner'}
      />

      {/* Owner Add / Edit Dish Form Modal */}
      <DishFormModal
        isOpen={isDishModalOpen}
        onClose={() => {
          setIsDishModalOpen(false);
          setEditingDish(null);
        }}
        onSaveDish={handleSaveDish}
        editingDish={editingDish}
        categories={CATEGORIES}
      />

      {/* App Footer */}
      <footer className="bg-[#2D241E] text-amber-100 border-t border-[#3D322B] py-6 px-4 text-center text-xs space-y-1">
        <p className="font-serif font-bold text-amber-200">Currylicious by NAMS Home Kitchen</p>
        <p className="text-amber-200/80">Warm Spices • Vibrant Herbs • Authentic Home Kitchen Comfort</p>
        <p className="text-[10px] text-amber-200/50">WhatsApp Direct Integration & Dynamic Menu Persistence</p>
      </footer>

    </div>
  );
}
