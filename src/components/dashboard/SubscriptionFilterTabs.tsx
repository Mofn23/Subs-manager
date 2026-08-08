"use client";

export type FilterStatus = "ALL" | "ACTIVE" | "TRIAL" | "LOW_USAGE" | "PAUSED" | "CANCELLED";

interface FilterTabsProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  counts: Record<FilterStatus, number>;
}

export function SubscriptionFilterTabs({ currentFilter, onFilterChange, counts }: FilterTabsProps) {
  const tabs: { id: FilterStatus; label: string }[] = [
    { id: "ALL", label: "All" },
    { id: "ACTIVE", label: "Active" },
    { id: "TRIAL", label: "Trials" },
    { id: "LOW_USAGE", label: "Review / Low Usage" },
    { id: "PAUSED", label: "Paused" },
    { id: "CANCELLED", label: "Canceled" },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-[var(--surface)] rounded-full border border-[var(--border)] scrollbar-none">
      {tabs.map((tab) => {
        const isActive = currentFilter === tab.id;
        const count = counts[tab.id] || 0;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all duration-150 monai-press active:scale-95 ${
              isActive
                ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-white/20 shadow-md"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
                isActive
                  ? "bg-[var(--coral)] text-white"
                  : "bg-[var(--tag)] text-[var(--text-secondary)]"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
