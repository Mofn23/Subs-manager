"use client";

import { MonaiAmountPill } from "@/components/ui/MonaiAmountPill";
import { MonaiAvatar } from "@/components/ui/MonaiAvatar";
import { MonaiButton } from "@/components/ui/MonaiButton";
import { calculateMonthlyEquivalent, detectSubscriptionLeaks, formatCurrency, getAutoEmoji } from "@/lib/financials";
import { getLocalSubscriptions, getLocalUserPrefs } from "@/lib/storage";
import { PieChart } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function InsightsView({ subscriptions: initialSubs = [] }: { subscriptions?: any[] }) {
  const [subsList, setSubsList] = useState(initialSubs);
  const [userPrefs, setUserPrefs] = useState({ currency: "COP" });

  useEffect(() => {
    const handleUpdate = () => {
      setSubsList(getLocalSubscriptions());
      setUserPrefs(getLocalUserPrefs());
    };
    handleUpdate();
    window.addEventListener("storage_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("storage_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const currency = userPrefs.currency || "COP";
  const subscriptions = subsList.length > 0 ? subsList : initialSubs;

  const activeSubs = useMemo(() => {
    return subscriptions.filter(
      (s) => s.status === "ACTIVE" || s.status === "TRIAL" || s.status === "TO_CANCEL"
    );
  }, [subscriptions]);

  const leaks = useMemo(() => {
    return detectSubscriptionLeaks(subscriptions);
  }, [subscriptions]);

  // Total monthly spend across active
  const totalMonthlySpend = useMemo(() => {
    return activeSubs.reduce((acc, sub) => {
      return acc + calculateMonthlyEquivalent(sub.price, sub.billingCycle, sub.customIntervalMonths);
    }, 0);
  }, [activeSubs]);

  // Top 5 most expensive subscriptions
  const top5Subscriptions = useMemo(() => {
    return [...activeSubs]
      .map((s) => ({
        ...s,
        monthlyPrice: calculateMonthlyEquivalent(s.price, s.billingCycle, s.customIntervalMonths),
      }))
      .sort((a, b) => b.monthlyPrice - a.monthlyPrice)
      .slice(0, 5);
  }, [activeSubs]);

  // Category Spend Distribution
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    activeSubs.forEach((sub) => {
      const monthlyCost = calculateMonthlyEquivalent(sub.price, sub.billingCycle, sub.customIntervalMonths);
      const cat = sub.category || "Other";
      map[cat] = (map[cat] || 0) + monthlyCost;
    });

    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalMonthlySpend > 0 ? (amount / totalMonthlySpend) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeSubs, totalMonthlySpend]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24">
      {/* Header MonAI Card */}
      <div className="bg-[var(--surface)] rounded-[32px] p-8 border border-[var(--border)] shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">
          <PieChart className="w-4 h-4 text-[var(--coral)] stroke-[2.5]" />
          Financial Intelligence
        </div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Subscription Insights</h1>
        <p className="text-xs font-bold text-[var(--text-secondary)] mt-1">
          Deep visibility into expense distribution, top costs, and potential monthly savings.
        </p>
      </div>

      {/* MonAI Subscription Leak Detector ListGroup */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--coral)] opacity-80 px-1">
          👻 Money Leaks Detected ({leaks.lowUsageSubs.length + leaks.expiringTrials.length})
        </h3>

        {leaks.lowUsageSubs.length === 0 && leaks.expiringTrials.length === 0 ? (
          <div className="p-8 rounded-[32px] bg-[var(--surface)] border border-[var(--border)] text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-3xl mx-auto">
              ✨
            </div>
            <h3 className="font-black text-[var(--text-primary)] text-base">Your portfolio is optimized!</h3>
            <p className="text-xs font-bold text-[var(--text-secondary)] max-w-sm mx-auto">
              No low-usage subscriptions or expiring trials detected draining your budget.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {leaks.lowUsageSubs.map((sub) => {
              const monthlyCost = calculateMonthlyEquivalent(sub.price, sub.billingCycle, sub.customIntervalMonths);

              return (
                <div
                  key={sub.id}
                  className="bg-[var(--surface)] rounded-[24px] p-4 sm:p-5 border border-[var(--coral)]/40 shadow-xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <MonaiAvatar emoji="👻" size="md" isRecurring={true} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate">
                          {sub.name}
                        </h4>
                        <span className="text-xs font-bold text-[var(--coral)]">
                          • Review / Low Usage
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5 truncate">
                        {sub.provider} • Underutilized expense
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <MonaiAmountPill
                      amount={`${formatCurrency(monthlyCost, currency)}/mo`}
                      prefix="⊖"
                      isPositive={false}
                    />

                    <Link href="/cancellation">
                      <MonaiButton variant="coral" size="sm">
                        Cancel & Save
                      </MonaiButton>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Top 5 Expensive + Category Spend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 5 Most Expensive */}
        <div className="bg-[var(--surface)] rounded-[32px] p-6 sm:p-8 border border-[var(--border)] shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[var(--text-primary)] text-base">Top 5 Expensive</h3>
            <span className="text-xs font-bold text-[var(--text-secondary)]">Highest monthly cost</span>
          </div>

          <div className="space-y-3">
            {top5Subscriptions.map((sub, idx) => {
              const icon = sub.icon || getAutoEmoji(sub.name, sub.category);
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3.5 rounded-[20px] bg-[var(--surface-elevated)] border border-[var(--border-subtle)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[var(--tag)] text-[var(--text-primary)] font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <MonaiAvatar emoji={icon} size="sm" isRecurring={false} />
                    <div className="min-w-0">
                      <div className="font-black text-sm text-[var(--text-primary)] truncate">{sub.name}</div>
                      <div className="text-[11px] font-bold text-[var(--text-secondary)] truncate">{sub.category}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-[var(--text-primary)]">
                      {formatCurrency(sub.monthlyPrice, currency)}/mo
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Spend Breakdown */}
        <div className="bg-[var(--surface)] rounded-[32px] p-6 sm:p-8 border border-[var(--border)] shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-[var(--text-primary)] text-base">Spend by Category</h3>
            <span className="text-xs font-bold text-[var(--text-secondary)]">Share of total</span>
          </div>

          <div className="space-y-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-[var(--text-primary)]">{cat.category}</span>
                  <span className="text-[var(--text-secondary)]">
                    {formatCurrency(cat.amount, currency)}/mo ({Math.round(cat.percentage)}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[var(--surface-elevated)] overflow-hidden p-0.5 border border-[var(--border-subtle)]">
                  <div
                    className="h-full bg-[var(--green)] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
