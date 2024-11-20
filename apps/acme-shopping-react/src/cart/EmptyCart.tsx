import Button from "../components/Button";

export default function EmptyCart() {
  return (
    <div className="flex items-center justify-center text-center h-96">
      <div>
        <p className="text-lg mb-4">Your cart is empty.</p>

        <a href="/bikes">
          <Button variant="outline" className="border-chocolate">
            Shop now
          </Button>
        </a>
      </div>
    </div>
  );
}
