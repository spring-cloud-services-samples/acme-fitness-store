import axios from "axios";
import { CartData, CartItemData } from "../types/Cart.ts";

export const getCart = async (userId: string): Promise<CartData> => {
  const response = await axios.get<CartData>(`/cart/items/${userId}`);
  return response.data;
};

export const addItemToCart = async (
  userId: string,
  item: CartItemData
): Promise<void> => {
  await axios.post(`/cart/item/add/${userId}`, item, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const modifyCartItem = async (
  userId: string,
  itemData: CartItemData
): Promise<void> => {
  try {
    const response = await axios.post(`/cart/item/modify/${userId}`, itemData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      throw new Error("Failed to modify cart item");
    }
  } catch (error) {
    console.error("Error modifying cart:", error.message);
    throw error;
  }
};

export const clearCart = async (userId: string): Promise<void> => {
  try {
    const response = await axios.get(`/cart/clear/${userId}`);

    if (response.status === 200) {
      console.log("Cart cleared successfully");
    } else {
      console.log("Status:", response.status);
    }
  } catch (error) {
    console.error("Error from cart service:", error.message);
    throw error;
  }
};
