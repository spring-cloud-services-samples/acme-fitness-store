import {useQuery} from '@tanstack/react-query';
import {getProduct, getProducts} from "../api/catalogClient.ts";
import {ProductData} from "../types/Catalog.ts";

export const useGetProducts = () => {
    return useQuery<ProductData[]>({
        queryKey: ['getProducts'],
        queryFn: getProducts,
    });
};

export const useGetProduct = (productId: string) => {
    return useQuery<ProductData, Error>({
        queryKey: ['getProduct', productId],
        queryFn: () => getProduct(productId),
    });
};
