"use client";

import React from "react";

interface MonaiAvatarProps {
  emoji?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isRecurring?: boolean;
  className?: string;
}

export function MonaiAvatar({
  emoji = "📦",
  size = "lg",
  isRecurring = true,
  className = "",
}: MonaiAvatarProps) {
  let sizeClasses = "w-16 h-16 text-3xl rounded-3xl";
  let badgeSize = "w-5 h-5 text-[10px]";

  if (size === "sm") {
    sizeClasses = "w-10 h-10 text-xl rounded-2xl";
    badgeSize = "w-4 h-4 text-[9px]";
  } else if (size === "md") {
    sizeClasses = "w-12 h-12 text-2xl rounded-2xl";
    badgeSize = "w-4.5 h-4.5 text-[9px]";
  } else if (size === "xl") {
    sizeClasses = "w-20 h-20 text-4xl rounded-3xl";
    badgeSize = "w-6 h-6 text-xs";
  }

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <div className={`${sizeClasses} bg-[var(--surface-elevated)] border border-[var(--border)] shadow-sm flex items-center justify-center transition-transform hover:scale-105`}>
        <span>{emoji}</span>
      </div>
      {isRecurring && (
        <div className={`absolute -bottom-1 -right-1 ${badgeSize} rounded-full bg-[var(--tag)] text-[var(--text-secondary)] border border-[var(--border)] flex items-center justify-center shadow-sm font-black`}>
          ↻
        </div>
      )}
    </div>
  );
}
