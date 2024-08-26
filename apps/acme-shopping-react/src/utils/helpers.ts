import {CartItem} from "../types/Order.ts";

export default function constructOrder(
    cartItems: CartItem[],
    total: number,
    addressData: any,
    deliveryMethod: string,
    paymentData: any,
    userId: string
) {

    const cart = cartItems.map(item => ({
        id: item.itemid,
        description: item.name,
        quantity: item.quantity,
        price: item.price.toString(),
    }));


    const address = {
        street: addressData.street,
        city: addressData.city,
        zip: addressData.zipCode,
        state: addressData.state,
        country: addressData.country,
    };


    const card = {
        type: paymentData.cardType,
        number: paymentData.cardNumber,
        ccv: paymentData.ccv,
        expMonth: paymentData.expMonth,
        expYear: paymentData.expYear,
    };


    const order = {
        userId: userId,
        cart: cart,
        total: total.toString(),
        address: address,
        delivery: deliveryMethod,
        card: card,
        firstname: addressData.firstname,
        lastname: addressData.lastname,
        email: addressData.email
    };

    return order;
}

export const createMarkup = (htmlContent: string) => {
    return {__html: htmlContent};
};

export const parseMessageContentAndBuildLinks = (message: string) => {
    const itemPattern = /{{([^|]+)\|([^}]+)}}/g;

    const parsedMessage = message.replace(itemPattern, (match, itemName, itemId) => {
        return `<a href="/product/${itemId}" target="_self">${itemName}</a>`;
    });

    return parsedMessage;
};

export function getCurrentProductInView() {
    const productTitleElement = document.getElementById('product-title');

    if (productTitleElement) {
        const productTitle = productTitleElement.textContent.trim();
        return `The customer is currently viewing the ${productTitle} product`;
    } else {
        return "The customer is not currently viewing a product detail page";
    }
}

export const summarizeCart = (cartItems) => {
    if (cartItems.length === 0) {
        return "Nothing. The cart is empty.";
    }

    let totalPrice = 0;
    const itemSummaries = cartItems.map(item => {
        const itemTotal = parseFloat(item.price) * item.quantity;
        totalPrice += itemTotal;
        return `\n- ${item.quantity} x "${item.name}" at $${item.price} each`;
    });

    const itemList = itemSummaries.join('');
    const totalPriceFormatted = totalPrice.toFixed(2);

    return `Current Items in Cart: \n${itemList}\n\nTotal items: ${cartItems.length}\nTotal price: $${totalPriceFormatted}`;
}