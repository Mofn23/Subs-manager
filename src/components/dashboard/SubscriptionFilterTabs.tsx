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
    <div className="flex items-center gap-1 overflow-x-auto p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-apple-border dark:border-white/10 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = currentFilter === tab.id;
        const count = counts[tab.id] || 0;
        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              isActive
                ? "bg-white dark:bg-[#16161A] text-apple-text dark:text-white shadow-apple"
                : "text-apple-secondary dark:text-neutral-400 hover:text-apple-text dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${
                isActive
                  ? "bg-apple-accent-soft dark:bg-blue-500/20 text-apple-accent dark:text-blue-400"
                  : "bg-black/5 dark:bg-white/10 text-apple-tertiary dark:text-neutral-400"
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
