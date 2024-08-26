import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {getCart, addItemToCart, modifyCartItem, clearCart} from "../api/cartClient.ts";
import {CartData, CartItemData} from "../types/Cart.ts";

export const useGetCart = (userId: string, userInfo) => {
    return useQuery<CartData, Error>({
        queryKey: ['getCart', userId],
        queryFn: () => getCart(userId),
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
            queryClient.invalidateQueries({queryKey: ['getCart', userId]});
        },
        onError: (error: Error) => {
            console.error('Error adding item to cart:', error.message);
        },
    });
};

export const useDeleteCartItem = (userId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (item: CartItemData) => {
            await modifyCartItem(userId, item);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['getCart', userId]});
        },
        onError: (error: Error) => {
            console.error('Error deleting or modifying cart item:', error.message);
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
            queryClient.invalidateQueries({queryKey: ['getCart', userId]});
            console.log('Cart cleared and cache invalidated');
        },
        onError: (error: Error) => {
            console.error('Error clearing cart:', error.message);
        },
    });
};