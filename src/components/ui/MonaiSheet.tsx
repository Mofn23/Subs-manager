"use client";

import React, { useEffect, useRef } from "react";

interface MonaiSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function MonaiSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  className = "",
}: MonaiSheetProps) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);

    // Prevent horizontal swipe gestures from triggering page back/forward navigation or modal exit
    if (deltaX > deltaY && deltaX > 5) {
      e.stopPropagation();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={`relative z-10 w-full max-w-2xl mx-auto bg-[var(--bg-sheet)] rounded-t-[32px] border-t border-[var(--border)] shadow-2xl p-6 sm:p-8 flex flex-col max-h-[92vh] animate-sheet-slide-up text-[var(--text-primary)] touch-pan-y overscroll-contain select-text ${className}`}
        style={{ touchAction: "pan-y", overscrollBehaviorX: "contain" }}
      >
        {/* Top Handle / Drag indicator */}
        <div className="w-12 h-1.5 rounded-full bg-[var(--text-secondary)]/30 mx-auto mb-6 shrink-0" />

        {/* Sheet Header */}
        <div className="flex items-start justify-between gap-4 mb-6 shrink-0">
          <div>
            <h2 className="text-[30px] sm:text-[34px] font-black tracking-tight text-[var(--text-primary)] leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm font-semibold text-[var(--text-secondary)] mt-1">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]/80 transition-all flex items-center justify-center text-xl font-bold shrink-0 monai-press active:scale-90"
            aria-label="Close"
          >
            ⊗
          </button>
        </div>

        {/* Sheet Body Scrollable */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 touch-pan-y" style={{ touchAction: "pan-y" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
