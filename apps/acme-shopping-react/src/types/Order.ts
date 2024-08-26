type Address = {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
};

type CardInfo = {
    number: string;
    expMonth: string;
    expYear: string;
    ccv: string;
    type: string;
};

export type CartItem = {
    id: string;
    description: string;
    price: number;
    quantity: number;
};

export interface OrderCreateResponse {
    orderId: string;
    status: string;
    message: string;
}

export type Order = {
    userId: string;
    firstname: string;
    lastname: string;
    email: string;
    total: string;
    delivery: Record<string, any>;
    address: Address;
    cart: CartItem[];
    card: CardInfo;
};
