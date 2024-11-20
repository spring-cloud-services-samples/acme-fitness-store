import { useGetProducts } from "../hooks/catalogHooks";
import Loading from "../components/Loading";
import ProductCard from "../components/ProductCard";

export default function BikesPage() {
  const { data, isLoading } = useGetProducts();

  if (isLoading) {
    return <Loading />;
  }

// TODO: maybe we can refactor the Catalog Service to remove duplicate `data` tag
    if (isLoading || data?.data == null) {
        return null;
    }

  const bikes = data.data.filter((product) => product.tags.includes("bicycle"));

  if (bikes.length <= 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div role="status">
          <p>No bikes available.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 pl-16 bg-blueberry text-white">
        <div className="flex gap-2 mb-4">
          <a href="/" className="underline">
            Home
          </a>
          <p>{">"}</p>
          <p>Bikes</p>
        </div>

        <div>
          <h1>All bikes</h1>
        </div>
      </div>

      <hr className="border-8 border-mint border-dashed border-spacing-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 bg-navy-50 p-8 md:p-16">
        {bikes.map((bike) => (
          <ProductCard key={bike.id} product={bike} />
        ))}
      </div>
    </div>
  );
}
