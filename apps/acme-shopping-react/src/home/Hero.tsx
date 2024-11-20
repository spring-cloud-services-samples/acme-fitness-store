import Button from "../components/Button.tsx";

export default function Hero() {
  return (
    <div className="relative w-full h-[52rem]">
      {/* Hero Image */}
      <img
        src="/hero.png"
        alt="Hero Background"
        className="absolute inset-0 object-cover w-full h-full"
      />

      <div className="relative flex items-end justify-start h-full bg-black bg-opacity-50 text-white">
        <div className="flex-col m-8 mb-32">
          <p className="mt-4 text-2xl font-bold mb-6">New Arrival</p>
          <h1 className="text-8xl mb-16">Velo Racing Bikes</h1>

          <a href="/bikes">
            <Button variant="outline">Shop Velo</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
