import axios from 'axios';
import {Order, OrderCreateResponse} from "../types/Order.ts";

export const createOrder = async (userId: string, order:  Order): Promise<OrderCreateResponse> => {
    const response = await axios.post<OrderCreateResponse>(`/order/add/${userId}`, order, {
        headers: {
            'Content-Type': 'application/json'
        },
    });
    return response.data;
};
