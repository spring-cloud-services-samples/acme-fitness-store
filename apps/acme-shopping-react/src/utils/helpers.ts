import { CartItem, Order } from "../types/Order.ts";
import { AddressData } from "../types/Address.ts";
import { CartData } from "../types/Cart.ts";

export default function constructOrder(
  cartData: CartData,
  addressData: AddressData,
  deliveryMethod: string,
  paymentData: {
    cardType: string;
    cardNumber: string;
    ccv: string;
    expMonth: string;
    expYear: string;
  },
  userId: string
): Order {
  const cartTotal = cartData.cart.reduce(
    (acc, curr) => acc + curr.quantity * parseFloat(curr.price),
    0
  );

  const carts: CartItem[] = cartData.cart.map((item) => ({
    itemid: item.itemid,
    description: item.shortDescription,
    name: item.name,
    quantity: item.quantity,
    price: item.price.toString(),
  }));

  const address = {
    street: addressData.street,
    city: addressData.city,
    zip: addressData.zip,
    state: addressData.state,
    country: addressData.country,
  };

  const card = {
    type: paymentData.cardType,
    number: paymentData.cardNumber,
    ccv: paymentData.ccv,
    expMonth: paymentData.expMonth,
    expYear: paymentData.expYear,
  };

  return {
    userId: userId,
    cart: carts,
    total: cartTotal.toString(),
    address: address,
    delivery: deliveryMethod,
    card: card,
    firstname: addressData.firstname,
    lastname: addressData.lastname,
    email: addressData.email,
  };
}

export const parseMessageContentAndBuildLinks = (message: string) => {
  const itemPattern = /{{([^|]+)\|([^}]+)}}/g;

  const parsedMessage = message.replace(
    itemPattern,
    (match, itemName, itemId) => {
      return `<a data-cy="assist-linked-product" href="/product/${itemId}" target="_self">${itemName}</a>`;
    }
  );

  return parsedMessage;
};

export function getCurrentProductInView() {
  const productTitleElement = document.getElementById("product-title");

  if (productTitleElement) {
    const productTitle = productTitleElement.textContent.trim();
    return `The customer is currently viewing the ${productTitle} product`;
  } else {
    return "The customer is not currently viewing a product detail page";
  }
}

export const summarizeCart = (cartItems) => {
  if (!cartItems) {
    return "Nothing. The cart is empty.";
  }

  let totalPrice = 0;
  const itemSummaries = cartItems.map((item) => {
    const itemTotal = parseFloat(item.price) * item.quantity;
    totalPrice += itemTotal;
    return `\n- ${item.quantity} x "${item.name}" at $${item.price} each`;
  });

  const itemList = itemSummaries.join("");
  const totalPriceFormatted = totalPrice.toFixed(2);

  return `Current Items in Cart: \n${itemList}\n\nTotal items: ${cartItems.length}\nTotal price: $${totalPriceFormatted}`;
};
