import Button from "../../components/Button.tsx";

export default function OrderConfirmationPage() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="my-4 text-center">
        <h4>Order Confirmation</h4>
        <p>Your transaction was successfully processed</p>

        <a href="/">
          <Button variant="filled" className="mt-16">
            Browse more products
          </Button>
        </a>
      </div>
    </div>
  );
}
