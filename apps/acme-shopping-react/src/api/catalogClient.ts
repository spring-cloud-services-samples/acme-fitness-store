import axios from 'axios';
import {ProductData} from "../types/Catalog.ts";

export const getProducts = async (): Promise<{ data: ProductData[] }> => {
    try {
        const response = await axios.get<{ data: ProductData[] }>('/products', {
            timeout: 2000, // Set timeout to 2000ms
        })
        return response.data;
    } catch (error) {
        console.error('Error during Axios request:', error);
        throw error;
    }
};

export const getProduct = async (productId: string): Promise<{ data: ProductData }> => {
    try {
        const response = await axios.get<{ data: ProductData }>(`/products/${productId}`, {
            timeout: 2000, // Set timeout to 2000ms
        });
        return response.data;
    } catch (error) {
        console.error('Error during Axios request:', error);
        throw error;
    }
};
