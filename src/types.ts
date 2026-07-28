export type Category = 
  | 'All' 
  | 'Signature Curries' 
  | 'Main Course' 
  | 'Starters & Snacks' 
  | 'Rice & Breads' 
  | 'Desserts & Drinks';

export type SpiceLevel = 'Mild' | 'Medium' | 'Spicy' | 'Extra Hot';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // in PHP (₱)
  category: Category;
  imageUrl: string;
  spicyLevel?: SpiceLevel;
  isVegetarian?: boolean;
  isBestseller?: boolean;
  isAvailable: boolean;
  preparationTimeMinutes?: number;
}

export interface CartItem {
  dish: MenuItem;
  quantity: number;
  instructions?: string;
}

export type UserRole = 'customer' | 'owner';

export interface OrderDetails {
  customerName: string;
  contactNumber: string;
  orderType: 'Delivery' | 'Pickup' | 'Dine-In';
  deliveryAddress?: string;
  specialInstructions?: string;
  paymentMethod: 'GCash';
}

export interface Feedback {
  id: string;
  customerName: string;
  rating: number; // 1 to 5 stars
  comment: string;
  photoUrl?: string; // Optional food photo
  createdAt: string;
  dishName?: string;
}

export interface StoreSettings {
  whatsappNumber: string; // e.g. "+639171234567"
  phoneNumber: string;    // e.g. "+639171234567"
  restaurantName: string;
  tagline: string;
  isStoreOpen: boolean;
  announcement?: string;
}
