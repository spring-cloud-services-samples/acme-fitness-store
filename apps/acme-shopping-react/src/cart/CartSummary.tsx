import formatDollar from "../utils/formatDollar";
import Button from "../components/Button";
import Close from "@mui/icons-material/Close";
import OrderSummary from "./OrderSummary";
import { CartData, CartItemData } from "../types/Cart";
import { ProductData } from "../types/Catalog";
import { useDeleteCartItem } from "../hooks/cartHooks";
import { useGetProducts } from "../hooks/catalogHooks";
import { UserInfo } from "../types/User";

export default function CartSummary({
  cartData,
  userInfo,
}: {
  cartData: CartData;
  userInfo: UserInfo;
}) {
  const { data: productsData } = useGetProducts();

  const deleteCartItemMutation = useDeleteCartItem(userInfo);
  const products = productsData?.data ?? [];

  const getProductImg = (itemId: string) => {
    const product = products.find(
      (product: ProductData) => product.id === itemId
    );
    return product?.imageUrl1 || "/static/images/new_bikes_3.jpg";
  };

  function removeItemFromCart(item: CartItemData) {
    deleteCartItemMutation.mutate({
      itemid: item.itemid,
      quantity: 0,
      name: item.name,
      price: item.price,
      shortDescription: "",
    });
  }

  if (cartData?.cart == null) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row justify-between p-2 md:p-4 gap-6">
      <div className="flex-grow grid items-center">
        <div className="overflow-x-auto p-4 w-full">
          <table className="w-full">
            <thead className="md:text-xl text-blueberry border-b-2 border-blueberry">
              <tr>
                <th className="py-3 px-4 text-center hidden md:block"></th>
                <th className="py-3 px-4 text-center"></th>
                <th className="py-3 px-4 text-center">Price</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-end">Subtotal</th>
              </tr>
            </thead>

            <tbody className="text-center">
              {cartData.cart.map((item) => (
                <tr key={item.itemid}>
                  <td className="p-2 md:p-4 hidden md:block">
                    <img
                      src={getProductImg(item.itemid)}
                      className="size-36 object-contain rounded"
                      alt={item.name}
                    />
                  </td>

                  <td className="p-2 md:p-4">
                    <h4 className="text-chocolate">{item.name}</h4>
                  </td>

                  <td className="p-2 md:p-4 text-right text-chocolate md:text-xl">
                    {formatDollar(parseFloat(item.price))}
                  </td>

                  <td className="p-2 md:p-4 text-right text-chocolate md:text-xl">
                    {item.quantity}
                  </td>

                  <td className="p-2 md:p-4 text-right text-chocolate md:text-xl">
                    {formatDollar(parseFloat(item.price) * item.quantity)}
                  </td>

                  <td className="p-2 md:p-4">
                    <Button
                      variant="icon"
                      onClick={() => removeItemFromCart(item)}
                    >
                      <Close />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <OrderSummary cart={cartData} />
    </div>
  );
}
