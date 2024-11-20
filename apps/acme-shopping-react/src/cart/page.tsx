import { useGetCart } from "../hooks/cartHooks";
import { useGetUserInfo } from "../hooks/userHooks";
import CartSummary from "./CartSummary.tsx";
import EmptyCart from "./EmptyCart.tsx";

export default function CartPage() {
  const { data: userInfo } = useGetUserInfo();
  const { data: cartData } = useGetCart(userInfo);

  return (
    <div className=" mb-16">
      <div className="p-4 md:p-8">
        <div className="flex gap-2 mb-4">
          <a href="/" className="underline">
            Home
          </a>
          <p>{">"}</p>
          <p>Cart</p>
        </div>

        <div className="flex flex-col justify-between md:flex-row">
          <h1 className="text-grape text-5xl mb-8">Your Cart</h1>
        </div>
      </div>

      {cartData?.cart != null ? (
        <CartSummary cartData={cartData} userInfo={userInfo} />
      ) : (
        <EmptyCart />
      )}
    </div>
  );
}
