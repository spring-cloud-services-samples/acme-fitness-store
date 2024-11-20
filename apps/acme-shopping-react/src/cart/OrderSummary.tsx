import { CartData } from "../types/Cart";
import formatDollar from "../utils/formatDollar";
import Button from "../components/Button.tsx";

interface OrderSummaryProps {
  cart: CartData;
  hideCheckoutButton?: boolean;
}

export default function OrderSummary({
  cart,
  hideCheckoutButton,
}: OrderSummaryProps) {
  const cartItems = cart?.cart ?? [];
  const cartTotal = cartItems.reduce(
    (acc, curr) => acc + curr.quantity * parseFloat(curr.price),
    0
  );

  return (
    <div className="w-full lg:w-1/3 overflow-hidden">
      <div className="bg-navy-50 border border-navy-200 shadow-lg rounded-lg p-6">
        <h3 className="mb-3">Order Summary</h3>

        <table className="w-full">
          <tbody>
            <tr className="">
              <td className="w-full py-3 text-chocolate-600">Subtotal</td>
              <td className="py-3 text-right text-chocolate-600">
                ${cartTotal.toFixed(2)}
              </td>
            </tr>

            <tr className="">
              <td className="py-3 text-chocolate-600">Shipping</td>
              <td className="py-3 text-right text-chocolate-600">Free</td>
            </tr>

            <tr className="border-b border-chocolate-600">
              <td className="py-3 text-chocolate-600">Tax</td>
              <td className="py-3 text-right text-chocolate-600">$0.00</td>
            </tr>

            <tr className="font-semibold">
              <td className="py-4 text-lg">Total</td>
              <td className="py-4 text-lg text-right">
                {formatDollar(cartTotal)}
              </td>
            </tr>
          </tbody>
        </table>

        {!hideCheckoutButton ? (
          <a href="/checkout" data-cy="checkout-button">
            <Button variant="filled" className="w-full py-3 my-2">
              Checkout
            </Button>
          </a>
        ) : null}
      </div>
    </div>
  );
}
