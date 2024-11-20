import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCart,
  addItemToCart,
  modifyCartItem,
  clearCart,
} from "../api/cartClient.ts";
import { CartData, CartItemData } from "../types/Cart.ts";
import { UserInfo } from "../types/User.ts";

export const useGetCart = (userInfo: UserInfo) => {
  return useQuery<CartData, Error>({
    queryKey: ["getCart", userInfo?.userId],
    queryFn: () => getCart(userInfo?.userId),
    enabled: !!userInfo,
  });
};

export const useAddToCart = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: CartItemData) => {
      await addItemToCart(userId, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCart", userId] });
    },
    onError: (error: Error) => {
      console.error("Error adding item to cart:", error.message);
    },
  });
};

export const useDeleteCartItem = (userInfo: UserInfo) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: CartItemData) => {
      await modifyCartItem(userInfo.userId, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCart", userInfo.userId] });
    },
    onError: (error: Error) => {
      console.error("Error deleting or modifying cart item:", error.message);
    },
  });
};

export const useClearCart = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      await clearCart(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCart", userId] });
      console.log("Cart cleared and cache invalidated");
    },
    onError: (error: Error) => {
      console.error("Error clearing cart:", error.message);
    },
  });
};
