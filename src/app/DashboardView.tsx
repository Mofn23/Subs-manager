"use client";

import { deleteSubscription } from "@/app/actions/subscriptions";
import { AttentionSection } from "@/components/dashboard/AttentionSection";
import { HeroStats } from "@/components/dashboard/HeroStats";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
import { FilterStatus, SubscriptionFilterTabs } from "@/components/dashboard/SubscriptionFilterTabs";
import { OnboardingModal } from "@/components/modals/OnboardingModal";
import { SubscriptionModal } from "@/components/modals/SubscriptionModal";
import { calculateSpendSummary, detectSubscriptionLeaks, SubscriptionItem } from "@/lib/financials";
import { Plus, Search, Sparkles } from "lucide-react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);

  const currency = session?.user?.currency || "$";
  const monthlyBudget = session?.user?.monthlyBudget;
  const showOnboarding = session?.user && !session.user.onboarded;

  // Process data
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
  }, [subscriptions, filter, searchQuery]);

  const router = useRouter();
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscription?")) {
      await deleteSubscription(id);
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      {/* Onboarding Modal for New Users */}
      <OnboardingModal isOpen={!!showOnboarding} onClose={() => {}} />

      {/* Hero Stats */}
      <HeroStats
        monthlyTotal={spendSummary.monthlyTotal}
        annualTotal={spendSummary.annualTotal}
        currency={currency}
        monthlyBudget={monthlyBudget}
        potentialMonthlySavings={leaks.potentialMonthlySavings}
        activeCount={spendSummary.activeCount}
      />

      {/* Attention Section (Expiring trials & upcoming renewals) */}
      <AttentionSection subscriptions={subscriptions} currency={currency} />

      {/* Subscriptions List Control Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-apple-text dark:text-white tracking-tight">Your Subscriptions</h2>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-apple-tertiary dark:text-neutral-400" />
              <input
                type="text"
                placeholder="Search provider, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#16161A] border border-apple-border dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-apple-text dark:text-white shadow-sm placeholder:text-apple-tertiary dark:placeholder:text-neutral-500"
              />
            </div>

            {/* Add Subscription Button */}
            <button
              onClick={() => {
                setEditingSub(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-1.5 rounded-xl bg-apple-text dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-90 transition flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Subscription
            </button>
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <SubscriptionFilterTabs currentFilter={filter} onFilterChange={setFilter} counts={counts} />

        {/* Cards Grid */}
        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#16161A] rounded-3xl border border-apple-border dark:border-white/10 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-apple-bg dark:bg-neutral-800 flex items-center justify-center text-apple-tertiary dark:text-neutral-400 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-apple-text dark:text-white text-sm">No subscriptions found</h3>
            <p className="text-xs text-apple-secondary dark:text-neutral-400 max-w-sm mx-auto">
              {searchQuery
                ? `No results matching "${searchQuery}". Try adjusting your search query.`
                : "You don't have any subscriptions in this view yet."}
            </p>
            <button
              onClick={() => {
                setEditingSub(null);
                setIsModalOpen(true);
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-apple-accent-soft dark:bg-blue-500/20 text-apple-accent dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-500/30 transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add your first subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSubscriptions.map((sub) => (
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
        )}
      </div>

      {/* Add / Edit Subscription Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subscriptionToEdit={editingSub}
        currency={currency}
      />
    </div>
  );
}
