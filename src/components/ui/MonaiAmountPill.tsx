"use client";

import React from "react";

interface MonaiAmountPillProps {
  amount: string;
  isPositive?: boolean;
  prefix?: "⊖" | "⊕" | "";
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export function MonaiAmountPill({
  amount,
  isPositive = false,
  prefix = "⊖",
  subtitle,
  className = "",
  onClick,
}: MonaiAmountPillProps) {
  const isLight = isPositive || prefix === "⊕";

  const mainPillClass = isLight
    ? "bg-[var(--pill-light)] text-[var(--pill-light-text)] font-extrabold shadow-sm hover:opacity-95"
    : "bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border)] font-extrabold";

  const TagName = onClick ? "button" : "div";

  return (
    <div className={`flex flex-col items-end gap-1 ${className}`}>
      <TagName
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={`px-3.5 py-1.5 rounded-full text-sm sm:text-base tracking-tight transition-all duration-150 inline-flex items-center gap-1.5 ${mainPillClass} ${
          onClick ? "cursor-pointer active:scale-95 monai-press" : ""
        }`}
      >
        {prefix && <span className="opacity-70 text-xs sm:text-sm">{prefix}</span>}
        <span>{amount}</span>
      </TagName>

      {subtitle && (
        <span className="text-[12px] font-semibold text-[var(--text-secondary)] tracking-tight px-1">
          {subtitle}
        </span>
      )}
    </div>
  );
}
