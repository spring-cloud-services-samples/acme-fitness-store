export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-grape text-3xl font-extrabold mb-8 text-center">
        Shipping Information
      </h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-grape-600 mb-4">
          Shipping Policies
        </h2>
        <p className="text-chocolate-600 mb-4">
          At ACME Fitness, we strive to get your bikes and accessories to you as
          quickly and safely as possible. We offer a variety of shipping options
          to meet your needs.
        </p>
        <ul className="list-disc list-inside text-chocolate-600 space-y-2">
          <li>
            Free standard shipping on all orders over $100 within the
            continental United States.
          </li>
          <li>
            Expedited and overnight shipping available for an additional fee.
          </li>
          <li>International shipping available to select countries.</li>
          <li>
            All bikes are professionally assembled and tuned before shipping.
          </li>
          <li>
            Accessories ship separately from bikes to ensure fastest possible
            delivery.
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-grape-600 mb-4">
          Delivery Times and Costs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-chocolate-500">
            <thead className="text-xs text-chocolate-600 uppercase bg-chocolate-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Destination
                </th>
                <th scope="col" className="px-6 py-3">
                  Standard Shipping
                </th>
                <th scope="col" className="px-6 py-3">
                  Expedited Shipping
                </th>
                <th scope="col" className="px-6 py-3">
                  Overnight Shipping
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-chocolate-900 whitespace-nowrap"
                >
                  Continental US
                </th>
                <td className="px-6 py-4">
                  3-5 business days
                  <br />
                  Free over $100
                </td>
                <td className="px-6 py-4">
                  2-3 business days
                  <br />
                  $15 or 10% of order
                </td>
                <td className="px-6 py-4">
                  Next business day
                  <br />
                  $30 or 20% of order
                </td>
              </tr>
              <tr className="bg-chocolate-50 border-b">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-chocolate-900 whitespace-nowrap"
                >
                  Alaska & Hawaii
                </th>
                <td className="px-6 py-4">
                  5-7 business days
                  <br />
                  $20 or 15% of order
                </td>
                <td className="px-6 py-4">
                  3-4 business days
                  <br />
                  $35 or 20% of order
                </td>
                <td className="px-6 py-4">
                  1-2 business days
                  <br />
                  $50 or 30% of order
                </td>
              </tr>
              <tr className="bg-white border-b">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-chocolate-900 whitespace-nowrap"
                >
                  Canada
                </th>
                <td className="px-6 py-4">
                  7-10 business days
                  <br />
                  $30 or 20% of order
                </td>
                <td className="px-6 py-4">
                  5-7 business days
                  <br />
                  $50 or 30% of order
                </td>
                <td className="px-6 py-4">
                  2-3 business days
                  <br />
                  $75 or 40% of order
                </td>
              </tr>
              <tr className="bg-chocolate-50 border-b">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-chocolate-900 whitespace-nowrap"
                >
                  Europe
                </th>
                <td className="px-6 py-4">
                  10-15 business days
                  <br />
                  $50 or 25% of order
                </td>
                <td className="px-6 py-4">
                  7-10 business days
                  <br />
                  $75 or 35% of order
                </td>
                <td className="px-6 py-4">
                  3-5 business days
                  <br />
                  $100 or 50% of order
                </td>
              </tr>
              <tr className="bg-white border-b">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-chocolate-900 whitespace-nowrap"
                >
                  Rest of World
                </th>
                <td className="px-6 py-4">
                  15-20 business days
                  <br />
                  $75 or 30% of order
                </td>
                <td className="px-6 py-4">
                  10-15 business days
                  <br />
                  $100 or 40% of order
                </td>
                <td className="px-6 py-4">
                  5-7 business days
                  <br />
                  $150 or 60% of order
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-grape-600 mb-4">
          Additional Information
        </h2>
        <ul className="list-disc list-inside text-chocolate-600 space-y-2">
          <li>
            Shipping times are estimates and may vary based on customs
            processing for international orders.
          </li>
          <li>
            Oversized items (e.g., certain bike models) may incur additional
            shipping fees.
          </li>
          <li>
            We offer free in-store pickup at any of our physical locations for
            online orders.
          </li>
          <li>
            For orders containing both bikes and accessories, items may ship
            separately to ensure fastest delivery.
          </li>
          <li>
            Tracking information will be provided via email once your order has
            shipped.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-grape-600 mb-4">Contact Us</h2>
        <p className="text-chocolate-600 mb-4">
          If you have any questions about shipping or need to arrange a special
          delivery, please don't hesitate to contact our customer service team:
        </p>
        <p className="text-chocolate-600">
          Email: shipping@acmefitness.com
          <br />
          Phone: 1-800-ACME-FIT (1-800-226-3348)
          <br />
          Hours: Monday-Friday, 9am-5pm PST
        </p>
      </section>
    </div>
  );
}
