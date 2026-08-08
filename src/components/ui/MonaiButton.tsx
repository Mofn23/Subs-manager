"use client";

import React from "react";

interface MonaiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "coral" | "green" | "surface" | "light" | "ghost";
  size?: "sm" | "md" | "lg" | "giant";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function MonaiButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: MonaiButtonProps) {
  let variantStyles = "";
  switch (variant) {
    case "coral":
    case "primary":
      variantStyles = "bg-[var(--coral)] text-white hover:bg-[var(--coral)]/90 shadow-lg shadow-[var(--coral)]/20 font-black";
      break;
    case "green":
      variantStyles = "bg-[var(--green)] text-black hover:bg-[var(--green)]/90 shadow-lg shadow-[var(--green)]/20 font-black";
      break;
    case "surface":
      variantStyles = "bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-elevated)]/80 font-bold";
      break;
    case "light":
      variantStyles = "bg-[var(--pill-light)] text-[var(--pill-light-text)] hover:opacity-95 font-extrabold shadow-sm";
      break;
    case "ghost":
      variantStyles = "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--tag)] font-bold";
      break;
  }

  let sizeStyles = "";
  switch (size) {
    case "sm":
      sizeStyles = "px-3 py-1.5 text-xs rounded-full";
      break;
    case "md":
      sizeStyles = "px-4 py-2.5 text-sm rounded-full";
      break;
    case "lg":
      sizeStyles = "px-6 py-3.5 text-base rounded-2xl";
      break;
    case "giant":
      sizeStyles = "px-8 py-4 text-lg rounded-2xl tracking-wide";
      break;
  }

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 monai-press transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variantStyles} ${sizeStyles} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
