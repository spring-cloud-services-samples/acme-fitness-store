import axios from 'axios';
import {ProductData} from "../types/Catalog.ts";

export const getProducts = async (): Promise<ProductData[]> => {
    const response = await axios.get<ProductData[]>('/products');
    return response.data;
};

export const getProduct = async (productId: string): Promise<ProductData> => {
    const response = await axios.get<ProductData>(`/products/${productId}`);
    return response.data;
};
