import React, { useState, useEffect } from 'react';
import { MenuItem, CartItem, UserRole, Category, StoreSettings, OrderDetails, Feedback, CustomerSpiceLevel } from './types';
import { INITIAL_MENU_ITEMS, DEFAULT_STORE_SETTINGS, heroImg } from './data/initialMenu';
import { INITIAL_FEEDBACKS } from './data/initialFeedbacks';
import { generateWhatsAppUrl } from './utils/whatsapp';
import {
  subscribeToMenuItems,
  subscribeToStoreSettings,
  subscribeToFeedbacks,
  saveDishToDb,
  deleteDishFromDb,
  updateStoreSettingsInDb,
  resetMenuInDb,
  addFeedbackToDb,
  deleteFeedbackFromDb,
} from './lib/menuService';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { CategoryFilter } from './components/CategoryFilter';
import { DishCard } from './components/DishCard';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppOrderModal } from './components/WhatsAppOrderModal';
import { OwnerDashboard } from './components/OwnerDashboard';
import { DishFormModal } from './components/DishFormModal';
import { FeedbackModal } from './components/FeedbackModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { InstallPwaBanner } from './components/InstallPwaBanner';
import { ShoppingBag, Flame, Sparkles, Heart, Utensils, MessageSquare, Phone, RefreshCw, Store, Star, MessageSquarePlus, Search, Loader2, Download } from 'lucide-react';

const CATEGORIES: Category[] = [
  'All',
  'Signature Curries',
  'Main Course',
  'Starters & Snacks',
  'Rice & Breads',
  'Desserts & Drinks',
];

