import { useState } from "react";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import Button from "./Button";

interface HeightFormProps {
  onSubmit: (data: { height: string }) => void;
  isExpanded: boolean;
}

export default function HeightForm({ onSubmit, isExpanded }: HeightFormProps) {
  const [height, setHeight] = useState(170);

  const increaseHeight = () => {
    setHeight((prev) => prev + 1);
  };

  const decreaseHeight = () => {
    setHeight((prev) => prev - 1);
  };

  return (
    <div className="w-full shadow-xl">
      <div className="p-6">
        <h3 className="text-grape mt-1 mb-3 text-center">Select your height</h3>

        <div className="flex flex-col items-center">
          <Button
            variant="icon"
            onClick={() => increaseHeight()}
            aria-label="Increase height"
          >
            <ArrowUpward className="size-6" />
          </Button>

          <div className="">
            <div className="h-10 flex items-center justify-center text-indigo-800">
              {height + 2}
            </div>

            <div className="h-10 flex items-center justify-center text-indigo-800">
              {height + 1}
            </div>

            <div className="h-10 flex items-center justify-center text-indigo-800 font-bold text-xl border border-grape px-8 rounded">
              {height} cm
            </div>

            <div className="h-10 flex items-center justify-center text-indigo-800">
              {height - 1}
            </div>

            <div className="h-10 flex items-center justify-center text-indigo-800">
              {height - 2}
            </div>
          </div>

          <Button
            variant="icon"
            onClick={() => decreaseHeight()}
            aria-label="Decrease height"
          >
            <ArrowDownward className="size-6" />
          </Button>
        </div>

        <div
          className={`flex space-between m-2 mt-8 ${
            isExpanded ? "flex-row gap-6" : "flex-col gap-2"
          }`}
        >
          <Button onClick={() => onSubmit({ height: height.toString() })}>
            Continue
          </Button>

          <Button
            variant="outline"
            className="border border-chocolate"
            onClick={() => onSubmit({ height: "" })}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
