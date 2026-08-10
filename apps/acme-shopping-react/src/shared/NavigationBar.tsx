import Button from "../components/Button.tsx";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LoginButton from "./Login.tsx";
import { useGetUserInfo } from "../hooks/userHooks.ts";
import { useGetCart } from "../hooks/cartHooks.ts";

export default function NavigationBar() {
  const { data: userInfo } = useGetUserInfo();
  const { data: cartData } = useGetCart(userInfo);
  const cartCount =
    cartData?.cart?.reduce((total, item) => total + item.quantity, 0) ?? 0;

  return (
    <nav className="bg-navy text-white">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex-shrink-0 ml-4">
            <img
              src="/logo-white.png"
              alt="Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </a>

          {/* Navigation Links - Add more as needed */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a
                href="/bikes"
                className="px-3 py-2 rounded-md font-medium hover:bg-gray-700"
              >
                Bikes
              </a>

              <a
                href="/accessories"
                className="px-3 py-2 rounded-md font-medium hover:bg-gray-700"
              >
                Accessories
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-8">
          <LoginButton />

          <a href="/cart" className="relative mr-4">
            <Button variant="icon">
              <ShoppingCartIcon className="size-5" />
              <span className="sr-only">Shopping cart</span>
            </Button>
            {cartCount > 0 ? (
              <span
                data-cy="cart-badge"
                className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-grape text-white text-xs font-semibold"
              >
                {cartCount}
              </span>
            ) : null}
          </a>
        </div>
      </div>
    </nav>
  );
}
