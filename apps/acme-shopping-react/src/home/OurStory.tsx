import Button from "../components/Button.tsx";

export default function OurStory() {
  return (
    <>
      <div className="bg-white flex justify-between">
        <div className="flex flex-col justify-around">
          <div className="flex flex-col my-4 ml-8 mr-24">
            <h2 className="text-raspberry mb-4">Our story</h2>

            <p className="mb-4">
              At Acme Fitness, we specialize in high-quality bikes and
              accessories for both casual and serious riders. Founded by
              passionate cyclists Sarah and Tony in 2006, our mission is to
              create a welcoming space for everyone to discover their ideal
              ride. From our carefully curated selection to our commitment to
              customer satisfaction, we strive to foster a love for cycling in
              our community.
            </p>

            <a href="/contact">
              <Button variant="outline" className="border-black">
                Learn more
              </Button>
            </a>
          </div>
        </div>

        <img src="/story.png" className="w-2/3 hidden lg:block" />
      </div>
      <hr className="border-8 border-raspberry border-dashed border-spacing-8" />
    </>
  );
}
