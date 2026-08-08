"use client";

import React from "react";

interface MonaiToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function MonaiToggle({
  checked,
  onChange,
  disabled = false,
  className = "",
}: MonaiToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out relative shrink-0 ${
        checked ? "bg-[var(--green)]" : "bg-[var(--surface-elevated)] border border-[var(--border)]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      <div
        className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}
