import { ReactNode, Suspense } from "react";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { Box } from "@mui/material";
import HomePageV2 from "./home/page";
import Footer from "./shared/Footer";
import NavigationBar from "./shared/NavigationBar";
import ChatModal from "./shared/ChatModal";
import BikesPage from "./bikes/page";
import AccessoriesPage from "./accessories/page";
import ProductPage from "./products/page";
import FAQPage from "./resources/faq/page";
import ShippingPage from "./resources/shipping/page";
import ContactPage from "./resources/contact/page";
import CartPage from "./cart/page";
import CheckoutPage from "./checkout/page";
import OrderConfirmationPage from "./checkout/confirmation/page.tsx";

function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Box>
      <NavigationBar />
      <Box>{children}</Box>
      <ChatModal />
      <Footer />
    </Box>
  );
}

export default function AppRoutes() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <AppLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </AppLayout>
      ),
      children: [
        {
          path: "/",
          element: <HomePageV2 />,
        },
        {
          path: "bikes",
          element: <BikesPage />,
        },
        {
          path: "accessories",
          element: <AccessoriesPage />,
        },
        {
          path: "faq",
          element: <FAQPage />,
        },
        {
          path: "shipping",
          element: <ShippingPage />,
        },
        {
          path: "contact",
          element: <ContactPage />,
        },
        {
          path: "product/:productId",
          element: <ProductPage />,
        },
        {
          path: "cart",
          element: <CartPage />,
        },
        {
          path: "checkout",
          element: <CheckoutPage />,
        },
        {
          path: "confirmation",
          element: <OrderConfirmationPage />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}
