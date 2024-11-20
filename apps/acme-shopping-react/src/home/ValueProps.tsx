export default function ValueProps() {
  const items = [
    {
      image: "/icons/route_icon.png",
      title: "Choose your next bike",
      description: "FitAssist can find the best bike for you.",
    },
    {
      image: "/icons/support_icon.png",
      title: "Customer support",
      description: "We love to help! Contact us today.",
    },
    {
      image: "/icons/truck_icon.png",
      title: "Free shipping & returns",
      description: "Learn about our shipping and return policy.",
    },
  ];

  return (
    <div className="bg-blueberry-900 w-full text-white py-16  text-center px-8 md:px-12 lg:px-24">
      <div className="flex flex-col md:flex-row justify-between my-4 gap-8">
        {items.map((item) => (
          <div
            className="flex flex-col justify-center items-center"
            key={item.title}
          >
            <img src={item.image} alt={item.title} className="size-20 mb-4" />

            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
