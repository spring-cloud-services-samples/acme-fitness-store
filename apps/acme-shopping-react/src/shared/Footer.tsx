import { Facebook, Instagram, X } from "@mui/icons-material";
import Button from "../components/Button.tsx";

export default function Footer() {
  return (
    <footer className="bg-navy text-white pt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Shop Section */}
          <div>
            <h3 className="text-grape-300 font-semibold text-lg mb-4">Shop</h3>

            <ul className="space-y-2">
              <li>
                <a href="/bikes" className="hover:text-lemon hover:underline">
                  Bikes
                </a>
              </li>
              <li>
                <a
                  href="/accessories"
                  className="hover:text-lemon hover:underline"
                >
                  Accessories
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="text-grape-300 font-semibold text-lg mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/faq" className="hover:text-lemon hover:underline">
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/shipping"
                  className="hover:text-lemon hover:underline"
                >
                  Shipping
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-lemon hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Address Section */}
          <div>
            <h3 className="text-grape-300 font-semibold text-lg mb-4">
              ACME Fitness
            </h3>
            <address className="not-italic">
              2705 Thunder Road
              <br />
              Palo Alto, California
              <br />
              Country
              <br />
            </address>
          </div>

          {/* User Login and Newsletter Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-grape-300 font-semibold text-lg mb-2">
                User
              </h3>
              <a
                href="/acme-login"
                className="hover:text-lemon hover:underline"
              >
                Login
              </a>
            </div>
            <div>
              <h3 className="text-grape-300 font-semibold text-lg mb-2">
                Get the latest
              </h3>
              <p className="my-1">
                Join the Acme Fitness community and stay up to date with the
                world of fitness.
              </p>

              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-grow rounded w-full py-2 mb-2 indent-2"
                required
              />
              <Button variant="filled">Sign up</Button>
            </div>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="text-grape-300 font-semibold text-lg mb-4">
              Follow Us
            </h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600"
              >
                <Facebook className="size-6" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400"
              >
                <X className="size-6" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-600"
              >
                <Instagram className="size-6" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-black text-sm text-end">
        <p>
          &copy; {new Date().getFullYear()} ACME Fitness. This website is for
          demo purposes only. It is not an actual e-commerce site.
        </p>
      </div>
    </footer>
  );
}
