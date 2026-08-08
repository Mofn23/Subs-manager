"use client";

import React, { useEffect, useRef } from "react";

export interface MonaiDropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger" | "success" | "warning";
  divider?: boolean;
}

interface MonaiDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  items: MonaiDropdownItem[];
  className?: string;
  align?: "left" | "right";
}

export function MonaiDropdown({
  isOpen,
  onClose,
  items,
  className = "",
  align = "right",
}: MonaiDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-2 w-56 bg-[var(--surface)] border border-[var(--border)] shadow-2xl rounded-[24px] p-2 z-50 animate-menu-scale-in text-[var(--text-primary)] backdrop-blur-xl ${className}`}
    >
      <div className="space-y-1">
        {items.map((item, idx) => {
          let itemColor = "text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]";
          if (item.variant === "danger") {
            itemColor = "text-[var(--coral)] hover:bg-[var(--coral)]/10 font-extrabold";
          } else if (item.variant === "success") {
            itemColor = "text-[var(--green)] hover:bg-[var(--green)]/10 font-extrabold";
          } else if (item.variant === "warning") {
            itemColor = "text-[var(--amber)] hover:bg-[var(--amber-soft)] font-bold";
          }

          return (
            <React.Fragment key={idx}>
              <button
                type="button"
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[15px] font-extrabold text-left transition-all duration-150 monai-press active:scale-98 ${itemColor}`}
              >
                {item.icon && <span className="w-5 h-5 flex items-center justify-center shrink-0">{item.icon}</span>}
                <span className="flex-1 truncate">{item.label}</span>
              </button>
              {item.divider && <div className="h-px bg-[var(--border-subtle)] my-1" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
