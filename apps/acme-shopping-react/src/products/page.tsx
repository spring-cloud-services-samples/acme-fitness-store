import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetUserInfo } from "../hooks/userHooks.ts";
import { useGetProduct } from "../hooks/catalogHooks.ts";
import { useAddToCart } from "../hooks/cartHooks.ts";
import { CartItemData } from "../types/Cart.ts";
import Loading from "../components/Loading.tsx";
import Markdown from "marked-react";
import Button from "../components/Button.tsx";
import formatDollar from "../utils/formatDollar.ts";

import "../styles/description.css";

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();

  const { data: userInfo, isLoading: isUserLoading } = useGetUserInfo();
  const { data, isLoading: isProductLoading } = useGetProduct(productId);

  const addToCartMutation = useAddToCart(userInfo?.userId);
  const [loginRequired, setLoginRequired] = useState(false);

  if (isProductLoading || isUserLoading) {
    return <Loading />;
  }

  // TODO: maybe we can refactor the Catalog Service to remove duplicate `data` tag
  if (data?.data == null) {
    return (
      <div className="p-8">
        <p id="product-not-found">Product not found or catalog unavailable.</p>
      </div>
    );
  }

  const product = data.data;

  const handleAddToCart = () => {
    // Cart operations require an authenticated user; there is no guest cart.
    // Prompt the logged-out user to sign in instead of firing a broken request.
    if (!userInfo?.userId) {
      setLoginRequired(true);
      return;
    }
    setLoginRequired(false);
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
              disabled={addToCartMutation.isPending}
              className="p-4 w-36 my-2"
            >
              {addToCartMutation.isPending ? "Adding…" : "Add to Cart"}
            </Button>

            <div aria-live="polite" className="min-h-6 my-1">
              {loginRequired ? (
                <p
                  data-cy="add-login-required"
                  className="text-sm text-chocolate"
                >
                  Please{" "}
                  <button
                    type="button"
                    className="underline font-medium cursor-pointer"
                    onClick={() => (window.location.href = "/acme-login")}
                  >
                    sign in
                  </button>{" "}
                  to add items to your cart.
                </p>
              ) : addToCartMutation.isError ? (
                <p data-cy="add-error" className="text-sm text-raspberry">
                  Couldn&apos;t add to cart. Please try again.
                </p>
              ) : addToCartMutation.isSuccess ? (
                <p data-cy="add-success" className="text-sm text-green">
                  Added to your cart.
                </p>
              ) : null}
            </div>
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
