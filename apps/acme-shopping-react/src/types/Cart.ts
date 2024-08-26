export interface CartItemData {
    itemid: string;
    name: string;
    price: string;
    quantity: number;
    shortDescription: string;
}

export interface CartData {
    cart: CartItemData[];
    userid: string;
}