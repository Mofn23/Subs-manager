"use client";

import { Plus } from "lucide-react";
import React from "react";

interface MonaiFABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function MonaiFAB({
  onClick,
  icon = <Plus className="w-8 h-8 text-white stroke-[3]" />,
  ariaLabel = "Add subscription",
  className = "",
}: MonaiFABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`fixed bottom-24 right-6 z-40 w-[72px] h-[72px] rounded-full bg-[var(--coral)] text-white shadow-2xl shadow-[var(--coral)]/40 flex items-center justify-center transition-transform duration-150 monai-press active:scale-90 hover:scale-105 border border-white/20 ${className}`}
    >
      {icon}
    </button>
  );
}
