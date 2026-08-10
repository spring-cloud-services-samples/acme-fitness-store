import {createOrder} from "../api/orderClient.ts";
import {useMutation} from "@tanstack/react-query";
import {Order, OrderCreateResponse} from "../types/Order.ts";

export const useCreateOrder = (userId: string | undefined) => {
    return useMutation<OrderCreateResponse, Error,  Order>({
        mutationFn: async (order:  Order) => {
            return await createOrder(userId!, order);
        },
        onSuccess: () => {
            console.log('Order created successfully.');
        },
        onError: (error: Error) => {
            console.error('Error creating order:', error.message);
        },
    });
};


