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
    <div className="flex items-center gap-1 overflow-x-auto p-1 bg-black/5 rounded-2xl border border-apple-border scrollbar-none">
      {tabs.map((tab) => {
        const isActive = currentFilter === tab.id;
        const count = counts[tab.id] || 0;
        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              isActive
                ? "bg-white text-apple-text shadow-apple"
                : "text-apple-secondary hover:text-apple-text hover:bg-white/40"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${
                isActive
                  ? "bg-apple-accent-soft text-apple-accent"
                  : "bg-black/5 text-apple-tertiary"
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
