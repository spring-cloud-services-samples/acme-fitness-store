import React, { ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "outline" | "icon";
}

export default function Button({
  children,
  variant = "filled",
  className,
  ...rest
}: ButtonProps) {
  const baseStyles =
    "px-4 py-2 rounded text-sm font-medium focus:outline-none transition";

  const variants = {
    filled: "bg-grape text-white hover:bg-blue-700",
    outline: "bg-transparent border border-white text-white-600",
    icon: "p-2 text-blue-600 hover:bg-blue-100 rounded-full",
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}
