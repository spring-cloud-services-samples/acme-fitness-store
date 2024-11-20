import { ChangeEvent, FormEvent, useState } from "react";
import OrderSummary from "../cart/OrderSummary";
import { useGetUserInfo } from "../hooks/userHooks";
import { useClearCart, useGetCart } from "../hooks/cartHooks";
import Button from "../components/Button";
import { useCreateOrder } from "../hooks/orderHook";
import constructOrder from "../utils/helpers";
import splitExpirationDate from "../utils/splitExpirationDate";
import StateDropdown from "./StateSelect";

export default function CheckoutPage() {
  const { data: userInfo } = useGetUserInfo();
  const { data: cartData } = useGetCart(userInfo);

  const { mutate: createOrder } = useCreateOrder(userInfo?.userId);
  const { mutate: clearCart } = useClearCart(userInfo?.userId);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    cardName: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Handle form submission logic here
    console.log("Form submitted:", formData);

    // TODO: maybe use a date picker for this component
    const { expiryMonth, expiryYear } = splitExpirationDate(
      formData.expirationDate
    );

    const order = constructOrder(
      cartData,
      {
        firstname: formData.firstName,
        lastname: formData.lastName,
        company: formData.firstName,
        street: formData.address,
        city: formData.city,
        zip: formData.zipCode,
        state: formData.state,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
      },
      "standard",
      {
        cardType: "visa",
        cardNumber: formData.cardNumber,
        ccv: formData.cvv,
        expMonth: expiryMonth,
        expYear: expiryYear,
      },
      userInfo.userId
    );

    createOrder(order, {
      onSuccess: () => {
        clearCart();
        window.location.href = "/confirmation";
      },
      onError: (error: Error) => {
        console.error("Error creating order:", error.message);
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-grape mb-4 md:mb-0">Checkout</h1>

      <div className="flex flex-col-reverse lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-lg mt-8">
              <h2 className="text-2xl font-bold text-grape-600 mb-4">
                Address Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-chocolate-600"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-chocolate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-grape-500 focus:border-grape-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-chocolate-600"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-chocolate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-grape-500 focus:border-grape-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-chocolate-600"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-chocolate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-grape-500 focus:border-grape-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-chocolate-600"
                  >
                    Phone
                  </label>
                  <input
                    type="phone"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-chocolate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-grape-500 focus:border-grape-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-chocolate-600"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-chocolate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-grape-500 focus:border-grape-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-chocolate-600"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-chocolate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-grape-500 focus:border-grape-500"
                  />
                </div>

                <StateDropdown
                  value={formData.state}
                  setValue={(e: ChangeEvent<HTMLSelectElement>) => {
                    const { name, value } = e.target;

                    setFormData((prevState) => ({
                      ...prevState,
                      [name]: value,
                    }));
                  }}
                />

                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-chocolate-600"
                  >
                    Zip Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-chocolate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-grape-500 focus:border-grape-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="bg-white">
              <h2 className="text-2xl font-bold text-grape-600 mb-4">
                Payment Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="cardName"
                    className="block text-sm font-medium text-chocolate-600"
                  >
                    Name on Card
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-chocolate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-grape-500 focus:border-grape-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="cardNumber"
                    className="block text-sm font-medium text-chocolate-600"
                  >
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-chocolate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-grape-500 focus:border-grape-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="expirationDate"
                    className="block text-sm font-medium text-chocolate-600"
                  >
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    id="expirationDate"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    required
                    placeholder="MM/YY"
                    className="mt-1 block w-full border border-chocolate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-grape-500 focus:border-grape-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cvv"
                    className="block text-sm font-medium text-chocolate-600"
                  >
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-chocolate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-grape-500 focus:border-grape-500"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" variant="filled" className="px-8 py-3">
              Order now
            </Button>
          </form>
        </div>

        <OrderSummary cart={cartData} hideCheckoutButton />
      </div>
    </div>
  );
}
