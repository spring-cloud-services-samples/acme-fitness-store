interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What types of bikes does ACME Fitness offer?",
    answer:
      "ACME Fitness offers a wide range of bikes including road bikes, mountain bikes, hybrid bikes, electric bikes, and BMX bikes. We cater to all levels of cyclists, from beginners to professionals, and also offer a selection of kids' bikes.",
  },
  {
    question: "Do you offer bike fitting services?",
    answer:
      "Yes, we provide professional bike fitting services to ensure you get the perfect fit for your riding style and body type. Our expert technicians use advanced techniques to optimize your comfort and performance. This service is complimentary with the purchase of any new bike.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for all unused bikes and accessories in their original packaging. For bikes, we also provide a 14-day test ride period. If you're not satisfied, you can return the bike for a full refund or exchange. Custom-built bikes are subject to a 20% restocking fee.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Currently, ACME Fitness only ships within the continental United States. We're working on expanding our shipping options to serve international customers in the future. For customers in Alaska and Hawaii, please contact our customer service for shipping options.",
  },
  {
    question: "Are your electric bikes legal to ride on public roads?",
    answer:
      "Yes, all our electric bikes comply with federal regulations for e-bikes. However, local laws may vary, so we recommend checking your local regulations regarding the use of e-bikes on public roads and trails. We provide a guide to e-bike laws with each purchase.",
  },
  {
    question: "Do you offer financing options?",
    answer:
      "Yes, we offer financing options to make your bike purchase more affordable. We partner with several financial institutions to provide flexible payment plans. Customers can apply for financing online or in-store. Terms and conditions apply, and approval is subject to credit check.",
  },
  {
    question: "What kind of warranty do you offer on bikes?",
    answer:
      "All new bikes come with a manufacturer's warranty, typically covering defects in materials and workmanship. The duration varies by brand and model, ranging from 1 to 5 years for frames and 6 months to 2 years for components. We also offer extended warranty options for additional peace of mind.",
  },
  {
    question: "Do you offer bike maintenance services?",
    answer:
      "Our skilled technicians provide a full range of maintenance services, from basic tune-ups to comprehensive overhauls. We offer free basic adjustments for the first year after purchase of a new bike. We also run maintenance workshops for those interested in learning DIY bike care.",
  },
  {
    question: "Can I test ride a bike before purchasing?",
    answer:
      "Yes, we encourage test rides to ensure you're completely satisfied with your choice. We have a dedicated test track at our main store locations. For online purchases, we offer a 14-day at-home test ride period. If you're not satisfied, you can return or exchange the bike.",
  },
  {
    question: "Do you sell bike accessories and gear?",
    answer:
      "Yes, we offer a comprehensive range of bike accessories and gear. This includes helmets, lights, locks, pumps, tools, cycling clothing, shoes, and nutrition products. We also stock car racks and bike storage solutions to support your cycling lifestyle.",
  },
];

function FAQItem({ item }: { item: FAQItem }) {
  return (
    <div className="mb-8">
      <h2 className="text-grape-600 text-xl font-semibold text-gray-900 mb-2">
        {item.question}
      </h2>
      <p className="text-gray-600">{item.answer}</p>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-grape text-3xl font-extrabold text-gray-900 mb-8 text-center">
        Frequently Asked Questions
      </h1>

      <div className="rounded-lg overflow-hidden p-6 md:p-8">
        {faqData.map((item, index) => (
          <FAQItem key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
