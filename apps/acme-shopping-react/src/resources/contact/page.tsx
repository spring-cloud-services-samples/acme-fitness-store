import { ChangeEvent, FormEvent, useState } from "react";
import Button from "../../components/Button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Thank you");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-grape mb-8 text-center">
        Contact ACME Fitness
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-grape-600 mb-4">
            Get in Touch
          </h2>
          <p className="text-chocolate-600 mb-4">
            We're here to help! If you have any questions about our products,
            services, or your order, please don't hesitate to reach out.
          </p>
          <div className="space-y-2">
            <p className="text-chocolate-600">
              <strong className="text-grape-600">Address: </strong>
            </p>

            <address className="not-italic">
              2705 Thunder Road
              <br />
              Palo Alto, California
              <br />
              Country
              <br />
            </address>

            <p className="text-chocolate-600">
              <strong className="text-grape-600">Phone:</strong> 1-800-ACME-FIT
              (1-800-226-3348)
            </p>
            <p className="text-chocolate-600">
              <strong className="text-grape-600">Email:</strong>{" "}
              info@acmefitness.com
            </p>
            <p className="text-chocolate-600">
              <strong className="text-grape-600">Hours:</strong> Monday-Friday,
              9am-5pm PST
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-grape-600 mb-4">
            Send Us a Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-chocolate-600 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-chocolate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-grape-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-chocolate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-chocolate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-grape-500"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-chocolate-600 mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-chocolate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-grape-500"
              ></textarea>
            </div>
            <Button
              type="submit"
              className="w-full text-white font-bold py-2 px-4 rounded-md hover:bg-grape-600 transition duration-300"
            >
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
