import { CartItem, OrderDetails, StoreSettings } from '../types';

export const buildWhatsAppOrderMessage = (
  cartItems: CartItem[],
  orderDetails: OrderDetails,
  storeSettings: StoreSettings
): string => {
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.dish.price * item.quantity,
    0
  );
  const deliveryFee = orderDetails.orderType === 'Delivery' ? 50 : 0;
  const grandTotal = subtotal + deliveryFee;

  let msg = `*🌶️ NEW ORDER - ${storeSettings.restaurantName || 'Currylicious by NAMS Home Kitchen'}*\n`;
  msg += `------------------------------------\n`;
  msg += `👤 *Customer:* ${orderDetails.customerName}\n`;
  msg += `📞 *Phone:* ${orderDetails.contactNumber}\n`;
  msg += `🛵 *Type:* ${orderDetails.orderType}\n`;
  if (orderDetails.orderType === 'Delivery' && orderDetails.deliveryAddress) {
    msg += `📍 *Address:* ${orderDetails.deliveryAddress}\n`;
  }
  msg += `💳 *Payment:* GCash and Account Transfer\n`;
  if (orderDetails.specialInstructions) {
    msg += `📝 *Order Note:* ${orderDetails.specialInstructions}\n`;
  }
  msg += `------------------------------------\n`;
  msg += `📋 *ORDER ITEMS:*\n`;

  cartItems.forEach((item, index) => {
    const isDessertOrDrink = item.dish.category === 'Desserts & Drinks';
    const spiceInfo = !isDessertOrDrink && item.selectedSpiceLevel ? ` [Spice: ${item.selectedSpiceLevel}]` : '';
    msg += `${index + 1}. *${item.dish.name}*${spiceInfo} x${item.quantity} = ₱${(item.dish.price * item.quantity).toLocaleString()}\n`;
    if (item.instructions) {
      msg += `   └ Note: _${item.instructions}_\n`;
    }
  });

  msg += `------------------------------------\n`;
  msg += `💵 *Subtotal:* ₱${subtotal.toLocaleString()}\n`;
  if (orderDetails.orderType === 'Delivery') {
    msg += `🛵 *Delivery Fee:* shouldered by the customer\n`;
  }
  msg += `💰 *TOTAL AMOUNT:* *₱${subtotal.toLocaleString()}*\n`;
  msg += `------------------------------------\n`;
  msg += `✨ _Thank you for ordering from Currylicious by NAMS Home Kitchen!_\n`;
  msg += `🛵 _The delivery will be charged according to your location._`;

  return msg;
};

export const generateWhatsAppUrl = (
  cartItems: CartItem[],
  orderDetails: OrderDetails,
  storeSettings: StoreSettings
): string => {
  const message = buildWhatsAppOrderMessage(cartItems, orderDetails, storeSettings);
  const cleanPhone = (storeSettings.whatsappNumber || '639176779779').replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
