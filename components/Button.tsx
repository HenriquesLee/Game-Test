"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "gold" | "teal" | "red" | "ghost";
}

const variants: Record<string, string> = {
  gold: "bg-gold text-ink hover:bg-[#e0b263] active:bg-[#c4923e]",
  teal: "bg-teal text-paper hover:bg-[#478279] active:bg-[#356158]",
  red: "bg-red text-paper hover:bg-[#c95850] active:bg-[#9c3a33]",
  ghost:
    "bg-transparent text-paper border border-ink-line hover:border-paper-dim",
};

export default function Button({
  children,
  variant = "gold",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`px-6 py-3.5 rounded-full font-sans font-semibold text-[15px] tracking-normal transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
