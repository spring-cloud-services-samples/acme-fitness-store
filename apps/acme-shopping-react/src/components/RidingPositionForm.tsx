import { useState } from "react";

const ridingPositions = [
  {
    name: "Upright and relaxed",
    description: "Great for comfortable riding on paved roads",
    image: "/upright.png",
    recommended: true,
  },
  {
    name: "Active",
    description: "Take more control on fun or fitness rides",
    image: "/active.png",
  },
];

interface RidingPositionFormProps {
  onSubmit: (data: { ridingPosition: string }) => void;
  isExpanded: boolean;
}

export default function RidingPositionForm({
  onSubmit,
  isExpanded,
}: RidingPositionFormProps) {
  const [selectedPosition, setSelectedPosition] = useState("");

  const handlePositionSelect = (position: string) => {
    setSelectedPosition(position);
    onSubmit({ ridingPosition: position });
  };

  return (
    <>
      <h3 className="text-grape mt-1 mb-3 text-center">
        Select a riding position
      </h3>

      <div
        className={`flex ${
          isExpanded ? "flex-row" : "flex-col"
        }  space-between gap-4`}
      >
        {ridingPositions.map((option) => (
          <div
            key={option.name}
            className={`w-full rounded-lg cursor-pointer bg-white hover:shadow-lg ${
              selectedPosition === option.name ? "border-2 border-grape" : ""
            }`}
            onClick={() => handlePositionSelect(option.name)}
          >
            <div className="w-full">
              <img
                className="rounded-t object-cover h-36 w-full bg-white"
                src={option.image}
                alt={option.name}
              />
            </div>

            <div className="pt-2 px-2 flex-grow-1">
              <h5 className="font-bold mb-2">{option.name}</h5>
              <p>{option.description}</p>

              {option?.recommended && (
                <div className="m-4 font-bold text-center rounded-xl bg-lemon border-2 border-black shadow">
                  Recommended
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
