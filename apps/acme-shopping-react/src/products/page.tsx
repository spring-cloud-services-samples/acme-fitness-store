import { useParams } from "react-router-dom";
import { useGetUserInfo } from "../hooks/userHooks.ts";
import { useGetProduct } from "../hooks/catalogHooks.ts";
import { useAddToCart } from "../hooks/cartHooks.ts";
import { CartItemData } from "../types/Cart.ts";
import Loading from "../components/Loading.tsx";
import Error from "../components/Error.tsx";
import Markdown from "marked-react";
import Button from "../components/Button.tsx";
import formatDollar from "../utils/formatDollar.ts";

import "../styles/description.css";

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();

  const { data: userInfo, isLoading: isUserLoading } = useGetUserInfo();
  const { data, error, isLoading: isProductLoading } = useGetProduct(productId);

  const addToCartMutation = useAddToCart(userInfo?.userId);

  if (isProductLoading || isUserLoading || userInfo == null) {
    return <Loading />;
  }

// TODO: maybe we can refactor the Catalog Service to remove duplicate `data` tag
  if (isProductLoading || data?.data == null) {
    return null;
  }

  const product = data.data;

  const handleAddToCart = () => {
    const cartItem: CartItemData = {
      itemid: product.id,
      name: product.name,
      price: product.price.toString(),
      quantity: 1,
      shortDescription: product.shortDescription,
    };
    addToCartMutation.mutate(cartItem);
  };

  return (
    <div>
      <div className="bg-navy-50 flex flex-col md:flex-row justify-between">
        <img
          src={product.imageUrl1}
          width="w-2/3"
          alt={`image-${product.name}`}
        />

        <div className="flex flex-col justify-around">
          <div className="flex flex-col my-4 ml-8 mr-24">
            <h1 id="product-title" className="text-grape mb-4">
              {product.name}
            </h1>

            <p className="text-lg">{product.shortDescription}</p>

            <h2 className="text-chocolate my-4">
              {formatDollar(product.price)}
            </h2>

            <Button
              data-cy="add-button"
              variant="filled"
              onClick={handleAddToCart}
              className="p-4 w-36 my-2"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      <hr className="border-8 border-lemon border-dashed border-spacing-8" />

      <div className="markdown mx-4 md:mx-8 mt-8">
        <Markdown>{product.description}</Markdown>
      </div>
    </div>
  );
}
