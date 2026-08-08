"use client";

import { deleteSubscription } from "@/app/actions/subscriptions";
import { AttentionSection } from "@/components/dashboard/AttentionSection";
import { HeroStats } from "@/components/dashboard/HeroStats";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import { FilterStatus, SubscriptionFilterTabs } from "@/components/dashboard/SubscriptionFilterTabs";
import { OnboardingModal } from "@/components/modals/OnboardingModal";
import { SubscriptionModal } from "@/components/modals/SubscriptionModal";
import { MonaiFAB } from "@/components/ui/MonaiFAB";
import { MonaiPill } from "@/components/ui/MonaiPill";
import { calculateMonthlyEquivalent, calculateSpendSummary, detectSubscriptionLeaks, formatCurrency, getAutoEmoji, getDaysUntil, SubscriptionItem } from "@/lib/financials";
import { Plus, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface DashboardViewProps {
  initialSubscriptions: any[];
}

export function DashboardView({ initialSubscriptions }: DashboardViewProps) {
  const { data: session } = useSession();
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);

  const currency = session?.user?.currency || "$";
  const monthlyBudget = session?.user?.monthlyBudget;
  const showOnboarding = session?.user && !session.user.onboarded;

  // Process subscriptions
  const subscriptions: SubscriptionItem[] = useMemo(() => {
    return initialSubscriptions.map((s) => ({
      ...s,
      nextRenewalDate: s.nextRenewalDate ? new Date(s.nextRenewalDate) : new Date(),
      trialEndDate: s.trialEndDate ? new Date(s.trialEndDate) : null,
    }));
  }, [initialSubscriptions]);

  // Financial summary
  const spendSummary = useMemo(() => {
    return calculateSpendSummary(subscriptions);
  }, [subscriptions]);

  const leaks = useMemo(() => {
    return detectSubscriptionLeaks(subscriptions);
  }, [subscriptions]);

  // Category breakdown for unified MonAI BarChart
  const categoryBarData = useMemo(() => {
    const map: Record<string, { total: number; icon: string; count: number }> = {};
    subscriptions.forEach((sub) => {
      if (sub.status === "ACTIVE" || sub.status === "TRIAL" || sub.status === "TO_CANCEL") {
        const cat = sub.category || "Other";
        const cost = calculateMonthlyEquivalent(sub.price, sub.billingCycle, sub.customIntervalMonths);
        const icon = sub.icon || getAutoEmoji(sub.name, cat);
        if (!map[cat]) {
          map[cat] = { total: 0, icon, count: 0 };
        }
        map[cat].total += cost;
        map[cat].count += 1;
      }
    });

    const items = Object.entries(map).map(([category, data]) => ({
      category,
      total: data.total,
      icon: data.icon,
      count: data.count,
    }));

    const maxTotal = Math.max(...items.map((i) => i.total), 1);

    return { items, maxTotal };
  }, [subscriptions]);

  // Counts map for filter tabs
  const counts = useMemo(() => {
    return {
      ALL: subscriptions.length,
      ACTIVE: subscriptions.filter((s) => s.status === "ACTIVE").length,
      TRIAL: subscriptions.filter((s) => s.status === "TRIAL").length,
      LOW_USAGE: subscriptions.filter((s) => s.flaggedLowUsage).length,
      PAUSED: subscriptions.filter((s) => s.status === "PAUSED").length,
      CANCELLED: subscriptions.filter(
        (s) => s.status === "CANCELLED" || s.status === "VERIFIED_CANCELLED"
      ).length,
    };
  }, [subscriptions]);

  // Filtered subscriptions list
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      // Category filter chip
      if (selectedCategoryFilter && sub.category !== selectedCategoryFilter) {
        return false;
      }

      // Search filter
      const matchesSearch =
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Tab filter
      switch (filter) {
        case "ACTIVE":
          return sub.status === "ACTIVE";
        case "TRIAL":
          return sub.status === "TRIAL";
        case "LOW_USAGE":
          return sub.flaggedLowUsage;
        case "PAUSED":
          return sub.status === "PAUSED";
        case "CANCELLED":
          return sub.status === "CANCELLED" || sub.status === "VERIFIED_CANCELLED";
        default:
          return true;
      }
    });
  }, [subscriptions, filter, searchQuery, selectedCategoryFilter]);

  // Group filtered subscriptions into MonAI ListGroups by renewal horizon
  const groupedSubscriptions = useMemo(() => {
    const referenceDate = new Date();
    const today: SubscriptionItem[] = [];
    const thisWeek: SubscriptionItem[] = [];
    const thisMonth: SubscriptionItem[] = [];
    const later: SubscriptionItem[] = [];

    filteredSubscriptions.forEach((sub) => {
      const days = getDaysUntil(sub.nextRenewalDate, referenceDate);
      if (days <= 0) today.push(sub);
      else if (days <= 7) thisWeek.push(sub);
      else if (days <= 30) thisMonth.push(sub);
      else later.push(sub);
    });

    const groups: { title: string; subs: SubscriptionItem[] }[] = [];

    if (today.length > 0) groups.push({ title: "Renews Today / Overdue", subs: today });
    if (thisWeek.length > 0) groups.push({ title: "This Week", subs: thisWeek });
    if (thisMonth.length > 0) groups.push({ title: "This Month", subs: thisMonth });
    if (later.length > 0) groups.push({ title: "Later", subs: later });

    return groups;
  }, [filteredSubscriptions]);

  const router = useRouter();
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscription?")) {
      await deleteSubscription(id);
      router.refresh();
    }
  };

  const formatCompactValue = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toFixed(0);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      {/* Onboarding Modal for New Users */}
      <OnboardingModal isOpen={!!showOnboarding} onClose={() => {}} />

      {/* Hero TotalBlock */}
      <HeroStats
        monthlyTotal={spendSummary.monthlyTotal}
        annualTotal={spendSummary.annualTotal}
        currency={currency}
        monthlyBudget={monthlyBudget}
        potentialMonthlySavings={leaks.potentialMonthlySavings}
        activeCount={spendSummary.activeCount}
      />

      {/* Unified MonAI Single-Card Delicate Category BarChart */}
      {categoryBarData.items.length > 0 && (
        <div className="bg-[var(--surface)] rounded-[28px] p-5 border border-[var(--border)] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] opacity-60">
              Category Spend
            </h3>
            {selectedCategoryFilter && (
              <MonaiPill
                variant="coral"
                onClick={() => setSelectedCategoryFilter(null)}
                className="text-[11px] font-extrabold py-0.5 px-2.5"
              >
                Filter: {selectedCategoryFilter} ⊗
              </MonaiPill>
            )}
          </div>

          {/* All category thin bars sitting side-by-side inside ONE unified card */}
          <div className="flex items-end justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categoryBarData.items.map((cat) => {
              const heightPercent = Math.max(Math.round((cat.total / categoryBarData.maxTotal) * 100), 15);
              const isSelected = selectedCategoryFilter === cat.category;

              return (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() => {
                    if (isSelected) setSelectedCategoryFilter(null);
                    else setSelectedCategoryFilter(cat.category);
                  }}
                  className={`flex flex-col items-center gap-1.5 flex-1 min-w-[56px] transition-all duration-150 monai-press active:scale-95 group p-1.5 rounded-2xl ${
                    isSelected ? "bg-white/10 ring-1 ring-[var(--coral)]" : "hover:bg-white/5"
                  }`}
                >
                  {/* Amount label */}
                  <span className="text-[10px] font-black text-[var(--text-secondary)]">
                    {formatCompactValue(cat.total)}
                  </span>

                  {/* Thin, delicate vertical bar */}
                  <div className="w-2.5 sm:w-3.5 h-24 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] overflow-hidden flex flex-col justify-end p-[1.5px]">
                    <div
                      className={`w-full rounded-full transition-all duration-300 ${
                        isSelected ? "bg-[var(--coral)]" : "bg-[var(--green)] group-hover:bg-[var(--coral)]"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Emoji Icon & Label */}
                  <span className="text-sm mt-0.5">{cat.icon}</span>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] truncate max-w-[54px] text-center">
                    {cat.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Attention Section (Expiring trials & upcoming renewals) */}
      <AttentionSection subscriptions={subscriptions} currency={currency} />

      {/* Subscriptions List Control Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Your Subscriptions</h2>

          {/* Search Box MonAI style */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search provider, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-[var(--text-placeholder)] shadow-inner"
            />
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <SubscriptionFilterTabs currentFilter={filter} onFilterChange={setFilter} counts={counts} />

        {/* ListGroups grouped by renewal date */}
        {groupedSubscriptions.length === 0 ? (
          <div className="text-center py-20 bg-[var(--surface)] rounded-[32px] border border-[var(--border)] p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-3xl mx-auto shadow-sm">
              🍿
            </div>
            <h3 className="font-black text-[var(--text-primary)] text-lg">No subscriptions found</h3>
            <p className="text-xs font-bold text-[var(--text-secondary)] max-w-sm mx-auto">
              {searchQuery
                ? `No results matching "${searchQuery}". Try adjusting your search.`
                : "You don't have any subscriptions in this view yet."}
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingSub(null);
                setIsModalOpen(true);
              }}
              className="mt-2 px-5 py-2.5 rounded-full bg-[var(--coral)] text-white text-xs font-black shadow-lg hover:opacity-90 transition inline-flex items-center gap-2 monai-press"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add your first subscription
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedSubscriptions.map((group) => (
              <div key={group.title} className="space-y-2.5">
                {/* Clean, subtle section header (NO pill, NO Group Total) */}
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)] opacity-60 px-1 pt-2">
                  {group.title} ({group.subs.length})
                </h3>

                {/* Subscriptions Grid inside group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {group.subs.map((sub) => (
                    <SubscriptionCard
                      key={sub.id}
                      subscription={sub}
                      currency={currency}
                      onEdit={(subToEdit) => {
                        setEditingSub(subToEdit);
                        setIsModalOpen(true);
                      }}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (MonAI Coral 72px FAB) */}
      <MonaiFAB
        onClick={() => {
          setEditingSub(null);
          setIsModalOpen(true);
        }}
      />

      {/* Add / Edit Subscription Fullscreen Sheet */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subscriptionToEdit={editingSub}
        currency={currency}
      />
    </div>
  );
}