export default function App() {
  // User Role State
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('currylicious_role') as UserRole) || 'customer';
  });

  // Database-Synced State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  // Client-Local State (Cart & Favorites)
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

  // UI Modals & Filters State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => {
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
  const [activeOrderItems, setActiveOrderItems] = useState<CartItem[]>([]);

  // PWA Installation Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isInstallBannerVisible, setIsInstallBannerVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect standalone mode
    const inStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(inStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iosDevice);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      const dismissedTime = localStorage.getItem('currylicious_pwa_banner_dismissed');
      if (!inStandalone) {
        if (!dismissedTime || Date.now() - parseInt(dismissedTime, 10) > 7 * 24 * 60 * 60 * 1000) {
          setIsInstallBannerVisible(true);
        }
      }
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully');
      setDeferredPrompt(null);
      setIsStandalone(true);
      setIsInstallBannerVisible(false);
      setIsInstallModalOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (iosDevice && !inStandalone) {
      const dismissedTime = localStorage.getItem('currylicious_pwa_banner_dismissed');
      if (!dismissedTime || Date.now() - parseInt(dismissedTime, 10) > 7 * 24 * 60 * 60 * 1000) {
        setIsInstallBannerVisible(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDismissInstallBanner = () => {
    setIsInstallBannerVisible(false);
    localStorage.setItem('currylicious_pwa_banner_dismissed', Date.now().toString());
  };

  // Realtime Firestore Subscriptions (Syncs all updates across all devices instantly)
  useEffect(() => {
    const unsubMenu = subscribeToMenuItems((items) => {
      setMenuItems(items);
      setIsLoadingMenu(false);
    });

    const unsubSettings = subscribeToStoreSettings((settings) => {
      setStoreSettings(settings);
    });

    const unsubFeedbacks = subscribeToFeedbacks((fbs) => {
      setFeedbacks(fbs);
    });

    return () => {
      unsubMenu();
      unsubSettings();
      unsubFeedbacks();
    };
  }, []);

  // Client Persistence Effects for Local Cart & User Role
  useEffect(() => {
    localStorage.setItem('currylicious_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('currylicious_favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => {
    localStorage.setItem('currylicious_role', role);
  }, [role]);

  // Feedback Handlers (Persisted to Firestore)
  const handleAddFeedback = async (newFb: Omit<Feedback, 'id' | 'createdAt'>) => {
    const created: Feedback = {
      ...newFb,
      id: 'fb-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    await addFeedbackToDb(created);
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      await deleteFeedbackFromDb(id);
    } catch (err) {
      console.error('Failed to delete feedback from database', err);
      alert('Error deleting feedback.');
    }
  };

  // Cart Handlers
  const handleAddToCart = (dish: MenuItem, selectedSpiceLevel?: CustomerSpiceLevel) => {
    if (!storeSettings.isStoreOpen && role === 'customer') {
      alert('Sorry, the kitchen is closed right now.');
      return;
    }
    const isDessertOrDrink = dish.category === 'Desserts & Drinks';
    const effectiveSpice = isDessertOrDrink ? undefined : (selectedSpiceLevel || 'Medium');

    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.dish.id === dish.id && item.selectedSpiceLevel === effectiveSpice
      );
      if (existingIdx >= 0) {
        return prev.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { dish, quantity: 1, selectedSpiceLevel: effectiveSpice, instructions: '' }];
    });
  };

  const handleUpdateQuantityByDishId = (dishId: string, newQty: number) => {
    const currentQty = cartItems
      .filter((i) => i.dish.id === dishId)
      .reduce((sum, i) => sum + i.quantity, 0);

    if (!storeSettings.isStoreOpen && role === 'customer' && newQty > currentQty) {
      alert('Sorry, the kitchen is closed right now.');
      return;
    }

    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((item) => item.dish.id !== dishId));
    } else {
      setCartItems((prev) => {
        let diff = currentQty - newQty;
        if (diff <= 0) {
          const lastIdx = prev.map((item, idx) => item.dish.id === dishId ? idx : -1).filter((i) => i !== -1).pop();
          if (lastIdx !== undefined) {
            return prev.map((item, idx) => idx === lastIdx ? { ...item, quantity: item.quantity + Math.abs(diff) } : item);
          }
          return prev;
        } else {
          let remainingToReduce = diff;
          const next = [...prev];
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].dish.id === dishId) {
              if (next[i].quantity > remainingToReduce) {
                next[i] = { ...next[i], quantity: next[i].quantity - remainingToReduce };
                remainingToReduce = 0;
                break;
              } else {
                remainingToReduce -= next[i].quantity;
                next.splice(i, 1);
              }
            }
          }
          return next;
        }
      });
    }
  };

  const handleUpdateQuantityByIndex = (cartIndex: number, qty: number) => {
    if (!storeSettings.isStoreOpen && role === 'customer' && qty > (cartItems[cartIndex]?.quantity || 0)) {
      alert('Sorry, the kitchen is closed right now.');
      return;
    }
    if (qty <= 0) {
      setCartItems((prev) => prev.filter((_, idx) => idx !== cartIndex));
    } else {
      setCartItems((prev) =>
        prev.map((item, idx) =>
          idx === cartIndex ? { ...item, quantity: qty } : item
        )
      );
    }
  };

  const handleUpdateInstructionsByIndex = (cartIndex: number, text: string) => {
    setCartItems((prev) =>
      prev.map((item, idx) =>
        idx === cartIndex ? { ...item, instructions: text } : item
      )
    );
  };

  const handleUpdateSpiceLevelByIndex = (cartIndex: number, level: CustomerSpiceLevel) => {
    setCartItems((prev) =>
      prev.map((item, idx) =>
        idx === cartIndex ? { ...item, selectedSpiceLevel: level } : item
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

  // Owner Handlers (Persisted directly to Database)
  const handleSaveDish = async (dishData: Partial<MenuItem>) => {
    try {
      if (editingDish) {
        const updated: MenuItem = { ...editingDish, ...dishData } as MenuItem;
        await saveDishToDb(updated);
      } else {
        const newDish: MenuItem = {
          id: 'dish-' + Date.now(),
          name: dishData.name || 'New Dish',
          description: dishData.description || '',
          price: dishData.price || 0,
          category: dishData.category || 'Main Course',
          imageUrl: dishData.imageUrl || 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=800',
          spicyLevel: dishData.spicyLevel || 'Mild',
          isVegetarian: dishData.isVegetarian || false,
          isBestseller: dishData.isBestseller || false,
          isAvailable: dishData.isAvailable !== undefined ? dishData.isAvailable : true,
          preparationTimeMinutes: dishData.preparationTimeMinutes || 15,
        };
        await saveDishToDb(newDish);
      }
    } catch (err) {
      console.error('Failed to save dish to database:', err);
      alert('Error saving dish. Please check your connection and try again.');
    }
    setEditingDish(null);
    setIsDishModalOpen(false);
  };

  const handleDeleteDish = async (dishId: string) => {
    if (confirm('Are you sure you want to delete this dish from the menu?')) {
      try {
        await deleteDishFromDb(dishId);
        setCartItems((prev) => prev.filter((item) => item.dish.id !== dishId));
      } catch (err) {
        console.error('Failed to delete dish from database:', err);
        alert('Error deleting dish.');
      }
    }
  };

  const handleToggleAvailability = async (dishId: string) => {
    const target = menuItems.find((item) => item.id === dishId);
    if (!target) return;
    try {
      await saveDishToDb({ ...target, isAvailable: !target.isAvailable });
    } catch (err) {
      console.error('Failed to toggle dish availability:', err);
      alert('Error updating dish status.');
    }
  };

  const handleResetMenu = async () => {
    try {
      await resetMenuInDb();
    } catch (err) {
      console.error('Failed to reset menu in database:', err);
      alert('Error resetting menu.');
    }
  };

  const handleUpdateStoreSettings = async (newSettings: StoreSettings) => {
    try {
      await updateStoreSettingsInDb(newSettings);
    } catch (err) {
      console.error('Failed to update store settings in database:', err);
      alert('Error saving store settings.');
    }
  };

  // Order Submission Handler
  const handleSendWhatsAppOrder = (orderDetails: OrderDetails) => {
    const whatsappUrl = generateWhatsAppUrl(cartItems, orderDetails, storeSettings);
    window.open(whatsappUrl, '_blank');

    setActiveOrderItems([...cartItems]);
    setCurrentOrderDetails(orderDetails);
    setIsCartOpen(false);
    setIsWhatsAppModalOpen(true);

    setCartItems([]);
  };

  const handleConfirmOrderSent = () => {
    setIsWhatsAppModalOpen(false);
  };

  // Filtered Dishes Computation
  const filteredDishes = menuItems.filter((dish) => {
    if (showFavoritesOnly && !favoriteIds.includes(dish.id)) {
      return false;
    }
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
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isStandalone={isStandalone}
        isIOS={isIOS}
      />

      {/* Owner Control Dashboard Bar */}
      {role === 'owner' && (
        <OwnerDashboard
          storeSettings={storeSettings}
          onUpdateStoreSettings={handleUpdateStoreSettings}
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

        {/* Loading Indicator */}
        {isLoadingMenu ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 mx-auto text-[#C05621] animate-spin" />
            <p className="text-xs text-[#6E5E53] font-medium">Connecting to menu database...</p>
          </div>
        ) : filteredDishes.length === 0 ? (
          /* Empty Search / Favorites / Empty Menu State */
          <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#EAE2D7] p-6 max-w-md mx-auto my-8 shadow-xs">
            <Utensils className="w-12 h-12 mx-auto text-[#C05621]/40" />
            <h3 className="font-serif font-bold text-lg text-[#2D241E]">No dishes found</h3>
            <p className="text-xs text-[#6E5E53]">
              {showFavoritesOnly
                ? "You haven't saved any favorite dishes yet! Click the heart icon on any dish to save it here."
                : menuItems.length === 0
                ? "The menu is currently empty. Owner can add new dishes using the '+ Add Dish' button."
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
              const qty = cartItems
                .filter((i) => i.dish.id === dish.id)
                .reduce((sum, i) => sum + i.quantity, 0);
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
                  onUpdateQuantity={handleUpdateQuantityByDishId}
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
        onUpdateQuantity={handleUpdateQuantityByIndex}
        onUpdateInstructions={handleUpdateInstructionsByIndex}
        onUpdateSpiceLevel={handleUpdateSpiceLevelByIndex}
        onClearCart={handleClearCart}
        onSendWhatsAppOrder={handleSendWhatsAppOrder}
        storeSettings={storeSettings}
      />

      {/* WhatsApp Summary Modal */}
      {currentOrderDetails && (
        <WhatsAppOrderModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          cartItems={activeOrderItems.length > 0 ? activeOrderItems : cartItems}
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
      <footer className="bg-[#2D241E] text-amber-100 border-t border-[#3D322B] py-6 px-4 text-center text-xs space-y-2">
        <p className="font-serif font-bold text-amber-200">Currylicious by NAMS Home Kitchen</p>
        <p className="text-amber-200/80">Warm Spices • Vibrant Herbs • Authentic Home Kitchen Comfort</p>
        <div className="pt-1 flex items-center justify-center gap-3">
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-[#C05621] hover:bg-[#A84719] text-white font-bold text-xs inline-flex items-center gap-1.5 transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App on Phone / Desktop</span>
          </button>
        </div>
        <p className="text-[10px] text-amber-200/50">WhatsApp Direct Integration • Dynamic Cloud Persistence • PWA Ready</p>
      </footer>

      {/* PWA Floating Install Banner */}
      {isInstallBannerVisible && !isStandalone && (
        <InstallPwaBanner
          onOpenModal={() => setIsInstallModalOpen(true)}
          onDismiss={handleDismissInstallBanner}
          isIOS={isIOS}
          hasNativePrompt={!!deferredPrompt}
        />
      )}

      {/* PWA Installation Modal */}
      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallSuccess={() => {
          setIsStandalone(true);
          setIsInstallBannerVisible(false);
        }}
      />
    </div>
  );
}

