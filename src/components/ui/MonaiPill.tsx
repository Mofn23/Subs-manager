"use client";

import React from "react";

interface MonaiPillProps {
  children: React.ReactNode;
  active?: boolean;
  variant?: "default" | "tag" | "coral" | "green" | "amber" | "light";
  onClick?: () => void;
  className?: string;
}

export function MonaiPill({
  children,
  active = false,
  variant = "default",
  onClick,
  className = "",
}: MonaiPillProps) {
  let bgClass = "bg-[var(--tag)] text-[var(--text-primary)] border border-[var(--border)]";

  if (active) {
    bgClass = "bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-white/20 shadow-sm font-extrabold";
  } else if (variant === "coral") {
    bgClass = "bg-[var(--coral)]/15 text-[var(--coral)] border border-[var(--coral)]/30 font-bold";
  } else if (variant === "green") {
    bgClass = "bg-[var(--green)]/15 text-[var(--green)] border border-[var(--green)]/30 font-bold";
  } else if (variant === "amber") {
    bgClass = "bg-[var(--amber-soft)] text-[var(--amber)] border border-[var(--amber)]/30 font-bold";
  } else if (variant === "light") {
    bgClass = "bg-[var(--pill-light)] text-[var(--pill-light-text)] font-extrabold shadow-sm";
  } else if (variant === "tag") {
    bgClass = "bg-[var(--tag)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-bold";
  }

  const TagName = onClick ? "button" : "div";

  return (
    <TagName
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] tracking-tight transition-all duration-150 monai-press ${bgClass} ${
        onClick ? "cursor-pointer hover:opacity-90 active:scale-95" : ""
      } ${className}`}
    >
      {children}
    </TagName>
  );
}
