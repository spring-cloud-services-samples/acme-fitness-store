import { useState } from "react";

const terrainOptions = [
  {
    name: "Paved paths",
    description: "Suburban and city roads, or established bike paths",
    image: "/paved.png",
    recommended: true,
  },
  {
    name: "Gravel roads",
    description: "More agility for gravel trails and roads",
    image: "/gravel.png",
  },
  {
    name: "Trails",
    description:
      "Added stability for mountain biking, trails, jumps, and off-roading",
    image: "/trail.png",
  },
];

interface TerrainFormProps {
  onSubmit: (data: { terrain: string }) => void;
  isExpanded: boolean;
}

export default function TerrainForm({
  onSubmit,
  isExpanded,
}: TerrainFormProps) {
  const [selectedTerrain, setSelectedTerrain] = useState("");

  const handleTerrainSelect = (terrain: string) => {
    setSelectedTerrain(terrain);
    onSubmit({ terrain });
  };

  return (
    <>
      <h3 className="text-grape mt-1 mb-3 text-center">Select a terrain</h3>

      <div
        className={`flex ${
          isExpanded ? "flex-row" : "flex-col"
        }  space-between gap-4`}
      >
        {terrainOptions.map((option) => (
          <div
            key={option.name}
            className={`w-full rounded-lg cursor-pointer bg-white hover:shadow-lg ${
              selectedTerrain === option.name ? "border-2 border-grape" : ""
            }`}
            onClick={() => handleTerrainSelect(option.name)}
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
