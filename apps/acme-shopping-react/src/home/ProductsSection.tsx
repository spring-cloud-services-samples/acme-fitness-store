import Button from "../components/Button.tsx";
import ProductCard from "../components/ProductCard.tsx";
import { useGetProducts } from "../hooks/catalogHooks.ts";

export default function ProductsSection() {
  const { data, isLoading} = useGetProducts();

  // TODO: maybe we can refactor the Catalog Service to remove duplicate `data` tag
  if ( isLoading || data?.data == null) {
    return null;
  }

  // only get first three products
  const products = data.data.slice(0, 3);

  return (
    <div className="bg-blueberry-100 w-full p-8">
      <p className="text-chocolate font-bold">Products</p>
      <h2 className="text-grape-900">Featured bikes</h2>

      <div className="flex flex-row justify-between my-4 gap-4 flex-wrap lg:flex-nowrap">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <a href="/bikes">
        <Button variant="filled">Shop all bikes</Button>
      </a>
    </div>
  );
}
